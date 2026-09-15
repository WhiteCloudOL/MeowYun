<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  freshPostcard,
  clampPostcardObject,
  hitPostcard,
  postcardHeight,
  postcardWidth,
  renderPostcard,
  type PostcardDraft,
  type StickerKind,
} from '@/utils/postcard'
import { usePocket } from '@/composables/usePocket'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import StampArt from '@/components/scene/StampArt.vue'
const { data, earn, stampCatalog } = usePocket()
const canvas = ref<HTMLCanvasElement>()
const fileInput = ref<HTMLInputElement>()
const draft = ref<PostcardDraft>(freshPostcard())
const selected = ref('message')
const active = computed(() => draft.value.objects.find((o) => o.id === selected.value))
const images = new Map<string, ImageBitmap>()
const undo = ref<string[]>([]),
  redo = ref<string[]>([])
const feedback = ref('草稿在本页临时保留，离开前请导出。')
const busy = ref(false)
const importing = ref(false)
const overObject = ref(false),
  dragging = ref(false)
let alive = true
let drag: { x: number; y: number; startX: number; startY: number; id: number } | undefined
function snapshot() {
  undo.value.push(JSON.stringify(draft.value))
  if (undo.value.length > 40) undo.value.shift()
  redo.value = []
}
function change(action: () => void) {
  snapshot()
  action()
}
function history(direction: 'undo' | 'redo') {
  const from = direction === 'undo' ? undo : redo,
    to = direction === 'undo' ? redo : undo
  const value = from.value.pop()
  if (value) {
    to.value.push(JSON.stringify(draft.value))
    draft.value = JSON.parse(value)
    selected.value = draft.value.objects.at(-1)?.id ?? ''
  }
}
function updateText(event: Event) {
  if (active.value) {
    active.value.text = (event.target as HTMLTextAreaElement).value
    clampPostcardObject(active.value, images, canvas.value?.getContext('2d') ?? undefined)
  }
}
function draw() {
  const ctx = canvas.value?.getContext('2d')
  if (ctx) renderPostcard(ctx, draft.value, images, selected.value)
}
watch(
  [draft, selected],
  () => {
    void nextTick(draw)
  },
  { deep: true },
)
function add(kind: StickerKind, text?: string, imageId?: string) {
  if (draft.value.objects.length >= 25) {
    feedback.value = '最多放 25 个图层，请先删除一些。'
    return
  }
  snapshot()
  const object = {
    id: crypto.randomUUID(),
    kind,
    x: 600,
    y: 500,
    scale: 1,
    rotation: 0,
    opacity: 1,
    text,
    imageId,
  }
  draft.value.objects.push(object)
  selected.value = object.id
}
function adjust(field: 'x' | 'y' | 'scale' | 'rotation' | 'opacity', value: number) {
  if (!active.value) return
  const ranges = {
    x: [0, 1200],
    y: [0, 800],
    scale: [0.3, 3],
    rotation: [-180, 180],
    opacity: [0.1, 1],
  }
  const range = ranges[field]
  change(() => {
    if (active.value) {
      active.value[field] = Math.min(range[1]!, Math.max(range[0]!, value))
      clampPostcardObject(active.value, images, canvas.value?.getContext('2d') ?? undefined)
    }
  })
}
function remove() {
  change(() => {
    draft.value.objects = draft.value.objects.filter((o) => o.id !== selected.value)
    selected.value = draft.value.objects.at(-1)?.id ?? ''
  })
}
function layer(offset: number) {
  const index = draft.value.objects.findIndex((o) => o.id === selected.value),
    next = index + offset
  if (next < 0 || next >= draft.value.objects.length) return
  change(() => {
    const [item] = draft.value.objects.splice(index, 1)
    if (item) draft.value.objects.splice(next, 0, item)
  })
}
function point(event: PointerEvent) {
  const rect = canvas.value!.getBoundingClientRect()
  return {
    x: ((event.clientX - rect.left) / rect.width) * 1200,
    y: ((event.clientY - rect.top) / rect.height) * 800,
  }
}
function start(event: PointerEvent) {
  if (event.button !== 0) return
  const p = point(event),
    item = hitPostcard(draft.value, p.x, p.y, images, canvas.value?.getContext('2d') ?? undefined)
  if (!item) {
    selected.value = ''
    return
  }
  selected.value = item.id
  dragging.value = true
  snapshot()
  drag = { x: p.x, y: p.y, startX: item.x, startY: item.y, id: event.pointerId }
  canvas.value?.setPointerCapture(event.pointerId)
}
function move(event: PointerEvent) {
  if (!drag) {
    const p = point(event)
    overObject.value = !!hitPostcard(
      draft.value,
      p.x,
      p.y,
      images,
      canvas.value?.getContext('2d') ?? undefined,
    )
    return
  }
  if (event.pointerId !== drag.id || !active.value) return
  const p = point(event)
  active.value.x = Math.max(0, Math.min(1200, Math.round(drag.startX + p.x - drag.x)))
  active.value.y = Math.max(0, Math.min(800, Math.round(drag.startY + p.y - drag.y)))
  clampPostcardObject(active.value, images, canvas.value?.getContext('2d') ?? undefined)
}
function end() {
  drag = undefined
  dragging.value = false
}
async function importImage(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || importing.value) return
  importing.value = true
  try {
    if (
      !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    )
      throw Error('请选择 5MB 以内的 PNG、JPEG 或 WebP 图片。')
    if (images.size >= 5) throw Error('本次编辑最多导入 5 张图片。')
    if (draft.value.objects.length >= 25) throw Error('最多放 25 个图层，请先删除一些。')
    const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer())
    const signature =
      (bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71) ||
      (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) ||
      (String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
        String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP')
    if (!signature) throw Error('文件内容不是支持的图片格式。')
    const image = await createImageBitmap(file)
    if (image.width > 4096 || image.height > 4096) {
      image.close()
      throw Error('图片宽高请保持在 4096px 以内。')
    }
    if (!alive) {
      image.close()
      return
    }
    // 解码期间仍可添加贴纸；再次检查上限，不能留下未进入草稿的孤立位图。
    if (draft.value.objects.length >= 25) {
      image.close()
      throw Error('最多放 25 个图层，请先删除一些。')
    }
    const id = crypto.randomUUID()
    images.set(id, image)
    add('image', undefined, id)
    feedback.value = '图片已在浏览器内导入，没有上传。'
  } catch (error) {
    feedback.value = error instanceof Error ? error.message : '图片无法读取。'
  } finally {
    importing.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}
async function exportPng() {
  busy.value = true
  try {
    await document.fonts.ready
    const output = document.createElement('canvas')
    output.width = postcardWidth
    output.height = postcardHeight
    const ctx = output.getContext('2d')
    if (!ctx) throw Error('当前浏览器无法导出图片。')
    renderPostcard(ctx, draft.value, images)
    const blob = await new Promise<Blob>((resolve, reject) =>
      output.toBlob((b) => (b ? resolve(b) : reject(Error('导出失败，请重试。'))), 'image/png'),
    )
    const url = URL.createObjectURL(blob),
      link = document.createElement('a')
    link.href = url
    link.download = '云上小屋-明信片.png'
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
    if (alive) {
      earn('postcard-export')
      feedback.value = 'PNG 已生成，1200 × 800px。可在下载目录打开。'
    }
  } catch (error) {
    feedback.value = error instanceof Error ? error.message : '导出没有成功。'
  } finally {
    busy.value = false
  }
}
// 只在画布内捕获指针，拖动之外仍能正常滚动；本地图片位图在离开工具时释放。
onMounted(() => {
  earn('workshop-visit')
  draw()
})
onBeforeUnmount(() => {
  alive = false
  for (const image of images.values()) image.close()
})
</script>
<template>
  <div class="postcard-view page-shell page-content">
    <header class="workshop-heading">
      <div>
        <RouterLink to="/lab" class="text-link">← 创意工坊</RouterLink>
        <h1>云朵明信片工坊</h1>
        <p>写句话，贴一点喜欢的，再把它带走。</p>
      </div>
      <span class="jelly-icon"><IconGlyph name="palette" :size="28" /></span>
    </header>
    <div class="postcard-workbench">
      <section class="postcard-preview" aria-label="明信片预览">
        <div class="canvas-mat">
          <canvas
            ref="canvas"
            :style="{ cursor: dragging ? 'grabbing' : overObject ? 'grab' : 'default' }"
            @pointerleave="overObject = false"
            :width="postcardWidth"
            :height="postcardHeight"
            aria-label="明信片画布；可点选或拖动图层，下方也有完整位置控制"
            @pointerdown="start"
            @pointermove="move"
            @pointerup="end"
            @pointercancel="end"
            @lostpointercapture="end"
          ></canvas>
        </div>
        <div class="editor-actions">
          <button type="button" class="chip" :disabled="!undo.length" @click="history('undo')">
            ↶ 撤销</button
          ><button type="button" class="chip" :disabled="!redo.length" @click="history('redo')">
            重做 ↷</button
          ><button
            type="button"
            class="chip"
            @click="
              change(() => {
                draft = freshPostcard()
                selected = 'message'
              })
            "
          >
            重置画面</button
          ><button type="button" class="cottage-button" :disabled="busy" @click="exportPng">
            {{ busy ? '正在绘制…' : '导出 PNG ↓' }}
          </button>
        </div>
        <p class="editor-status" role="status">{{ feedback }}</p>
        <p class="muted editor-note">
          图片仅在本页处理，不上传。预览中的虚线选框不会进入导出图片。
        </p>
      </section>
      <aside class="editor-panel" aria-label="明信片编辑工具">
        <h2>工作台上的工具</h2>
        <fieldset>
          <legend>挑一张纸</legend>
          <div class="template-options">
            <button
              v-for="item in [
                { id: 'cloud', label: '云端来信' },
                { id: 'ticket', label: '星夜车票' },
                { id: 'note', label: '手账便签' },
              ] as const"
              :key="item.id"
              type="button"
              class="chip"
              :aria-pressed="draft.template === item.id"
              @click="change(() => (draft.template = item.id))"
            >
              {{ item.label }}
            </button>
          </div>
          <div class="color-options">
            <button
              v-for="color in ['#fff9ef', '#ffe2ed', '#e1effb', '#eae3fb', '#e5f2e7']"
              :key="color"
              type="button"
              :style="{ background: color }"
              :aria-label="'纸张底色 ' + color"
              :aria-pressed="draft.background === color"
              @click="change(() => (draft.background = color))"
            ></button>
          </div>
        </fieldset>
        <fieldset>
          <legend>贴上原创小物</legend>
          <div class="sticker-options">
            <button
              v-for="sticker in [
                { kind: 'cloud', label: '云朵' },
                { kind: 'star', label: '星星' },
                { kind: 'flower', label: '小花' },
                { kind: 'heart', label: '爱心' },
                { kind: 'rainbow', label: '彩虹' },
                { kind: 'text', label: '文字' },
              ] as const"
              :key="sticker.kind"
              type="button"
              class="chip"
              @click="add(sticker.kind, sticker.kind === 'text' ? '写一句喜欢的话' : undefined)"
            >
              {{ sticker.label }} ＋</button
            ><button type="button" class="chip" :disabled="importing" @click="fileInput?.click()">
              {{ importing ? '正在读取图片…' : '本地图片 ＋' }}</button
            ><input
              ref="fileInput"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              @change="importImage"
            />
          </div>
        </fieldset>
        <fieldset>
          <legend>我的漫游印章</legend>
          <p v-if="!data.stamps.length" class="muted">收藏喜欢的内容，就能获得第一枚印章。</p>
          <div class="stamp-options">
            <button
              v-for="stamp in data.stamps"
              :key="stamp.id"
              type="button"
              :aria-label="'贴上' + stampCatalog.find((s) => s.id === stamp.id)?.label"
              @click="add('stamp', stampCatalog.find((s) => s.id === stamp.id)?.label)"
            >
              <StampArt :id="stamp.id" />
            </button>
          </div>
          <RouterLink to="/pocket" class="text-link">看看我的护照 →</RouterLink>
        </fieldset>
        <fieldset>
          <legend>图层 · 点击选择</legend>
          <div class="layer-list">
            <button
              v-for="(item, index) in draft.objects"
              :key="item.id"
              type="button"
              class="chip"
              :aria-pressed="selected === item.id"
              @click="selected = item.id"
            >
              {{ index + 1 }} ·
              {{
                item.kind === 'text'
                  ? '文字'
                  : item.kind === 'stamp'
                    ? '印章'
                    : item.kind === 'image'
                      ? '图片'
                      : '贴纸'
              }}
            </button>
          </div>
        </fieldset>
        <fieldset v-if="active">
          <legend>调整选中的小物</legend>
          <label v-if="active.kind === 'text'" class="editor-label"
            >短文字（最多 140 字）<textarea
              :value="active.text"
              maxlength="140"
              rows="3"
              @focus="snapshot"
              @input="updateText"
            ></textarea>
          </label>
          <div class="position-controls">
            <span>位置</span
            ><button
              type="button"
              class="icon-button"
              aria-label="向左移动"
              @click="adjust('x', active.x - 20)"
            >
              ←</button
            ><button
              type="button"
              class="icon-button"
              aria-label="向上移动"
              @click="adjust('y', active.y - 20)"
            >
              ↑</button
            ><button
              type="button"
              class="icon-button"
              aria-label="向下移动"
              @click="adjust('y', active.y + 20)"
            >
              ↓</button
            ><button
              type="button"
              class="icon-button"
              aria-label="向右移动"
              @click="adjust('x', active.x + 20)"
            >
              →
            </button>
          </div>
          <div
            v-for="setting in [
              { key: 'scale', name: '大小', step: 0.1 },
              { key: 'rotation', name: '旋转', step: 10 },
              { key: 'opacity', name: '透明度', step: 0.1 },
            ] as const"
            :key="setting.key"
            class="stepper-row"
          >
            <span>{{ setting.name }}</span
            ><button
              type="button"
              class="icon-button"
              :aria-label="'减小' + setting.name"
              @click="adjust(setting.key, active[setting.key] - setting.step)"
            >
              −</button
            ><output>{{
              setting.key === 'rotation'
                ? active.rotation + '°'
                : Math.round(active[setting.key] * 100) + '%'
            }}</output
            ><button
              type="button"
              class="icon-button"
              :aria-label="'增大' + setting.name"
              @click="adjust(setting.key, active[setting.key] + setting.step)"
            >
              ＋
            </button>
          </div>
          <div class="template-options">
            <button type="button" class="chip" @click="layer(1)">上一层</button
            ><button type="button" class="chip" @click="layer(-1)">下一层</button
            ><button type="button" class="chip" @click="remove">删除图层</button>
          </div>
        </fieldset>
      </aside>
    </div>
  </div>
</template>
<style scoped>
.workshop-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
}
.workshop-heading > svg {
  width: 7rem;
  transform: rotate(12deg);
}
.workshop-heading h1 {
  font-size: var(--text-2xl);
}
.workshop-heading p {
  color: var(--color-text-secondary);
  margin-top: 0.6rem;
}
.postcard-workbench {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 20rem;
  gap: 2rem;
  align-items: start;
}
.postcard-preview {
  position: sticky;
  top: var(--header-clearance);
  min-width: 0;
}
.canvas-mat {
  padding: 2rem;
  background: linear-gradient(140deg, rgb(var(--tone-blue) / 0.22), var(--color-surface-glass));
  border: 1px solid var(--color-rim);
  border-radius: var(--radius-large);
  box-shadow: var(--shadow-card);
}
canvas {
  display: block;
  width: 100%;
  height: auto;
  box-shadow: 0 6px 18px rgb(var(--tone-blue) / 0.3);
  touch-action: none;
}
.editor-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 2rem;
  align-items: center;
}
.editor-actions > .cottage-button {
  margin-left: auto;
}
.editor-status {
  margin-top: 1rem;
  font-size: var(--text-sm);
  color: var(--color-link);
}
.editor-note {
  font-size: var(--text-xs);
  margin-top: 0.5rem;
}
.editor-panel {
  padding: 1.3rem;
  border: 1px solid var(--color-rim);
  border-radius: var(--radius-large);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}
.editor-panel h2 {
  font-size: var(--text-lg);
  margin-bottom: 1.2rem;
}
.editor-panel fieldset {
  border: 0;
  border-top: 1px dashed var(--color-border);
  padding: 1rem 0;
  min-width: 0;
}
.editor-panel legend {
  font-size: var(--text-sm);
  font-weight: 700;
  padding-right: 0.6rem;
}
.template-options,
.sticker-options,
.layer-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.editor-panel .chip {
  font-size: var(--text-xs);
}
.color-options {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.8rem;
}
.color-options button {
  width: 44px;
  height: 44px;
  border: 1px solid var(--color-border);
  border-radius: 50%;
}
.color-options [aria-pressed='true'] {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}
.stamp-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.stamp-options > button {
  border: 0;
  background: transparent;
  padding: 0.5rem;
}
.stamp-options :deep(.stamp-art) {
  width: 5rem;
}
.editor-label {
  font-size: var(--text-sm);
}
.editor-label textarea {
  display: block;
  width: 100%;
  padding: 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background);
  margin: 0.5rem 0 1rem;
  resize: vertical;
}
.position-controls {
  display: flex;
  gap: 0.35rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 0.8rem;
  font-size: var(--text-xs);
}
.stepper-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
  margin: 0.5rem 0;
  font-size: var(--text-sm);
}
.stepper-row output {
  min-width: 3rem;
  text-align: center;
}
.editor-panel fieldset > .template-options:last-child {
  margin-top: 0.7rem;
}
.editor-panel .muted {
  font-size: var(--text-xs);
}
@media (max-width: 1000px) {
  .postcard-workbench {
    grid-template-columns: 1fr;
  }
  .postcard-preview {
    position: relative;
    top: auto;
  }
  .editor-panel {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  .editor-panel h2 {
    grid-column: 1/-1;
  }
}
@media (max-width: 600px) {
  .canvas-mat {
    padding: 0.7rem;
    border-width: 2px;
  }
  .postcard-workbench {
    gap: 1.5rem;
  }
  .editor-panel {
    grid-template-columns: 1fr;
  }
  .workshop-heading > svg {
    width: 4.5rem;
  }
  .workshop-heading p {
    font-size: var(--text-sm);
  }
  .editor-actions > .cottage-button {
    margin-left: 0;
  }
  .editor-actions .chip {
    padding: 0.35rem 0.65rem;
    font-size: var(--text-xs);
  }
}
</style>

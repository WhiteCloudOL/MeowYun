<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import { usePocket } from '@/composables/usePocket'
import { useClipboard } from '@/composables/useClipboard'
import { contrast, hexToHsl, hslToHex, readableInk, relatedPalette, validHex } from '@/utils/colors'
const presets = [
  { name: '草莓奶霜', colors: ['#f1b5ca', '#a8cdf4', '#97dacf', '#cdbcec', '#fff0dc'] },
  { name: '薄荷汽水', colors: ['#b7e5d2', '#b3dded', '#e0d5f2', '#f2c9d4', '#fff2cf'] },
  { name: '暮色果冻', colors: ['#8c739f', '#688aa8', '#76a39b', '#c990a7', '#edd3c1'] },
]
const colors = ref<string[]>([...presets[0]!.colors]),
  locked = ref([false, false, false, false, false])
const selected = ref(0),
  hex = ref(colors.value[0]!),
  name = ref('我的奶霜配色'),
  status = ref('')
const { savePalette } = usePocket(),
  { copy, message, manualText } = useClipboard()
const current = computed(() => colors.value[selected.value]!)
const hsl = computed(() => hexToHsl(current.value))
const css = computed(
  () =>
    ':root {\n' +
    colors.value.map((c, i) => '  --palette-' + (i + 1) + ': ' + c + ';').join('\n') +
    '\n}',
)
const sample = computed(() => ({
  '--sample-color': current.value,
  '--sample-ink': readableInk(current.value),
}))
function select(index: number) {
  selected.value = index
  hex.value = colors.value[index]!
  status.value = ''
}
function apply(next: string[]) {
  colors.value = colors.value.map((c, i) => (locked.value[i] ? c : next[i]!))
  hex.value = current.value
  status.value = '已更新未锁定的颜色。'
}
function setHex() {
  if (!validHex(hex.value)) {
    status.value = '请输入完整 HEX，例如 #f1b5ca。'
    return
  }
  colors.value[selected.value] = hex.value.toLowerCase()
  status.value = '颜色已更新。'
}
function adjust(channel: number, event: Event) {
  const values = [...hsl.value] as [number, number, number]
  values[channel] = Number((event.target as HTMLInputElement).value)
  colors.value[selected.value] = hslToHex(...values)
  hex.value = current.value
}
function save() {
  try {
    status.value = savePalette(name.value.trim() || '未命名配色', [...colors.value])
      ? '这组颜色已存入口袋。'
      : '这组颜色暂存在本次访问，请导出口袋备份。'
  } catch (e) {
    status.value = e instanceof Error ? e.message : '保存失败。'
  }
}
function download() {
  const url = URL.createObjectURL(new Blob([css.value], { type: 'text/css' }))
  const a = document.createElement('a')
  a.href = url
  a.download = 'my-palette.css'
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  status.value = '已生成 CSS 文件。'
}
</script>
<template>
  <div class="palette-view page-shell page-content">
    <header class="page-heading">
      <RouterLink to="/lab" class="text-link">← 回到工坊</RouterLink>
      <h1>配色调制器</h1>
      <p>留住喜欢的一抹颜色，再调出它的好朋友。</p>
    </header>
    <div class="palette-presets">
      <button
        v-for="preset in presets"
        :key="preset.name"
        class="chip"
        type="button"
        @click="apply(preset.colors)"
      >
        {{ preset.name }}</button
      ><BaseButton
        variant="secondary"
        @click="apply(relatedPalette(Math.floor(Math.random() * 360)))"
        >调一组新颜色 <IconGlyph name="sparkles"
      /></BaseButton>
    </div>
    <p class="muted palette-explanation">
      以类似色和柔和对比色组合。锁定会保留颜色，选中后仍可手动微调；只改变下方样张。
    </p>
    <div class="paint-pots">
      <article
        v-for="(color, i) in colors"
        :key="i"
        :style="{ '--paint': color, '--paint-ink': readableInk(color) }"
      >
        <button
          class="paint-pot"
          :aria-pressed="selected === i"
          :aria-label="'选择颜色 ' + (i + 1) + ' ' + color"
          @click="select(i)"
        >
          <span>{{ color.toUpperCase() }}</span
          ><IconGlyph v-if="selected === i" name="check" /></button
        ><button
          class="chip"
          :aria-pressed="locked[i]"
          :aria-label="(locked[i] ? '解锁' : '锁定') + '颜色 ' + (i + 1)"
          @click="locked[i] = !locked[i]"
        >
          {{ locked[i] ? '已锁定' : '锁定' }}
        </button>
      </article>
    </div>
    <div class="palette-workspace">
      <section class="paper palette-edit" aria-labelledby="color-edit">
        <h2 id="color-edit">微调第 {{ selected + 1 }} 种颜色</h2>
        <form @submit.prevent="setHex">
          <label class="field-label"
            >HEX 颜色<input
              v-model="hex"
              class="milk-input"
              maxlength="7"
              spellcheck="false"
              autocomplete="off"
              :aria-invalid="!validHex(hex)" /></label
          ><BaseButton type="submit" variant="secondary">应用颜色</BaseButton>
        </form>
        <label v-for="(label, i) in ['色相', '饱和度', '明度']" :key="label" class="range-label"
          >{{ label }} <output>{{ hsl[i] }}{{ i === 0 ? '°' : '%' }}</output
          ><input
            class="milk-range"
            type="range"
            :aria-label="label"
            :min="0"
            :max="i === 0 ? 359 : 100"
            :value="hsl[i]"
            @input="adjust(i, $event)" /></label
        ><button class="text-link" type="button" @click="copy(current)">复制 {{ current }}</button>
      </section>
      <section class="palette-sample paper" :style="sample" aria-labelledby="palette-preview">
        <span class="sample-chip">样张预览</span>
        <h2 id="palette-preview">把好颜色留给日常。</h2>
        <p>这一小块面板只预览当前颜色。文字根据底色选择深色或白色。</p>
        <button class="sample-button" type="button" @click="copy(current)">
          复制这个颜色 <IconGlyph name="arrow-right" />
        </button>
        <p class="contrast-note">
          文字对比度 {{ contrast(current, readableInk(current)).toFixed(2) }} : 1 ·
          {{
            contrast(current, readableInk(current)) >= 4.5
              ? '达到普通文字 4.5:1'
              : '低于普通文字 4.5:1，请调整明度'
          }}
        </p>
      </section>
    </div>
    <section class="palette-export">
      <label class="field-label"
        >给配色起个名字<input v-model="name" maxlength="40" class="milk-input"
      /></label>
      <div class="tool-actions">
        <BaseButton @click="save">保存到口袋 <IconGlyph name="heart" /></BaseButton
        ><button class="chip" @click="copy(css)">复制 CSS</button
        ><button class="chip" @click="download">导出 CSS 文件</button>
      </div>
      <p role="status">{{ status }} {{ message }}</p>
      <textarea
        v-if="manualText"
        class="milk-input"
        aria-label="手动复制内容"
        readonly
        :value="manualText"
      />
    </section>
  </div>
</template>
<style scoped>
.palette-presets,
.tool-actions {
  display: flex;
  gap: 0.7rem;
  flex-wrap: wrap;
  align-items: center;
}
.palette-explanation {
  font-size: var(--text-sm);
  margin: 1rem 0 2rem;
}
.paint-pots {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}
.paint-pots article {
  display: grid;
  justify-items: center;
  gap: 0.7rem;
  min-width: 0;
}
.paint-pot {
  width: 100%;
  min-height: 155px;
  padding: 1rem;
  border: 1px solid var(--color-rim);
  border-radius: 37% 40% 30% 34% / 25% 30% 45% 40%;
  background: var(--paint);
  color: var(--paint-ink);
  box-shadow:
    inset 0 3px 3px #ffffff70,
    0 10px 22px -14px var(--paint);
  display: grid;
  place-content: center;
  gap: 1rem;
  justify-items: center;
  font: 600 var(--text-sm) var(--font-mono);
}
.paint-pot[aria-pressed='true'] {
  outline: 3px solid var(--color-focus);
  outline-offset: 5px;
}
.palette-workspace {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}
.palette-workspace h2 {
  font-size: var(--text-xl);
  margin-bottom: 1rem;
}
.palette-edit form {
  display: flex;
  gap: 0.7rem;
  align-items: end;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.palette-edit .field-label {
  flex: 1;
  min-width: 8rem;
}
.range-label {
  display: block;
  font-size: var(--text-sm);
  margin: 0.7rem 0;
}
.range-label output {
  float: right;
  font-family: var(--font-mono);
}
.palette-sample {
  align-self: center;
  background: var(--sample-color);
  color: var(--sample-ink);
  border-radius: var(--radius-jelly);
}
.sample-chip {
  display: inline-flex;
  padding: 0.25rem 0.75rem;
  border: 1px solid currentColor;
  border-radius: 99px;
  margin-bottom: 1.5rem;
  font-size: var(--text-sm);
}
.sample-button {
  display: flex;
  gap: 0.7rem;
  align-items: center;
  min-height: 46px;
  padding: 0.7rem 1.2rem;
  background: transparent;
  color: inherit;
  border: 1px solid currentColor;
  border-radius: 99px;
  margin: 1.5rem 0;
}
.contrast-note {
  font-size: var(--text-sm);
}
.palette-export {
  margin-top: 2rem;
}
.palette-export > .field-label {
  max-width: 28rem;
  margin-bottom: 1rem;
}
.palette-export > p {
  margin: 1rem 0;
  min-height: 1.75em;
}
@media (max-width: 700px) {
  .paint-pots {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.5rem 1rem;
  }
  .paint-pot {
    min-height: 110px;
    font-size: 0.8rem;
  }
  .palette-workspace {
    grid-template-columns: 1fr;
    gap: 1.2rem;
  }
}
</style>

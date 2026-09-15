<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
const props = defineProps<{ html: string }>()
const rendered = ref<HTMLElement>()
const lightbox = ref<HTMLDialogElement>()
const preview = ref<{ src: string; alt: string }>()
const status = ref('')
const manualCode = ref('')
const resets = new Map<HTMLButtonElement, ReturnType<typeof setTimeout>>()
let opener: HTMLElement | undefined
let alive = true
async function handleClick(event: MouseEvent) {
  const target = event.target
  if (!(target instanceof Element)) return
  const imageButton = target.closest<HTMLButtonElement>('[data-image-view]')
  if (imageButton) {
    const img = imageButton.querySelector('img')
    if (img && !img.hidden) {
      opener = imageButton
      preview.value = { src: img.currentSrc || img.src, alt: img.alt }
      await nextTick()
      lightbox.value?.showModal()
    }
    return
  }
  const button = target.closest<HTMLButtonElement>('[data-code-copy]')
  if (!button) return
  const code = button.closest('.markdown-code')?.querySelector('code')?.textContent ?? ''
  if (resets.has(button)) clearTimeout(resets.get(button))
  manualCode.value = ''
  try {
    await navigator.clipboard.writeText(code)
    if (!alive) return
    button.textContent = '已复制'
    status.value = '代码已复制到剪贴板'
  } catch {
    if (!alive) return
    button.textContent = '复制失败'
    status.value = '无法自动复制，请在下方选择代码手动复制。'
    manualCode.value = code
  }
  // 每个代码按钮独立复位；连续复制多个块不会取消前一个按钮的反馈计时器。
  resets.set(
    button,
    setTimeout(() => {
      button.textContent = '复制'
      resets.delete(button)
    }, 1800),
  )
}
function imageError(event: Event) {
  const img = event.target
  if (!(img instanceof HTMLImageElement)) return
  img.hidden = true
  const parent = img.closest<HTMLButtonElement>('[data-image-view]')
  if (parent) {
    parent.disabled = true
    const message = document.createElement('span')
    message.textContent = '图片暂时无法显示' + (img.alt ? '：' + img.alt : '')
    parent.append(message)
  }
}
function enhance() {
  // 仅增强受控 Markdown 输出：DOM API 插入按钮/区域，不拼接未经转义的用户 HTML。
  for (const img of rendered.value?.querySelectorAll('img') ?? []) {
    if (img.closest('[data-image-view]')) continue
    const button = document.createElement('button')
    button.type = 'button'
    button.dataset.imageView = ''
    button.className = 'markdown-image'
    button.setAttribute('aria-label', '查看完整图片' + (img.alt ? '：' + img.alt : ''))
    img.before(button)
    button.append(img)
    if (img.complete && !img.naturalWidth) imageError({ target: img } as unknown as Event)
  }
  for (const table of rendered.value?.querySelectorAll('table') ?? []) {
    if (table.parentElement?.classList.contains('markdown-table')) continue
    const wrapper = document.createElement('div')
    wrapper.className = 'markdown-table'
    wrapper.tabIndex = 0
    wrapper.setAttribute('role', 'region')
    wrapper.setAttribute('aria-label', '数据表，可横向滚动')
    table.before(wrapper)
    wrapper.append(table)
  }
  for (const pre of rendered.value?.querySelectorAll('pre') ?? []) {
    pre.tabIndex = 0
    pre.setAttribute('aria-label', '代码，可横向滚动')
  }
}
onMounted(enhance)
watch(
  () => props.html,
  async () => {
    for (const timer of resets.values()) clearTimeout(timer)
    resets.clear()
    status.value = ''
    manualCode.value = ''
    await nextTick()
    enhance()
  },
)
onBeforeUnmount(() => {
  alive = false
  for (const timer of resets.values()) clearTimeout(timer)
  resets.clear()
})
</script>
<template>
  <div class="markdown-content" @click="handleClick" @error.capture="imageError">
    <!-- 仅渲染仓库 Markdown 经 html:false 的 MarkdownIt 转义后的结果；不接受运行时任意 HTML。 --><!-- eslint-disable-next-line vue/no-v-html -->
    <div ref="rendered" class="markdown-rendered" v-html="html"></div>
    <p v-if="status" class="markdown-status" role="status">{{ status }}</p>
    <textarea
      v-if="manualCode"
      class="manual-code"
      :value="manualCode"
      readonly
      aria-label="手动复制代码"
      @focus="($event.target as HTMLTextAreaElement).select()"
    ></textarea>
    <dialog
      ref="lightbox"
      class="image-dialog"
      aria-label="完整图片"
      @close="opener?.focus()"
      @click="
        (event) => {
          if (event.target === lightbox) lightbox?.close()
        }
      "
    >
      <button type="button" class="icon-button" aria-label="关闭图片" @click="lightbox?.close()">
        <IconGlyph name="x" /></button
      ><img v-if="preview" :src="preview.src" :alt="preview.alt" />
      <p v-if="preview?.alt">{{ preview.alt }}</p>
    </dialog>
  </div>
</template>
<style scoped>
.markdown-content {
  min-width: 0;
  color: var(--color-text);
  font-size: 1.0625rem;
  line-height: 1.9;
  overflow-wrap: anywhere;
}
.markdown-rendered > :deep(* + *) {
  margin-top: 1.5rem;
}
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4) {
  scroll-margin-top: calc(var(--header-clearance) + 5rem);
  line-height: 1.5;
  font-weight: 700;
}
.markdown-content :deep(h2) {
  padding-top: 1rem;
  font-size: 1.55rem;
}
.markdown-content :deep(h3) {
  padding-top: 0.75rem;
  font-size: 1.25rem;
}
.markdown-content :deep(h4) {
  font-size: 1.125rem;
}
.markdown-content :deep(a) {
  color: var(--color-link);
  text-decoration: underline;
  text-underline-offset: 0.25em;
}
.markdown-content :deep(strong) {
  font-weight: 700;
}
.markdown-content :deep(code:not(.hljs)) {
  padding: 0.1em 0.3em;
  border-radius: 0.3rem;
  background: var(--code-background);
  color: var(--code-keyword);
  font: 0.9em/1.6 var(--font-mono);
}
.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  padding-left: 1.5rem;
  list-style-position: outside;
}
.markdown-content :deep(ul) {
  list-style-type: disc;
}
.markdown-content :deep(ol) {
  list-style-type: decimal;
}
.markdown-content :deep(li + li) {
  margin-top: 0.5rem;
}
.markdown-content :deep(.contains-task-list) {
  list-style: none;
}
.markdown-content :deep(.task-list-item-checkbox) {
  margin-right: 0.5rem;
  accent-color: var(--color-link);
}
.markdown-content :deep(blockquote) {
  padding: 1rem 1.5rem;
  border-left: 3px solid var(--color-primary);
  border-radius: 0 var(--radius-small) var(--radius-small) 0;
  background: var(--color-primary-soft);
  color: var(--color-text-secondary);
}
.markdown-content :deep(hr) {
  border: 0;
  height: 1px;
  background: var(--color-border);
}
.markdown-content :deep(.markdown-table) {
  max-width: 100%;
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-small);
}
.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}
.markdown-content :deep(th),
.markdown-content :deep(td) {
  padding: 0.75rem;
  border-bottom: 1px solid var(--color-border);
  text-align: left;
  min-width: 7rem;
}
.markdown-content :deep(th) {
  background: var(--color-background-soft);
  font-weight: 600;
}
.markdown-content :deep(.markdown-image) {
  display: block;
  max-width: 100%;
  width: 100%;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-small);
  background: var(--color-background-soft);
  color: var(--color-text-secondary);
}
.markdown-content :deep(.markdown-image img) {
  display: block;
  max-width: 100%;
  width: auto;
  height: auto;
  margin-inline: auto;
  object-fit: contain;
}
.markdown-content :deep(.markdown-image img[hidden]) {
  display: none;
}
.markdown-content :deep(.markdown-image span) {
  display: block;
  padding: 1.5rem;
}
.markdown-content :deep(.markdown-code) {
  min-width: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-medium);
  background: var(--code-background);
  color: var(--code-text);
}
.markdown-content :deep(.markdown-code__toolbar) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.35rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
  font: var(--text-xs)/1.6 var(--font-mono);
  color: var(--color-text-secondary);
}
.markdown-content :deep(.markdown-code__copy) {
  min-height: var(--tap-size);
  min-width: var(--tap-size);
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-small);
  background: var(--color-surface);
  font-size: var(--text-xs);
  color: var(--color-text);
}
.markdown-content :deep(.markdown-code__copy:hover) {
  background: var(--color-primary-soft);
}
.markdown-content :deep(pre) {
  max-width: 100%;
  overflow-x: auto;
  padding: 1.25rem;
  font: var(--text-sm)/1.75 var(--font-mono);
  tab-size: 2;
}
.markdown-content :deep(pre code) {
  white-space: pre;
  overflow-wrap: normal;
}
.markdown-content :deep(.hljs-keyword),
.markdown-content :deep(.hljs-selector-tag),
.markdown-content :deep(.hljs-literal) {
  color: var(--code-keyword);
}
.markdown-content :deep(.hljs-string),
.markdown-content :deep(.hljs-attr),
.markdown-content :deep(.hljs-template-variable) {
  color: var(--code-string);
}
.markdown-content :deep(.hljs-title),
.markdown-content :deep(.hljs-function),
.markdown-content :deep(.hljs-built_in) {
  color: var(--code-title);
}
.markdown-content :deep(.hljs-number),
.markdown-content :deep(.hljs-symbol) {
  color: var(--code-number);
}
.markdown-content :deep(.hljs-comment) {
  color: var(--code-comment);
}
.markdown-status {
  margin-top: 1rem;
  color: var(--color-link);
  font-size: var(--text-sm);
}
.manual-code {
  width: 100%;
  height: 9rem;
  margin-top: 0.75rem;
  background: var(--code-background);
  color: var(--code-text);
  padding: 0.75rem;
  font: var(--text-sm)/1.6 var(--font-mono);
  border: 1px solid var(--color-border);
}
.image-dialog {
  position: fixed;
  inset: 0;
  margin: auto;
  max-width: calc(100vw - 2rem);
  max-height: 90dvh;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-medium);
  background: var(--color-surface);
  color: var(--color-text);
}
.image-dialog::backdrop {
  background: rgb(20 15 25 / 70%);
}
.image-dialog > button {
  position: sticky;
  top: 0;
  margin-left: auto;
  margin-bottom: 0.75rem;
}
.image-dialog img {
  max-width: 100%;
  max-height: none;
  width: auto;
  height: auto;
}
.image-dialog p {
  font-size: var(--text-sm);
  margin-top: 0.75rem;
}
@media (max-width: 540px) {
  .markdown-content {
    font-size: 1rem;
  }
  .markdown-content :deep(h2) {
    font-size: 1.35rem;
  }
}
</style>

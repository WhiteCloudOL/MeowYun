<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

defineProps<{
  html: string
}>()

const copyStatus = ref('')
let copyResetTimer: ReturnType<typeof setTimeout> | undefined

async function handleContentClick(event: MouseEvent) {
  const target = event.target
  if (!(target instanceof Element)) return

  const button = target.closest<HTMLButtonElement>('[data-code-copy]')
  if (!button) return

  const code = button.closest('.markdown-code')?.querySelector('code')?.textContent ?? ''
  if (!code) return

  try {
    await navigator.clipboard.writeText(code)
    button.textContent = '已复制'
    copyStatus.value = '代码已复制到剪贴板'

    if (copyResetTimer) clearTimeout(copyResetTimer)
    copyResetTimer = setTimeout(() => {
      button.textContent = '复制'
      copyStatus.value = ''
    }, 1800)
  } catch {
    copyStatus.value = '复制失败，请手动选择代码'
  }
}

onBeforeUnmount(() => {
  if (copyResetTimer) clearTimeout(copyResetTimer)
})
</script>

<template>
  <div class="markdown-content" @click="handleContentClick">
    <!-- HTML 仅由禁用原始 HTML 的 MarkdownIt 实例生成，不接受运行时用户输入。 -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="markdown-content__rendered" v-html="html"></div>
    <p class="markdown-content__status" aria-live="polite">{{ copyStatus }}</p>
  </div>
</template>

<style scoped>
.markdown-content {
  color: var(--anime-text-soft);
  font-size: 1.05rem;
  line-height: 1.85;
}

.markdown-content__rendered > :deep(* + *) {
  margin-top: var(--space-6);
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4) {
  scroll-margin-top: 7rem;
  color: var(--anime-text);
  font-weight: 760;
  letter-spacing: -0.03em;
  line-height: 1.3;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2) {
  padding-top: var(--space-8);
  font-size: var(--text-2xl);
}

.markdown-content :deep(h3) {
  padding-top: var(--space-4);
  font-size: var(--text-xl);
}

.markdown-content :deep(h4) {
  padding-top: var(--space-4);
  font-size: var(--text-lg);
}

.markdown-content :deep(a) {
  color: color-mix(in srgb, var(--site-accent) 72%, var(--anime-text));
  font-weight: 650;
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, var(--site-accent), transparent 48%);
  text-decoration-thickness: 0.08em;
  text-underline-offset: 0.22em;
}

.markdown-content :deep(strong) {
  color: var(--anime-text);
  font-weight: 760;
}

.markdown-content :deep(code:not(.hljs)) {
  padding: 0.16em 0.38em;
  border: 1px solid var(--anime-border);
  border-radius: 0.4em;
  background: var(--anime-inner);
  color: color-mix(in srgb, var(--site-accent) 72%, var(--anime-text));
  font-family: var(--font-mono);
  font-size: 0.88em;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  display: grid;
  gap: var(--space-2);
  padding-left: 1.45rem;
}

.markdown-content :deep(li::marker) {
  color: var(--color-primary);
  font-family: var(--font-mono);
  font-weight: 700;
}

.markdown-content :deep(.contains-task-list) {
  padding-left: 0;
  list-style: none;
}

.markdown-content :deep(.task-list-item) {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
}

.markdown-content :deep(.task-list-item-checkbox) {
  width: 1rem;
  height: 1rem;
  margin-top: 0.52rem;
  accent-color: var(--site-accent);
}

.markdown-content :deep(blockquote) {
  padding: var(--space-5) var(--space-6);
  border-left: 0.25rem solid var(--color-primary);
  border-radius: 0 var(--radius-medium) var(--radius-medium) 0;
  background: var(--color-primary-soft);
  color: var(--anime-text);
  font-weight: 600;
}

.markdown-content :deep(hr) {
  height: 1px;
  border: 0;
  background: linear-gradient(90deg, transparent, var(--anime-border-bright), transparent);
}

.markdown-content :deep(table) {
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--anime-border);
  border-spacing: 0;
  border-radius: var(--radius-medium);
  background: var(--anime-inner);
  font-size: var(--text-sm);
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  padding: 0.7rem 0.85rem;
  border-right: 1px solid var(--anime-border);
  border-bottom: 1px solid var(--anime-border);
  text-align: left;
}

.markdown-content :deep(th) {
  color: var(--anime-text);
  font-weight: 750;
}

.markdown-content :deep(tr:last-child td) {
  border-bottom: 0;
}

.markdown-content :deep(th:last-child),
.markdown-content :deep(td:last-child) {
  border-right: 0;
}

.markdown-content :deep(img) {
  width: 100%;
  max-height: 34rem;
  border: 1px solid var(--anime-border-bright);
  border-radius: var(--radius-large);
  object-fit: cover;
  box-shadow: var(--anime-shadow);
}

.markdown-content :deep(.markdown-code) {
  overflow: hidden;
  border: 1px solid var(--anime-border);
  border-radius: var(--radius-medium);
  background: rgb(6 11 31 / 76%);
  box-shadow: var(--shadow-card);
}

.markdown-content :deep(.markdown-code__toolbar) {
  display: flex;
  min-height: 2.6rem;
  align-items: center;
  justify-content: space-between;
  padding-inline: var(--space-4) var(--space-2);
  border-bottom: 1px solid rgb(226 234 255 / 10%);
  color: #aeb9d8;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

.markdown-content :deep(.markdown-code__copy) {
  min-width: 3.25rem;
  min-height: 2rem;
  border: 1px solid rgb(226 234 255 / 12%);
  border-radius: 0.55rem;
  background: rgb(255 255 255 / 6%);
  color: #dce3f8;
  cursor: pointer;
  font-size: var(--text-xs);
}

.markdown-content :deep(pre) {
  overflow-x: auto;
  padding: var(--space-5);
  color: #dce3f8;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: 1.65;
  tab-size: 2;
}

.markdown-content :deep(.hljs-keyword),
.markdown-content :deep(.hljs-selector-tag),
.markdown-content :deep(.hljs-literal) {
  color: #d7b7ff;
}

.markdown-content :deep(.hljs-string),
.markdown-content :deep(.hljs-attr),
.markdown-content :deep(.hljs-template-variable) {
  color: #a9e2d4;
}

.markdown-content :deep(.hljs-title),
.markdown-content :deep(.hljs-function),
.markdown-content :deep(.hljs-built_in) {
  color: #a9c8ff;
}

.markdown-content :deep(.hljs-number),
.markdown-content :deep(.hljs-symbol) {
  color: #ffc3d9;
}

.markdown-content :deep(.hljs-comment) {
  color: #7d89aa;
  font-style: italic;
}

.markdown-content__status {
  position: fixed;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

@media (hover: hover) {
  .markdown-content :deep(.markdown-code__copy:hover) {
    border-color: rgb(226 234 255 / 24%);
    background: rgb(255 255 255 / 10%);
  }
}

@media (max-width: 36rem) {
  .markdown-content {
    font-size: var(--text-base);
  }

  .markdown-content :deep(blockquote) {
    padding: var(--space-4);
  }

  .markdown-content :deep(table) {
    display: block;
    overflow-x: auto;
  }
}
</style>

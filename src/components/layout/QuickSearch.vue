<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import { quickSearch } from '@/utils/search'
const dialog = ref<HTMLDialogElement>()
const input = ref<HTMLInputElement>()
const query = ref('')
const results = computed(() => quickSearch(query.value))
const groups = computed(() =>
  ['文章', '项目', '站点']
    .map((name) => ({ name, items: results.value.filter((x) => x.group === name) }))
    .filter((x) => x.items.length),
)
let previousFocus: HTMLElement | null = null
async function open() {
  if (dialog.value?.open) return
  previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  query.value = ''
  dialog.value?.showModal()
  await nextTick()
  input.value?.focus()
}
function close() {
  dialog.value?.close()
}
function restore() {
  previousFocus?.focus()
}
function keyboard(e: KeyboardEvent) {
  const typing =
    e.target instanceof Element && !!e.target.closest('input,textarea,[contenteditable="true"]')
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' && !e.altKey && !typing) {
    e.preventDefault()
    void open()
  }
}
function resultKeys(e: KeyboardEvent) {
  if (!['ArrowDown', 'ArrowUp'].includes(e.key) || e.isComposing) return
  const links = [...(dialog.value?.querySelectorAll<HTMLAnchorElement>('.search-result') ?? [])]
  if (!links.length) return
  const current = links.indexOf(document.activeElement as HTMLAnchorElement)
  const next = e.key === 'ArrowDown' ? Math.min(current + 1, links.length - 1) : current - 1
  e.preventDefault()
  if (next < 0) input.value?.focus()
  else links[next]?.focus()
}
// 原生 dialog 提供模态焦点边界、Escape 和背景 inert；关闭统一恢复触发器。
onMounted(() => {
  document.addEventListener('meowyun:search', open)
  document.addEventListener('keydown', keyboard)
})
onBeforeUnmount(() => {
  document.removeEventListener('meowyun:search', open)
  document.removeEventListener('keydown', keyboard)
})
</script>
<template>
  <dialog
    ref="dialog"
    class="quick-search"
    aria-labelledby="quick-search-title"
    @close="restore"
    @click="
      (event) => {
        if (event.target === dialog) close()
      }
    "
    @keydown="resultKeys"
    @keydown.esc.prevent.stop="close"
  >
    <div class="quick-search__body">
      <header>
        <h2 id="quick-search-title">在手账里找一找</h2>
        <button type="button" class="icon-button" aria-label="关闭快速查找" @click="close">
          <IconGlyph name="x" />
        </button>
      </header>
      <label class="search-field"
        ><IconGlyph name="search" /><span class="sr-only">搜索文章、项目和站点</span
        ><input
          ref="input"
          v-model="query"
          type="search"
          placeholder="文章、项目、站点…"
          autocomplete="off"
      /></label>
      <p class="search-status" role="status">
        {{ results.length }} 个结果 · ↑ ↓ 移动，Enter 打开，Esc 关闭
      </p>
      <div class="quick-search__results">
        <section v-for="group in groups" :key="group.name">
          <h3>{{ group.name }}</h3>
          <template v-for="item in group.items" :key="item.id"
            ><RouterLink
              v-if="item.href.startsWith('/')"
              class="search-result"
              :to="item.href"
              @click="close"
              ><strong>{{ item.title }}</strong
              ><span>{{ item.description }}</span></RouterLink
            ><a
              v-else
              class="search-result"
              :href="item.href"
              target="_blank"
              rel="noopener noreferrer"
              @click="close"
              ><strong>{{ item.title }}</strong
              ><span>{{ item.description }}</span></a
            ></template
          >
        </section>
        <p v-if="!results.length" class="search-empty">
          没有找到相关内容，试试项目名或技术关键词。
        </p>
      </div>
    </div>
  </dialog>
</template>
<style scoped>
.quick-search {
  position: fixed;
  inset: 0;
  margin: auto;
  width: min(40rem, calc(100% - 2rem));
  max-height: min(80dvh, 44rem);
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-large);
  background: var(--color-surface-raised);
  color: var(--color-text);
  box-shadow: var(--shadow-popover);
}
.quick-search::backdrop {
  background: rgb(20 15 25 / 45%);
}
.quick-search__body {
  padding: 1.25rem;
}
.quick-search header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.quick-search h2 {
  font-size: var(--text-lg);
}
.search-status {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: 0.75rem;
}
.quick-search__results {
  margin-top: 1rem;
}
.quick-search section + section {
  margin-top: 1.25rem;
}
.quick-search h3 {
  font-size: var(--text-sm);
  color: var(--color-link);
  margin-bottom: 0.5rem;
}
.search-result {
  display: grid;
  gap: 0.3rem;
  min-height: var(--tap-size);
  padding: 0.75rem;
  border-radius: var(--radius-small);
}
.search-result:hover,
.search-result:focus-visible {
  background: var(--color-primary-soft);
}
.search-result strong {
  font-size: var(--text-sm);
  font-weight: 600;
}
.search-result span,
.search-empty {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}
</style>

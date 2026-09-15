<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMotion } from '@/composables/useMotion'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import type { ArticleHeading } from '@/content/articles'
const props = defineProps<{ title: string; headings: ArticleHeading[] }>()
const router = useRouter()
const route = useRoute()
const { quietEffective } = useMotion()
const list = ref<HTMLElement>()
const trigger = ref<HTMLButtonElement>()
const opened = ref(false)
const activeId = ref(props.headings[0]?.id ?? '')
const activeTitle = computed(() => props.headings.find((h) => h.id === activeId.value)?.text)
const indicator = ref({ height: '0px', transform: 'translateY(0)', opacity: '0' })
let frame = 0
let observer: ResizeObserver | undefined
async function measure() {
  await nextTick()
  const target = [...(list.value?.querySelectorAll<HTMLAnchorElement>('a') ?? [])].find(
    (a) => a.dataset.heading === activeId.value,
  )
  if (target)
    indicator.value = {
      height: target.offsetHeight + 'px',
      transform: 'translateY(' + target.offsetTop + 'px)',
      opacity: '1',
    }
}
function update() {
  frame = 0
  const targets = props.headings
    .map((h) => document.getElementById(h.id))
    .filter((x): x is HTMLElement => !!x)
  const margin = targets[1] ? parseFloat(getComputedStyle(targets[1]).scrollMarginTop) : 0
  const line = Math.max(
    (document.querySelector('.app-header')?.getBoundingClientRect().bottom ?? 80) + 24,
    margin + 24,
  )
  activeId.value =
    targets.filter((x) => x.getBoundingClientRect().top <= line).at(-1)?.id ?? targets[0]?.id ?? ''
  void measure()
}
function schedule() {
  if (!frame) frame = requestAnimationFrame(update)
}
async function navigate(event: MouseEvent, id: string) {
  if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  const target = document.getElementById(id)
  if (!target) return
  close()
  await nextTick()
  if (route.hash === '#' + id)
    target.scrollIntoView({ behavior: quietEffective.value ? 'auto' : 'smooth', block: 'start' })
  else await router.push({ path: route.path, query: route.query, hash: '#' + id })
  activeId.value = id
}
function close() {
  const wasOpen = opened.value
  opened.value = false
  if (wasOpen) trigger.value?.focus()
}
function keydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && opened.value) {
    e.preventDefault()
    close()
  }
}
// resize 同时重算活动章节和指示条；无滚动锁，用户可随时打断原生滚动。
onMounted(() => {
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
  observer = new ResizeObserver(schedule)
  if (list.value) observer.observe(list.value)
  schedule()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', schedule)
  window.removeEventListener('resize', schedule)
  observer?.disconnect()
  if (frame) cancelAnimationFrame(frame)
})
watch(
  () => props.headings,
  () => {
    close()
    schedule()
  },
)
watch([activeId, opened], measure)
</script>
<template>
  <aside v-if="headings.length" class="article-toc" @keydown="keydown">
    <button
      ref="trigger"
      type="button"
      class="toc-mobile-toggle"
      :aria-expanded="opened"
      aria-controls="article-toc-list"
      @click="opened = !opened"
    >
      <IconGlyph name="book-open" :size="18" /><span
        >{{ opened ? '收起目录' : '打开目录'
        }}<small v-if="activeTitle">{{ activeTitle }}</small></span
      ><IconGlyph :name="opened ? 'x' : 'arrow-down'" :size="18" />
    </button>
    <header class="toc-desktop-title">
      <h2>{{ title }}</h2>
      <span>{{ headings.length }} 节</span>
    </header>
    <nav
      id="article-toc-list"
      ref="list"
      class="toc-list"
      :class="{ 'is-open': opened }"
      aria-label="文章目录"
    >
      <i class="toc-indicator" :style="indicator" aria-hidden="true"></i
      ><a
        v-for="heading in headings"
        :key="heading.id"
        :href="'#' + heading.id"
        :data-heading="heading.id"
        :aria-current="activeId === heading.id ? 'location' : undefined"
        :style="{
          paddingLeft: 0.75 + Math.max(0, heading.level - (headings[0]?.level ?? 1)) * 0.65 + 'rem',
        }"
        @click="navigate($event, heading.id)"
        >{{ heading.text }}</a
      >
    </nav>
  </aside>
</template>
<style scoped>
.article-toc {
  padding: 1rem;
  min-width: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-medium);
}
.toc-desktop-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  border-bottom: 1px solid var(--color-border-soft);
  padding-bottom: 0.75rem;
}
.toc-desktop-title h2 {
  font-size: var(--text-sm);
}
.toc-desktop-title span {
  color: var(--color-text-muted);
  font-size: var(--text-xs);
}
.toc-list {
  position: relative;
  max-height: calc(100dvh - var(--header-clearance) - 6rem);
  overflow-y: auto;
  margin-top: 0.75rem;
  padding: 0.15rem;
}
.toc-list a {
  position: relative;
  display: flex;
  align-items: center;
  min-height: var(--tap-size);
  padding: 0.65rem 0.75rem;
  font-size: var(--text-sm);
  line-height: 1.5;
  overflow-wrap: anywhere;
  border-radius: var(--radius-small);
}
.toc-list a[aria-current] {
  color: var(--color-link);
  font-weight: 600;
}
.toc-list a:hover {
  background: var(--color-background-soft);
}
.toc-indicator {
  position: absolute;
  top: 0;
  left: 0.15rem;
  right: 0.15rem;
  background: var(--color-primary-soft);
  border-left: 2px solid var(--color-link);
  border-radius: var(--radius-small);
  transition: transform var(--transition-fast);
  pointer-events: none;
}
.toc-mobile-toggle {
  display: none;
}
@media (max-width: 1000px) {
  .article-toc {
    padding: 0.5rem 0.75rem;
  }
  .toc-desktop-title {
    display: none;
  }
  .toc-mobile-toggle {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    min-height: var(--tap-size);
    border: 0;
    background: transparent;
    text-align: left;
    font-size: var(--text-sm);
  }
  .toc-mobile-toggle > span {
    flex: 1;
    min-width: 0;
  }
  .toc-mobile-toggle small {
    display: block;
    color: var(--color-text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: var(--text-xs);
  }
  .toc-list {
    display: none;
  }
  .toc-list.is-open {
    display: block;
    max-height: 50dvh;
  }
}
</style>

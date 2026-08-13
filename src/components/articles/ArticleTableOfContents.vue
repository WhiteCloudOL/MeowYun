<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { ArticleHeading } from '@/content/articles'

const props = defineProps<{
  title: string
  headings: ArticleHeading[]
}>()

const listElement = ref<HTMLElement>()
const activeId = ref(props.headings[0]?.id ?? '')
const indicatorStyle = ref<Record<string, string>>({ opacity: '0' })
const activeIndex = computed(() =>
  Math.max(
    0,
    props.headings.findIndex((heading) => heading.id === activeId.value),
  ),
)

let animationFrame = 0
let unlockTimer: ReturnType<typeof setTimeout> | undefined
let lockedId = ''

function headingElements() {
  return props.headings
    .map((heading) => document.getElementById(heading.id))
    .filter((element): element is HTMLElement => Boolean(element))
}

async function updateIndicator() {
  await nextTick()
  const link = [...(listElement.value?.querySelectorAll<HTMLAnchorElement>('a') ?? [])].find(
    (item) => decodeURIComponent(item.hash.slice(1)) === activeId.value,
  )

  if (!link) {
    indicatorStyle.value = { opacity: '0' }
    return
  }

  indicatorStyle.value = {
    height: `${link.offsetHeight}px`,
    opacity: '1',
    transform: `translate3d(0, ${link.offsetTop}px, 0)`,
  }
}

function updateActiveHeading() {
  animationFrame = 0
  if (lockedId) return

  const targets = headingElements()
  const firstTarget = targets[0]
  if (!firstTarget) return

  // 阅读基准线固定在视口上部，标题越过该线时立即把目录交给下一节。
  const readingLine = Math.min(180, window.innerHeight * 0.28)
  let current = firstTarget

  for (const target of targets) {
    if (target.getBoundingClientRect().top <= readingLine) current = target
    else break
  }

  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) {
    current = targets.at(-1) ?? current
  }

  if (current.id !== activeId.value) activeId.value = current.id
}

function scheduleActiveUpdate() {
  if (!animationFrame) animationFrame = window.requestAnimationFrame(updateActiveHeading)
}

function releaseNavigationLock() {
  lockedId = ''
  if (unlockTimer) clearTimeout(unlockTimer)
  scheduleActiveUpdate()
}

function navigateToHeading(event: MouseEvent, id: string) {
  event.preventDefault()
  const target = document.getElementById(id)
  if (!target) return

  lockedId = id
  activeId.value = id
  window.history.replaceState(null, '', `#${encodeURIComponent(id)}`)
  target.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    block: 'start',
  })

  if (unlockTimer) clearTimeout(unlockTimer)
  unlockTimer = setTimeout(releaseNavigationLock, 850)
}

function cancelProgrammaticScroll() {
  if (lockedId) releaseNavigationLock()
}

async function initializeTracking() {
  await nextTick()
  const hash = decodeURIComponent(window.location.hash.slice(1))
  activeId.value = props.headings.some((heading) => heading.id === hash)
    ? hash
    : props.headings[0]?.id ?? ''
  scheduleActiveUpdate()
  void updateIndicator()
}

onMounted(() => {
  void initializeTracking()
  window.addEventListener('scroll', scheduleActiveUpdate, { passive: true })
  window.addEventListener('resize', scheduleActiveUpdate)
  window.addEventListener('wheel', cancelProgrammaticScroll, { passive: true })
  window.addEventListener('touchstart', cancelProgrammaticScroll, { passive: true })
})

watch(() => props.headings, initializeTracking, { deep: true })
watch(activeId, updateIndicator)

onBeforeUnmount(() => {
  window.removeEventListener('scroll', scheduleActiveUpdate)
  window.removeEventListener('resize', scheduleActiveUpdate)
  window.removeEventListener('wheel', cancelProgrammaticScroll)
  window.removeEventListener('touchstart', cancelProgrammaticScroll)
  if (animationFrame) window.cancelAnimationFrame(animationFrame)
  if (unlockTimer) clearTimeout(unlockTimer)
})
</script>

<template>
  <aside v-if="headings.length" class="article-toc">
    <header class="article-toc__header">
      <h2>{{ title }}</h2>
      <span>{{ String(activeIndex + 1).padStart(2, '0') }} / {{ String(headings.length).padStart(2, '0') }}</span>
    </header>

    <nav ref="listElement" class="article-toc__list" aria-label="文章目录">
      <i class="article-toc__indicator" :style="indicatorStyle" aria-hidden="true"></i>
      <a
        v-for="heading in headings"
        :key="heading.id"
        :href="`#${heading.id}`"
        :class="{ 'is-active': activeId === heading.id }"
        :aria-current="activeId === heading.id ? 'location' : undefined"
        :style="{ '--toc-depth': heading.level - (headings[0]?.level ?? 1) }"
        @click="navigateToHeading($event, heading.id)"
      >
        <span class="article-toc__dot" aria-hidden="true"></span>
        <span>{{ heading.text }}</span>
      </a>
    </nav>
  </aside>
</template>

<style scoped>
.article-toc {
  min-width: 0;
  padding: var(--space-4);
  border: 1px solid var(--anime-border);
  border-radius: .8rem 1.4rem .9rem 1.1rem;
  background: color-mix(in srgb, #b4f8c8 12%, var(--paper-surface));
  box-shadow: .35rem .45rem 0 rgb(124 185 232 / 13%), 0 .75rem 2.5rem rgb(3 8 27 / 14%);
  color: var(--anime-muted);
  backdrop-filter: blur(1rem) saturate(118%);
  transform: rotate(.45deg);
}

.article-toc::before {
  position: absolute;
  top: -.7rem;
  right: 1.2rem;
  width: 2rem;
  height: 3rem;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 76%, 0 100%);
  background: #ff9fc6;
  content: '';
  opacity: .78;
}

.article-toc__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
  padding: 0.15rem 0.25rem var(--space-3);
  border-bottom: 1px solid var(--anime-border);
}

.article-toc__header h2 {
  color: var(--anime-text);
  font-size: var(--text-sm);
  letter-spacing: -0.02em;
}

.article-toc__header span {
  color: var(--anime-muted);
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.08em;
}

.article-toc__list {
  position: relative;
  display: grid;
  max-height: min(30rem, calc(100vh - 13rem));
  gap: 0.15rem;
  margin-top: var(--space-3);
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-color: color-mix(in srgb, var(--site-accent) 28%, transparent) transparent;
  scrollbar-width: thin;
}

.article-toc__indicator {
  position: absolute;
  z-index: 0;
  top: 0;
  right: 0;
  left: 0;
  border: 1px solid color-mix(in srgb, var(--site-accent) 22%, transparent);
  border-radius: 0.72rem;
  background: color-mix(in srgb, var(--site-accent) 10%, transparent);
  box-shadow: inset 2px 0 color-mix(in srgb, var(--site-accent) 72%, white 8%);
  pointer-events: none;
  transition:
    height 280ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity var(--transition-fast),
    transform 360ms cubic-bezier(0.22, 1, 0.36, 1);
}

.article-toc__list a {
  position: relative;
  z-index: 1;
  display: grid;
  min-width: 0;
  min-height: 2.35rem;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 0.62rem;
  padding: 0.52rem 0.7rem 0.52rem calc(0.72rem + var(--toc-depth, 0) * 0.65rem);
  border-radius: 0.72rem;
  color: var(--anime-muted);
  font-size: 0.73rem;
  line-height: 1.42;
  transition:
    color var(--transition-fast),
    transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
}

.article-toc__list a > span:last-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-toc__dot {
  width: 0.34rem;
  height: 0.34rem;
  border: 1px solid color-mix(in srgb, var(--anime-muted) 65%, transparent);
  border-radius: 50%;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
}

.article-toc__list a.is-active {
  color: var(--anime-text);
  font-weight: 700;
  transform: translateX(0.12rem);
}

.article-toc__list a.is-active .article-toc__dot {
  border-color: var(--site-accent);
  background: var(--site-accent);
  box-shadow: 0 0 0.6rem color-mix(in srgb, var(--site-accent) 65%, transparent);
  transform: scale(1.18);
}

.article-toc__list a.is-active .article-toc__dot::after {
  display: block;
  margin: -.55rem 0 0 -.28rem;
  color: var(--site-accent);
  content: '★';
  font-size: .75rem;
}

@media (hover: hover) {
  .article-toc__list a:hover {
    color: var(--anime-text-soft);
    transform: translateX(0.12rem);
  }
}

@media (max-width: 64rem) {
  .article-toc__list {
    max-height: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .article-toc__indicator,
  .article-toc__list a,
  .article-toc__dot {
    transition: none;
  }
}
</style>

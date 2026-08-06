<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { ArticleHeading } from '@/content/articles'

const props = defineProps<{
  title: string
  headings: ArticleHeading[]
}>()

const activeId = ref(props.headings[0]?.id ?? '')
let observer: IntersectionObserver | undefined

async function observeHeadings() {
  observer?.disconnect()
  await nextTick()

  const targets = props.headings
    .map((heading) => document.getElementById(heading.id))
    .filter((element): element is HTMLElement => Boolean(element))

  if (!targets.length) return

  activeId.value = window.location.hash.slice(1) || targets[0]?.id || ''
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top)

      if (visible[0]?.target.id) activeId.value = visible[0].target.id
    },
    { rootMargin: '-18% 0px -72% 0px', threshold: [0, 1] },
  )

  targets.forEach((target) => observer?.observe(target))
}

function activate(id: string) {
  activeId.value = id
}

onMounted(observeHeadings)
watch(() => props.headings, observeHeadings, { deep: true })
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <aside v-if="headings.length" class="article-toc">
    <p class="article-toc__eyebrow">ON THIS PAGE</p>
    <h2>{{ title }}</h2>
    <nav class="article-toc__list" aria-label="文章目录">
      <a
        v-for="heading in headings"
        :key="heading.id"
        :href="`#${heading.id}`"
        :class="{ 'is-active': activeId === heading.id }"
        :aria-current="activeId === heading.id ? 'location' : undefined"
        :style="{ '--toc-depth': heading.level - (headings[0]?.level ?? 1) }"
        @click="activate(heading.id)"
      >
        {{ heading.text }}
      </a>
    </nav>
  </aside>
</template>

<style scoped>
.article-toc {
  min-width: 0;
  color: var(--anime-muted);
}

.article-toc__eyebrow {
  color: var(--anime-accent-soft);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.article-toc h2 {
  margin: 0.42rem 0 1.1rem;
  color: var(--anime-text);
  font-size: 1rem;
  letter-spacing: -0.025em;
}

.article-toc__list {
  display: grid;
  border-left: 1px solid color-mix(in srgb, var(--anime-border-bright), transparent 22%);
}

.article-toc__list a {
  position: relative;
  min-width: 0;
  padding: 0.48rem 0.55rem 0.48rem calc(0.9rem + var(--toc-depth, 0) * 0.7rem);
  overflow: hidden;
  border-radius: 0 0.65rem 0.65rem 0;
  color: var(--anime-muted);
  font-size: 0.74rem;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast),
    transform var(--transition-fast);
}

.article-toc__list a::before {
  position: absolute;
  top: 50%;
  left: -1px;
  width: 2px;
  height: 1.25rem;
  border-radius: var(--radius-round);
  background: var(--site-accent);
  content: '';
  opacity: 0;
  transform: translateY(-50%) scaleY(0.35);
  transition:
    opacity var(--transition-fast),
    transform var(--transition-normal);
}

.article-toc__list a.is-active {
  background: color-mix(in srgb, var(--site-accent), transparent 91%);
  color: var(--anime-text);
}

.article-toc__list a.is-active::before {
  opacity: 1;
  transform: translateY(-50%) scaleY(1);
}

@media (hover: hover) {
  .article-toc__list a:hover {
    color: var(--anime-text-soft);
    transform: translateX(0.12rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .article-toc__list a,
  .article-toc__list a::before {
    transition: none;
  }
}
</style>

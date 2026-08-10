<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import ArticleTableOfContents from '@/components/articles/ArticleTableOfContents.vue'
import MarkdownContent from '@/components/articles/MarkdownContent.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import { articles, getArticle } from '@/content/articles'
import { siteConfig } from '@/config/site'
import { updateSeo } from '@/utils/seo'

const route = useRoute()
const article = computed(() => getArticle(String(route.params.slug)))
const articleElement = ref<HTMLElement>()
const readingProgress = ref(0)
const shareStatus = ref('')
let shareResetTimer: ReturnType<typeof setTimeout> | undefined

const articleIndex = computed(() =>
  article.value ? articles.findIndex((item) => item.slug === article.value?.slug) : -1,
)
const newerArticle = computed(() =>
  articleIndex.value > 0 ? articles[articleIndex.value - 1] : undefined,
)
const olderArticle = computed(() =>
  articleIndex.value >= 0 && articleIndex.value < articles.length - 1
    ? articles[articleIndex.value + 1]
    : undefined,
)
const tocHeadings = computed(() => {
  if (!article.value || !siteConfig.sections.articles.toc.enabled) return []

  const requestedMin = Math.max(1, Math.min(4, siteConfig.sections.articles.toc.minLevel))
  const requestedMax = Math.max(1, Math.min(4, siteConfig.sections.articles.toc.maxLevel))
  const minLevel = Math.min(requestedMin, requestedMax)
  const maxLevel = Math.max(requestedMin, requestedMax)

  return article.value.headings.filter(
    (heading) => heading.level >= minLevel && heading.level <= maxLevel,
  )
})

function updateReadingProgress() {
  const element = articleElement.value
  if (!element) return

  const start = element.offsetTop
  const distance = Math.max(1, element.offsetHeight - window.innerHeight)
  readingProgress.value = Math.min(1, Math.max(0, (window.scrollY - start) / distance))
}

async function copyArticleLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    shareStatus.value = '文章链接已复制'
  } catch {
    shareStatus.value = '复制失败，请从地址栏复制链接'
  }

  if (shareResetTimer) clearTimeout(shareResetTimer)
  shareResetTimer = setTimeout(() => (shareStatus.value = ''), 1800)
}

onMounted(() => {
  // 使用被动滚动监听，只更新 transform 比例，不触发布局重排。
  window.addEventListener('scroll', updateReadingProgress, { passive: true })
  window.addEventListener('resize', updateReadingProgress)
  updateReadingProgress()
})

watch(article, async () => {
  await nextTick()
  updateReadingProgress()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateReadingProgress)
  window.removeEventListener('resize', updateReadingProgress)
  if (shareResetTimer) clearTimeout(shareResetTimer)
})

watchEffect(() => {
  updateSeo(
    article.value
      ? {
          title: `${article.value.title} · ${siteConfig.meta.name}`,
          description: article.value.description,
          path: route.fullPath,
          type: 'article',
          image: article.value.cover,
          publishedAt: article.value.publishedAt,
          updatedAt: article.value.updatedAt,
          tags: article.value.tags,
        }
      : {
          title: `文章未找到 · ${siteConfig.meta.name}`,
          description: '请求的文章不存在或已经移动。',
          path: route.fullPath,
          noIndex: true,
        },
  )
})
</script>

<template>
  <article v-if="article" ref="articleElement" class="article-view page-shell">
    <span
      class="article-view__progress"
      :style="{ transform: `scaleX(${readingProgress})` }"
      aria-hidden="true"
    ></span>

    <BaseButton to="/articles" variant="quiet">
      <IconGlyph name="arrow-right" class="article-view__back-icon" :size="16" /> 返回文章
    </BaseButton>

    <div class="article-view__layout">
      <div class="article-view__column">
        <header class="article-view__header">
          <h1 id="article-title">{{ article.title }}</h1>
          <p class="article-view__description">{{ article.description }}</p>

          <div class="article-view__meta-row">
            <div class="article-view__meta">
              <span>
                <IconGlyph name="calendar-days" :size="15" />
                <time :datetime="article.publishedAt">发布于 {{ article.displayDate }}</time>
              </span>
              <span v-if="article.updatedAt">
                <IconGlyph name="clock" :size="15" />
                <time :datetime="article.updatedAt">更新于 {{ article.displayUpdatedAt }}</time>
              </span>
              <RouterLink
                v-for="tag in article.tags"
                :key="tag"
                :to="`/articles/tags/${encodeURIComponent(tag)}`"
              >
                # {{ tag }}
              </RouterLink>
            </div>

            <div class="article-view__share-control">
              <button
                class="article-view__share-button"
                type="button"
                :aria-label="shareStatus || '复制文章分享链接'"
                title="复制文章分享链接"
                @click="copyArticleLink"
              >
                <IconGlyph
                  :name="shareStatus === '文章链接已复制' ? 'check' : 'share-2'"
                  :size="17"
                />
              </button>
              <Transition name="share-tip">
                <span v-if="shareStatus" class="article-view__share-tip" role="status">
                  {{ shareStatus }}
                </span>
              </Transition>
            </div>
          </div>
        </header>

        <BaseCard class="article-view__body" :hoverable="false" variant="solid">
          <MarkdownContent :html="article.contentHtml" />
        </BaseCard>

        <footer v-if="article.sourceUrl" class="article-view__source">
          <p>这里是简要导读，完整步骤、版本说明与注意事项请前往文档站查看。</p>
          <BaseButton :href="article.sourceUrl" target="_blank" variant="secondary">
            {{ article.sourceLabel ?? '查看完整文档' }}
            <IconGlyph name="arrow-up-right" :size="16" />
          </BaseButton>
        </footer>

        <nav
          v-if="newerArticle || olderArticle"
          class="article-view__pager"
          aria-label="相邻文章"
        >
          <RouterLink
            v-if="newerArticle"
            class="article-view__pager-link"
            :to="`/articles/${newerArticle.slug}`"
          >
            <small>较新一篇</small>
            <strong>{{ newerArticle.title }}</strong>
          </RouterLink>
          <span v-else></span>
          <RouterLink
            v-if="olderArticle"
            class="article-view__pager-link article-view__pager-link--next"
            :to="`/articles/${olderArticle.slug}`"
          >
            <small>较早一篇</small>
            <strong>{{ olderArticle.title }}</strong>
          </RouterLink>
        </nav>
      </div>

      <ArticleTableOfContents
        v-if="tocHeadings.length"
        class="article-view__toc"
        :title="siteConfig.sections.articles.toc.title"
        :headings="tocHeadings"
      />
    </div>
  </article>

  <section v-else class="article-view article-view--missing page-shell">
    <p class="eyebrow">404</p>
    <h1>这篇文章还没有出现</h1>
    <p>链接可能已经变化，也可能只是云层暂时挡住了它。</p>
    <BaseButton to="/articles">查看其他文章</BaseButton>
  </section>
</template>

<style scoped>
.article-view {
  width: min(100%, calc(var(--page-max-width) + var(--page-padding) * 2));
  padding-top: clamp(var(--space-6), 5vw, var(--space-12));
  color: var(--anime-text);
}

.article-view__progress {
  position: fixed;
  z-index: 30;
  top: 0;
  right: 0;
  left: 0;
  height: 0.18rem;
  background: linear-gradient(90deg, #9fc5ff, #c5b5ff 55%, #ffb5d0);
  box-shadow: 0 0 0.65rem rgb(169 184 255 / 55%);
  transform-origin: left;
}

.article-view__layout {
  display: grid;
  grid-template-columns: minmax(0, 49rem) minmax(13.5rem, 16rem);
  align-items: start;
  justify-content: center;
  gap: clamp(2rem, 5vw, 4.5rem);
  margin-top: var(--space-6);
}

.article-view__column {
  display: grid;
  min-width: 0;
  gap: var(--space-6);
}

.article-view__header {
  display: grid;
  gap: var(--space-4);
  padding: clamp(var(--space-5), 4vw, var(--space-8));
  border: 1px solid var(--anime-border);
  border-radius: var(--radius-large);
  background: rgb(var(--anime-glass-rgb) / calc(var(--site-glass-opacity, 46%) + 8%));
  box-shadow: 0 0.8rem 3rem rgb(3 8 27 / 12%);
  backdrop-filter: blur(1rem) saturate(116%);
}

.article-view h1 {
  max-width: 19ch;
  scroll-margin-top: 7rem;
  font-size: clamp(1.85rem, 3vw, 2.75rem);
  font-weight: 780;
  letter-spacing: -0.048em;
  line-height: 1.15;
  text-wrap: balance;
}

.article-view__description {
  max-width: 44rem;
  color: var(--anime-text-soft);
  font-size: clamp(var(--text-base), 1.5vw, var(--text-lg));
  line-height: 1.75;
}

.article-view__meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin-top: var(--space-2);
  padding-top: var(--space-3);
  border-top: 1px solid var(--anime-border);
}

.article-view__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2) var(--space-4);
  color: var(--anime-muted);
  font-size: var(--text-xs);
}

.article-view__meta span,
.article-view__meta a {
  display: inline-flex;
  align-items: center;
  gap: 0.38rem;
}

.article-view__meta time {
  font-variant-numeric: tabular-nums;
}

.article-view__meta a {
  color: color-mix(in srgb, var(--site-accent) 72%, var(--anime-text-soft));
  transition: color var(--transition-fast);
}

.article-view__share-control {
  position: relative;
  flex: none;
}

.article-view__share-button {
  display: grid;
  width: 2.55rem;
  height: 2.55rem;
  place-items: center;
  border: 1px solid var(--anime-border-bright);
  border-radius: 50%;
  background: color-mix(in srgb, var(--anime-glass-strong) 78%, transparent);
  color: var(--anime-text-soft);
  cursor: pointer;
  box-shadow: inset 0 1px rgb(255 255 255 / 14%);
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast),
    transform var(--transition-press);
}

.article-view__share-button:active {
  transform: scale(0.94);
}

.article-view__share-tip {
  position: absolute;
  z-index: 5;
  top: calc(100% + 0.65rem);
  right: 0;
  width: max-content;
  max-width: min(13rem, calc(100vw - 2rem));
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--anime-border-bright);
  border-radius: 0.7rem;
  background: var(--anime-popover);
  color: var(--anime-text-soft);
  box-shadow: var(--shadow-popover);
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  line-height: 1.4;
  white-space: nowrap;
  backdrop-filter: blur(1rem);
}

.share-tip-enter-active,
.share-tip-leave-active {
  transition:
    opacity var(--transition-fast),
    transform var(--transition-fast);
}

.share-tip-enter-from,
.share-tip-leave-to {
  opacity: 0;
  transform: translateY(-0.25rem) scale(0.96);
}

.article-view__back-icon {
  transform: rotate(180deg);
}

.article-view__body {
  padding: clamp(var(--space-6), 5vw, var(--space-10));
  border-color: var(--anime-border);
  border-radius: var(--radius-large);
  box-shadow: 0 0.8rem 3rem rgb(3 8 27 / 14%);
}

.article-view__toc {
  position: sticky;
  top: 7rem;
}

.article-view__source {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-5);
  padding: var(--space-5) var(--space-6);
  border: 1px solid var(--anime-border);
  border-radius: var(--radius-medium);
  background: var(--anime-inner);
}

.article-view__source p {
  max-width: 36rem;
  color: var(--anime-text-soft);
  font-size: var(--text-sm);
  line-height: 1.7;
}

.article-view__pager {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
}

.article-view__pager-link {
  display: grid;
  gap: var(--space-2);
  min-height: 6.5rem;
  align-content: center;
  padding: var(--space-5);
  border: 1px solid var(--anime-border);
  border-radius: var(--radius-medium);
  background: var(--anime-inner);
  transition:
    border-color var(--transition-fast),
    transform var(--transition-fast);
}

.article-view__pager-link--next {
  text-align: right;
}

.article-view__pager-link small {
  color: var(--anime-muted);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

.article-view__pager-link strong {
  overflow: hidden;
  color: var(--anime-text);
  font-size: var(--text-sm);
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (hover: hover) {
  .article-view__meta a:hover {
    color: var(--anime-text);
  }

  .article-view__share-button:hover {
    border-color: color-mix(in srgb, var(--site-accent) 44%, var(--anime-border-bright));
    background: color-mix(in srgb, var(--site-accent) 12%, var(--anime-glass-strong));
    color: var(--anime-text);
    transform: translateY(-0.1rem);
  }

  .article-view__pager-link:hover {
    border-color: var(--anime-border-bright);
    transform: translateY(-0.15rem);
  }
}

.article-view--missing {
  display: grid;
  min-height: 60vh;
  align-content: center;
  justify-items: start;
  gap: var(--space-5);
}

.article-view--missing h1 {
  font-size: var(--text-2xl);
}

.article-view--missing p:not(.eyebrow) {
  color: var(--color-text-secondary);
}

@media (max-width: 36rem) {
  .article-view__header {
    padding: var(--space-5);
  }

  .article-view h1 {
    font-size: clamp(1.75rem, 8.2vw, 2rem);
  }

  .article-view__meta-row {
    align-items: flex-end;
  }

  .article-view__share-tip {
    top: auto;
    right: 0;
    bottom: calc(100% + 0.65rem);
  }

  .article-view__source {
    align-items: stretch;
    flex-direction: column;
    padding-inline: 0;
  }

  .article-view__pager {
    grid-template-columns: 1fr;
  }

  .article-view__pager-link--next {
    text-align: left;
  }
}

@media (max-width: 58rem) {
  .article-view__layout {
    grid-template-columns: minmax(0, 49rem);
  }

  .article-view__toc {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .article-view__share-button,
  .share-tip-enter-active,
  .share-tip-leave-active {
    transition: none;
  }
}
</style>

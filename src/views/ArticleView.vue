<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import ArticleTableOfContents from '@/components/articles/ArticleTableOfContents.vue'
import MarkdownContent from '@/components/articles/MarkdownContent.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseTag from '@/components/ui/BaseTag.vue'
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
      <header class="article-view__header">
        <p class="eyebrow">Article</p>
        <h1 id="article-title">{{ article.title }}</h1>
        <p class="article-view__description">{{ article.description }}</p>
        <div class="article-view__tags">
          <BaseTag v-for="tag in article.tags" :key="tag">{{ tag }}</BaseTag>
        </div>
        <div class="article-view__utility-row">
          <div class="article-view__meta">
            <span class="article-view__date-item">
              <IconGlyph name="calendar-days" :size="16" />
              <span>
                <small>发布于</small>
                <time :datetime="article.publishedAt">{{ article.displayDate }}</time>
              </span>
            </span>
            <span v-if="article.updatedAt" class="article-view__date-item">
              <IconGlyph name="clock" :size="16" />
              <span>
                <small>更新于</small>
                <time :datetime="article.updatedAt">{{ article.displayUpdatedAt }}</time>
              </span>
            </span>
          </div>

          <div class="article-view__share-control">
            <button
              class="article-view__share-button"
              type="button"
              :aria-label="shareStatus || '复制文章分享链接'"
              title="复制文章分享链接"
              @click="copyArticleLink"
            >
              <IconGlyph :name="shareStatus === '文章链接已复制' ? 'check' : 'share-2'" :size="18" />
            </button>
            <Transition name="share-tip">
              <span v-if="shareStatus" class="article-view__share-tip" role="status">
                {{ shareStatus }}
              </span>
            </Transition>
          </div>
        </div>
      </header>

      <ArticleTableOfContents
        v-if="tocHeadings.length"
        class="article-view__toc"
        :title="siteConfig.sections.articles.toc.title"
        :headings="tocHeadings"
      />

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

      <nav v-if="newerArticle || olderArticle" class="article-view__pager" aria-label="相邻文章">
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
  padding-top: clamp(var(--space-8), 7vw, var(--space-16));
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
  grid-template-columns: minmax(0, var(--article-max-width)) minmax(12rem, 15rem);
  justify-content: center;
  gap: var(--space-8) clamp(2.5rem, 6vw, 5rem);
  margin-top: var(--space-8);
}

.article-view__header {
  display: grid;
  gap: var(--space-5);
  grid-column: 1;
}

.article-view h1 {
  max-width: 14ch;
  scroll-margin-top: 7rem;
  font-size: var(--text-display);
  font-weight: 820;
  letter-spacing: -0.055em;
  line-height: 1.06;
  text-wrap: balance;
}

.article-view__description {
  max-width: 38rem;
  color: var(--anime-text-soft);
  font-size: var(--text-lg);
}

.article-view__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.article-view__utility-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-5);
  margin-top: var(--space-1);
  padding-top: var(--space-4);
  border-top: 1px solid var(--anime-border);
}

.article-view__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-5);
  color: var(--anime-muted);
}

.article-view__date-item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.article-view__date-item > span {
  display: grid;
  gap: 0.08rem;
}

.article-view__date-item small {
  color: var(--anime-muted);
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.08em;
  line-height: 1.2;
}

.article-view__date-item time {
  color: var(--anime-text-soft);
  font-size: var(--text-xs);
  font-variant-numeric: tabular-nums;
  line-height: 1.3;
}

.article-view__share-control {
  position: relative;
  flex: none;
}

.article-view__share-button {
  position: relative;
  display: grid;
  width: 2.85rem;
  height: 2.85rem;
  place-items: center;
  overflow: hidden;
  border: 1px solid transparent;
  border-radius: 50%;
  background:
    linear-gradient(var(--anime-glass-strong), var(--anime-glass-strong)) padding-box,
    linear-gradient(135deg, #9fc5ff, #c5b5ff 56%, #ffb5d0) border-box;
  color: var(--anime-text-soft);
  cursor: pointer;
  box-shadow:
    0 0.5rem 1.5rem rgb(5 10 32 / 18%),
    inset 0 1px rgb(255 255 255 / 20%);
  backdrop-filter: blur(0.9rem);
  transition:
    color var(--transition-fast),
    box-shadow var(--transition-normal),
    transform var(--transition-press);
}

.article-view__share-button::after {
  position: absolute;
  top: 0.38rem;
  right: 0.42rem;
  width: 0.26rem;
  height: 0.26rem;
  border-radius: 50%;
  background: #ffd2e2;
  box-shadow: 0 0 0.5rem #ffd2e2;
  content: '';
  opacity: 0.72;
}

.article-view__share-button:active {
  transform: scale(0.93);
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
  grid-column: 1;
  padding: clamp(var(--space-6), 6vw, var(--space-12));
}

.article-view__toc {
  position: sticky;
  top: 7rem;
  grid-column: 2;
  grid-row: 1 / span 3;
}

.article-view__source {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-5);
  grid-column: 1;
  padding: var(--space-5) var(--space-6);
  border-top: 1px solid var(--anime-border);
}

.article-view__source p {
  max-width: 36rem;
  color: var(--anime-text-soft);
  font-size: var(--text-sm);
  line-height: 1.7;
}

.article-view__pager {
  display: grid;
  grid-column: 1;
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
  .article-view__share-button:hover {
    color: var(--anime-text);
    box-shadow:
      0 0.65rem 1.8rem rgb(5 10 32 / 24%),
      0 0 1.1rem rgb(169 184 255 / 18%),
      inset 0 1px rgb(255 255 255 / 26%);
    transform: translateY(-0.12rem) rotate(-3deg);
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
  .article-view__utility-row {
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

@media (max-width: 64rem) {
  .article-view__layout {
    grid-template-columns: minmax(0, var(--article-max-width));
  }

  .article-view__toc {
    position: static;
    grid-column: 1;
    grid-row: 2;
    max-width: 32rem;
  }

  .article-view__body {
    grid-row: 3;
  }

  .article-view__source {
    grid-row: 4;
  }

  .article-view__pager {
    grid-row: 5;
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

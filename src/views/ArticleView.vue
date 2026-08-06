<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import ArticleTableOfContents from '@/components/articles/ArticleTableOfContents.vue'
import MarkdownContent from '@/components/articles/MarkdownContent.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseTag from '@/components/ui/BaseTag.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import { getArticle } from '@/content/articles'
import { siteConfig } from '@/config/site'
import { updateSeo } from '@/utils/seo'

const route = useRoute()
const article = computed(() => getArticle(String(route.params.slug)))
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

watchEffect(() => {
  updateSeo(
    article.value
      ? {
          title: `${article.value.title} · ${siteConfig.meta.name}`,
          description: article.value.description,
          path: route.fullPath,
          type: 'article',
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
  <article v-if="article" class="article-view page-shell">
    <BaseButton to="/articles" variant="quiet">
      <IconGlyph name="arrow-right" class="article-view__back-icon" :size="16" /> 返回文章
    </BaseButton>

    <div class="article-view__layout">
      <header class="article-view__header">
        <p class="eyebrow">Article</p>
        <h1 id="article-title">{{ article.title }}</h1>
        <p class="article-view__description">{{ article.description }}</p>
        <div class="article-view__meta">
          <time :datetime="article.publishedAt">{{ article.displayDate }}</time>
          <span><IconGlyph name="clock" :size="13" /> 约 {{ article.readingMinutes }} 分钟阅读</span>
        </div>
        <div class="article-view__tags">
          <BaseTag v-for="tag in article.tags" :key="tag">{{ tag }}</BaseTag>
        </div>
      </header>

      <ArticleTableOfContents
        v-if="tocHeadings.length"
        class="article-view__toc"
        :title="siteConfig.sections.articles.toc.title"
        :headings="tocHeadings"
      />

      <BaseCard class="article-view__body" :hoverable="false" variant="solid">
        <MarkdownContent :blocks="article.blocks" />
      </BaseCard>

      <footer v-if="article.sourceUrl" class="article-view__source">
        <p>这里是简要导读，完整步骤、版本说明与注意事项请前往文档站查看。</p>
        <BaseButton :href="article.sourceUrl" target="_blank" variant="secondary">
          {{ article.sourceLabel ?? '查看完整文档' }}
          <IconGlyph name="arrow-up-right" :size="16" />
        </BaseButton>
      </footer>
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

.article-view__meta,
.article-view__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.article-view__meta {
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

.article-view__meta span {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
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
  .article-view__source {
    align-items: stretch;
    flex-direction: column;
    padding-inline: 0;
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
}
</style>

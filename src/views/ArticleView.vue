<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import ArticleTableOfContents from '@/components/articles/ArticleTableOfContents.vue'
import MarkdownContent from '@/components/articles/MarkdownContent.vue'
import ReadingTools from '@/components/articles/ReadingTools.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import { renderMarkdown } from '@/content/articles/renderer'
import { articles, getArticle } from '@/content/articles'
import { siteConfig } from '@/config/site'
import { updateSeo } from '@/utils/seo'
const route = useRoute()
const article = computed(() => getArticle(String(route.params.slug)))
const rendered = computed(() =>
  article.value ? renderMarkdown(article.value.body) : { html: '', headings: [] },
)
const index = computed(() => articles.findIndex((a) => a.slug === article.value?.slug))
const newer = computed(() => (index.value > 0 ? articles[index.value - 1] : undefined))
const older = computed(() => (index.value >= 0 ? articles[index.value + 1] : undefined))
const headings = computed(() => {
  const config = siteConfig.sections.articles.toc
  if (!config.enabled || !article.value) return []
  const min = Math.min(config.minLevel, config.maxLevel)
  const max = Math.max(config.minLevel, config.maxLevel)
  return [
    { id: 'article-title', text: article.value.title, level: 1 as const },
    ...rendered.value.headings,
  ].filter((h) => h.level >= min && h.level <= max)
})
watchEffect(() =>
  updateSeo(
    article.value
      ? {
          title: article.value.title + ' · ' + siteConfig.meta.name,
          description: article.value.description,
          path: route.path,
          type: 'article',
          image: article.value.cover,
          publishedAt: article.value.publishedAt,
          updatedAt: article.value.updatedAt,
          tags: article.value.tags,
        }
      : {
          title: '文章未找到 · ' + siteConfig.meta.name,
          description: '请求的文章不存在或已经移动。',
          path: route.path,
          noIndex: true,
        },
  ),
)
</script>
<template>
  <div class="article-view page-shell page-content">
    <template v-if="article"
      ><RouterLink class="text-link article-back" to="/articles"
        ><IconGlyph name="arrow-right" class="back-arrow" :size="16" />返回文章归档</RouterLink
      >
      <div class="article-layout">
        <div class="article-column">
          <article class="article-surface">
            <header class="article-header">
              <p v-if="article.sourceUrl" class="eyebrow">导读 · 本站简要笔记</p>
              <h1 id="article-title">{{ article.title }}</h1>
              <p class="article-description">{{ article.description }}</p>
              <div class="article-meta">
                <time :datetime="article.publishedAt">发布于 {{ article.displayDate }}</time
                ><time v-if="article.updatedAt" :datetime="article.updatedAt"
                  >更新于 {{ article.displayUpdatedAt }}</time
                >
              </div>
              <div class="article-tags">
                <RouterLink
                  v-for="tag in article.tags"
                  :key="tag"
                  class="chip"
                  :to="'/articles/tags/' + encodeURIComponent(tag)"
                  >{{ tag }}</RouterLink
                >
              </div>
              <p v-if="article.sourceUrl" class="article-guide-note">
                完整步骤与版本说明见
                <a :href="article.sourceUrl" target="_blank" rel="noopener noreferrer"
                  >{{ article.sourceLabel ?? '原始文档' }}
                  <IconGlyph name="arrow-up-right" :size="14" /></a
                >。
              </p>
            </header>
            <div class="article-body"><MarkdownContent :html="rendered.html" /></div>
          </article>
          <section v-if="article.sourceUrl" class="article-source paper">
            <h2>继续阅读完整文档</h2>
            <p>这里是简要导读，完整步骤、版本说明与注意事项请前往文档站查看。</p>
            <BaseButton :href="article.sourceUrl" target="_blank" variant="secondary"
              >{{ article.sourceLabel ?? '查看完整文档'
              }}<IconGlyph name="arrow-up-right" :size="16"
            /></BaseButton>
          </section>
          <nav v-if="newer || older" class="article-pager" aria-label="相邻文章">
            <RouterLink v-if="newer" :to="'/articles/' + newer.slug"
              ><span>较新一篇</span><strong>{{ newer.title }}</strong></RouterLink
            ><RouterLink v-if="older" :to="'/articles/' + older.slug"
              ><span>较早一篇</span><strong>{{ older.title }}</strong></RouterLink
            >
          </nav>
        </div>
        <ArticleTableOfContents
          v-if="headings.length"
          class="article-toc-position"
          :title="siteConfig.sections.articles.toc.title"
          :headings="headings"
        />
      </div>
      <ReadingTools :title="article.title" /></template
    ><EmptyState
      v-else
      label="404 · 文章未找到"
      title="这篇文章没有在这里"
      description="文章地址可能已经变化。可以回到归档查找标题，或从首页继续浏览。"
      ><BaseButton to="/articles">查看文章归档</BaseButton
      ><BaseButton to="/" variant="secondary">回到首页</BaseButton></EmptyState
    >
  </div>
</template>
<style scoped>
.article-back {
  margin-bottom: 1.5rem;
  font-size: var(--text-sm);
}
.back-arrow {
  transform: rotate(180deg);
}
.article-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 15rem;
  align-items: start;
  gap: 2rem;
}
.article-column {
  min-width: 0;
  grid-column: 1;
  grid-row: 1;
}
.article-surface {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-large);
}
.article-header,
.article-body {
  padding: clamp(1.25rem, 4vw, 3rem);
}
.article-header {
  border-bottom: 1px solid var(--color-border-soft);
}
.article-header h1 {
  scroll-margin-top: calc(var(--header-clearance) + 5rem);
  font-size: clamp(1.8rem, 3.2vw, 2.65rem);
  line-height: 1.4;
}
.article-description {
  margin-top: 1.25rem;
  color: var(--color-text-secondary);
  font-size: var(--text-lg);
}
.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
  margin-top: 1.5rem;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}
.article-guide-note {
  margin-top: 1.5rem;
  padding: 0.75rem 1rem;
  background: var(--color-background-soft);
  color: var(--color-text-secondary);
  border-radius: var(--radius-small);
  font-size: var(--text-sm);
}
.article-guide-note a {
  color: var(--color-link);
  text-decoration: underline;
  text-underline-offset: 0.25em;
}
.article-guide-note svg {
  display: inline;
  vertical-align: middle;
}
.article-source {
  margin-top: 1.5rem;
}
.article-source h2 {
  font-size: var(--text-lg);
  margin-bottom: 0.75rem;
}
.article-source p {
  margin-bottom: 1rem;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}
.article-pager {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}
.article-pager a {
  display: grid;
  gap: 0.5rem;
  padding: 1.25rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-medium);
}
.article-pager span {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
.article-pager strong {
  font-size: var(--text-sm);
  font-weight: 600;
  overflow-wrap: anywhere;
}
.article-pager a:hover {
  background: var(--color-primary-soft);
}
.article-toc-position {
  position: sticky;
  top: var(--header-clearance);
  grid-column: 2;
  grid-row: 1;
}
@media (max-width: 1000px) {
  .article-layout {
    grid-template-columns: minmax(0, 1fr);
    gap: 1rem;
  }
  .article-column {
    grid-column: 1;
    grid-row: 2;
  }
  .article-toc-position {
    grid-column: 1;
    grid-row: 1;
    z-index: 10;
  }
}
@media (max-width: 540px) {
  .article-view {
    padding-top: 0.5rem;
  }
  .article-pager {
    grid-template-columns: 1fr;
  }
  .article-description {
    font-size: var(--text-base);
  }
}
</style>

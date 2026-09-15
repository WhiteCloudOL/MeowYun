<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import ArticleTableOfContents from '@/components/articles/ArticleTableOfContents.vue'
import MarkdownContent from '@/components/articles/MarkdownContent.vue'
import ReaderBookmark from '@/components/articles/ReaderBookmark.vue'
import { useReadingPreferences } from '@/composables/useReadingPreferences'
import ReadingTools from '@/components/articles/ReadingTools.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import ImageFallback from '@/components/ui/ImageFallback.vue'
import { renderMarkdown } from '@/content/articles/renderer'
import { articles, getArticle } from '@/content/articles'
import { siteConfig } from '@/config/site'
import { updateSeo } from '@/utils/seo'
const { settings } = useReadingPreferences()
const route = useRoute()
const article = computed(() => getArticle(String(route.params.slug)))
const rendered = computed(() =>
  article.value ? renderMarkdown(article.value.body) : { html: '', headings: [] },
)
const index = computed(() => articles.findIndex((a) => a.slug === article.value?.slug))
const newer = computed(() => (index.value > 0 ? articles[index.value - 1] : undefined))
const older = computed(() => (index.value >= 0 ? articles[index.value + 1] : undefined))
const cover = computed(
  () =>
    article.value?.cover ??
    siteConfig.sections.articles.covers.find((c) => c.slug === article.value?.slug)?.image,
)
const related = computed(() => {
  const tags = new Set(article.value?.tags.map((t) => t.toLocaleLowerCase()))
  return articles
    .filter((a) => a.slug !== article.value?.slug)
    .map((a) => ({ article: a, tags: a.tags.filter((t) => tags.has(t.toLocaleLowerCase())) }))
    .filter((a) => a.tags.length)
    .sort((a, b) => b.tags.length - a.tags.length)
    .slice(0, 3)
})
const relatedProjects = computed(() => {
  const tags = new Set(article.value?.tags.map((t) => t.toLocaleLowerCase()))
  return siteConfig.sections.projects.items
    .filter((p) => p.enabled)
    .map((project) => ({
      project,
      tags: project.technologies.filter((t) => tags.has(t.toLocaleLowerCase())),
    }))
    .filter((p) => p.tags.length)
    .slice(0, 3)
})
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
          <article
            class="article-surface"
            :style="{
              '--reader-font-size': settings.fontSize + 'px',
              '--reader-line-height': settings.lineHeight,
            }"
          >
            <header class="article-header">
              <ImageFallback
                v-if="cover"
                class="article-cover"
                :src="cover"
                alt=""
                loading="eager"
                :data-transition-key="'article-' + article.slug"
              />
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
              <ReaderBookmark :article-id="'article-' + article.slug" />
            </header>
            <div class="article-body"><MarkdownContent :html="rendered.html" /></div>
          </article>
          <ReadingTools :title="article.title" />
          <section v-if="article.sourceUrl" class="article-source paper">
            <h2>继续阅读完整文档</h2>
            <p>这里是简要导读，完整步骤、版本说明与注意事项请前往文档站查看。</p>
            <BaseButton :href="article.sourceUrl" target="_blank" variant="secondary"
              >{{ article.sourceLabel ?? '查看完整文档'
              }}<IconGlyph name="arrow-up-right" :size="16"
            /></BaseButton>
          </section>
          <section
            v-if="related.length || relatedProjects.length"
            class="article-related paper"
            aria-labelledby="related-title"
          >
            <h2 id="related-title">沿着同一个话题，继续看看</h2>
            <div v-for="item in related" :key="item.article.slug">
              <RouterLink :to="'/articles/' + item.article.slug" class="text-link"
                >{{ item.article.title }} →</RouterLink
              >
              <p>共同标签：{{ item.tags.join('、') }}</p>
            </div>
            <div v-for="item in relatedProjects" :key="item.project.id">
              <RouterLink :to="'/projects/' + item.project.id" class="text-link"
                >作品 · {{ item.project.title }} →</RouterLink
              >
              <p>共同技术：{{ item.tags.join('、') }}</p>
            </div>
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
      </div> </template
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
  border: 1px solid var(--color-rim);
  border-radius: var(--radius-large);
  box-shadow: var(--shadow-card);
}
.article-header,
.article-body {
  padding: clamp(1.25rem, 4vw, 3rem);
}
.article-header {
  border-bottom: 1px solid var(--color-border-soft);
}
.article-cover {
  width: 6rem;
  height: 6rem;
  border-radius: 30% 35% 29% 32%;
  margin-bottom: 1.25rem;
}
.article-related {
  margin-top: 1.5rem;
}
.article-related h2 {
  font-size: var(--text-lg);
  margin-bottom: 1rem;
}
.article-related > div + div {
  margin-top: 0.75rem;
}
.article-related a {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}
.article-related p {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
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
  background: var(--color-surface-glass);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-rim);
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

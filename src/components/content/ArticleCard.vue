<script setup lang="ts">
import ImageFallback from '@/components/ui/ImageFallback.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import type { Article } from '@/content/articles'
import { siteConfig } from '@/config/site'
const props = defineProps<{ article: Article; compact?: boolean }>()
const cover = siteConfig.sections.articles.covers.find((x) => x.slug === props.article.slug)
</script>
<template>
  <article class="article-card" :class="{ 'article-card--compact': compact }">
    <RouterLink class="article-card__link" :to="'/articles/' + article.slug"
      ><ImageFallback
        class="article-card__image"
        :src="article.cover ?? cover?.image"
        alt=""
        :icon="article.icon ?? 'book-open'"
        :style="{ objectPosition: cover?.position }" />
      <div>
        <div class="article-card__meta">
          <time :datetime="article.publishedAt">{{ article.displayDate }}</time
          ><span v-if="article.sourceUrl" class="badge">导读</span>
        </div>
        <h3>{{ article.title }}</h3>
        <p>{{ article.description }}</p>
        <span class="article-card__read"
          >阅读笔记 <IconGlyph name="arrow-right" :size="16"
        /></span></div
    ></RouterLink>
    <div class="article-card__tags">
      <RouterLink
        v-for="tag in article.tags"
        :key="tag"
        class="chip"
        :to="'/articles/tags/' + encodeURIComponent(tag)"
        >{{ tag }}</RouterLink
      >
    </div>
  </article>
</template>
<style scoped>
.article-card {
  padding-block: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}
.article-card__link {
  display: grid;
  grid-template-columns: 8rem minmax(0, 1fr);
  gap: 1.5rem;
  border-radius: var(--radius-small);
}
.article-card__image {
  width: 100%;
  aspect-ratio: 1;
  height: 8rem;
  border-radius: var(--radius-medium);
}
.article-card__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  color: var(--color-text-secondary);
  font-size: var(--text-xs);
  margin-bottom: 0.5rem;
}
.article-card h3 {
  font-size: var(--text-lg);
  margin-bottom: 0.5rem;
}
.article-card p {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
.article-card__read {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-link);
  font-size: var(--text-sm);
  margin-top: 0.75rem;
}
.article-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.8rem;
  padding-left: 9.5rem;
}
.article-card__link:hover h3 {
  color: var(--color-link);
}
@media (max-width: 540px) {
  .article-card__link {
    grid-template-columns: 4rem minmax(0, 1fr);
    gap: 0.8rem;
  }
  .article-card__image {
    height: 4rem;
  }
  .article-card__tags {
    padding-left: 0;
  }
  .article-card h3 {
    font-size: 1rem;
  }
}
</style>

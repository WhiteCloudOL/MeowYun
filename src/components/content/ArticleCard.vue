<script setup lang="ts">
import SaveButton from '@/components/content/SaveButton.vue'
import ImageFallback from '@/components/ui/ImageFallback.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import type { Article } from '@/content/articles'
import { siteConfig } from '@/config/site'
import { useRoute } from 'vue-router'
const route = useRoute()
const props = defineProps<{ article: Article; compact?: boolean; layout?: 'shelf' | 'list' }>()
const cover = siteConfig.sections.articles.covers.find((x) => x.slug === props.article.slug)
</script>
<template>
  <article
    class="article-card"
    :class="{
      'article-card--compact': compact,
      'article-card--shelf': compact || layout === 'shelf',
    }"
  >
    <RouterLink class="article-card__link" :to="'/articles/' + article.slug"
      ><ImageFallback
        class="article-card__image"
        :data-transition-key="'article-' + article.slug"
        :src="article.cover ?? cover?.image"
        alt=""
        :icon="article.icon ?? 'book-open'"
        :position="cover?.position" />
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
        :to="{
          path: '/articles/tags/' + encodeURIComponent(tag),
          query: typeof route.query.q === 'string' ? { q: route.query.q } : {},
        }"
        >{{ tag }}</RouterLink
      >
    </div>
    <SaveButton :id="'article-' + article.slug" compact class="article-save" />
  </article>
</template>
<style scoped>
.article-card {
  position: relative;
  rotate: none;
  padding: 1.25rem;
  border: 1px solid var(--color-rim);
  border-radius: 27px 34px 26px 31px;
  background: var(--color-surface-glass);
  box-shadow: var(--shadow-card);
}
.article-card__link {
  transform: none;
  rotate: none;
  animation: none;
  display: grid;
  grid-template-columns: 6rem minmax(0, 1fr);
  gap: 1.25rem;
  border-radius: var(--radius-small);
  padding-right: 2rem;
}
.article-card__image {
  width: 6rem;
  height: 6rem;
  border-radius: 35% 31% 37% 25% / 31% 34% 29% 42%;
}
.article-card__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
  color: var(--color-text-secondary);
  font-size: var(--text-xs);
  margin-bottom: 0.4rem;
}
.article-card h3 {
  font-size: var(--text-lg);
  margin-bottom: 0.4rem;
}
.article-card p {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
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
  min-height: 44px;
  margin-top: 0.25rem;
}
.article-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding: 0 3.5rem 0 7.25rem;
  margin-top: 0.5rem;
}
.article-save {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
}
.article-card__link:hover h3 {
  color: var(--color-link);
}
.article-card--shelf .article-card__link {
  display: flex;
  flex-direction: column;
  padding-right: 0;
}
.article-card--shelf .article-card__image {
  width: 100%;
  height: 10rem;
  border-radius: var(--radius-medium);
}
.article-card--shelf .article-card__tags {
  padding-left: 0;
}
@media (max-width: 600px) {
  .article-card {
    padding: 1rem;
  }
  .article-card__link {
    grid-template-columns: 4.5rem minmax(0, 1fr);
    gap: 0.8rem;
    padding-right: 0;
  }
  .article-card__image {
    width: 4.5rem;
    height: 5rem;
  }
  .article-card h3 {
    font-size: 1rem;
  }
  .article-card__tags {
    padding-left: 0;
  }
  .article-save {
    right: 0.75rem;
    bottom: 0.75rem;
  }
}
</style>

<script setup lang="ts">
import type { ArticleBlock } from '@/content/articles'

defineProps<{
  blocks: ArticleBlock[]
}>()
</script>

<template>
  <div class="markdown-content">
    <template v-for="(block, index) in blocks" :key="`${block.type}-${index}`">
      <component
        :is="`h${block.level}`"
        v-if="block.type === 'heading'"
        :id="block.id"
        class="markdown-content__heading"
      >
        {{ block.text }}
      </component>
      <p v-else-if="block.type === 'paragraph'">{{ block.text }}</p>
      <ul v-else-if="block.type === 'list'">
        <li v-for="item in block.items" :key="item">{{ item }}</li>
      </ul>
      <blockquote v-else-if="block.type === 'quote'">{{ block.text }}</blockquote>
      <figure v-else-if="block.type === 'image'" class="markdown-content__image">
        <img :src="block.src" :alt="block.alt" loading="lazy" />
        <figcaption v-if="block.alt">{{ block.alt }}</figcaption>
      </figure>
      <div v-else-if="block.type === 'code'" class="markdown-content__code">
        <span v-if="block.language">{{ block.language }}</span>
        <pre><code>{{ block.content }}</code></pre>
      </div>
    </template>
  </div>
</template>

<style scoped>
.markdown-content {
  color: var(--anime-text-soft);
  font-size: 1.05rem;
  line-height: 1.85;
}

.markdown-content > * + * {
  margin-top: var(--space-6);
}

.markdown-content__heading {
  scroll-margin-top: 7rem;
  color: var(--anime-text);
  font-weight: 760;
  letter-spacing: -0.03em;
  line-height: 1.3;
}

.markdown-content h1,
.markdown-content h2 {
  padding-top: var(--space-8);
  font-size: var(--text-2xl);
}

.markdown-content h3,
.markdown-content h4 {
  padding-top: var(--space-4);
  font-size: var(--text-xl);
}

.markdown-content h4 {
  font-size: var(--text-lg);
}

.markdown-content ul {
  display: grid;
  gap: var(--space-2);
  padding-left: 1.3rem;
}

.markdown-content li::marker {
  color: var(--color-primary);
}

.markdown-content blockquote {
  padding: var(--space-5) var(--space-6);
  border-left: 0.25rem solid var(--color-primary);
  border-radius: 0 var(--radius-medium) var(--radius-medium) 0;
  background: var(--color-primary-soft);
  color: var(--anime-text);
  font-weight: 600;
}

.markdown-content__code {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-medium);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.markdown-content__image {
  overflow: hidden;
  border: 1px solid var(--anime-border-bright);
  border-radius: var(--radius-large);
  background: var(--anime-glass);
  box-shadow: var(--anime-shadow);
}

.markdown-content__image img {
  width: 100%;
  max-height: 34rem;
  object-fit: cover;
}

.markdown-content__image figcaption {
  padding: 0.7rem 1rem;
  color: var(--anime-muted);
  font-size: var(--text-xs);
  text-align: center;
}

.markdown-content__code > span {
  display: block;
  padding: var(--space-2) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  color: var(--anime-muted);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

.markdown-content pre {
  overflow-x: auto;
  padding: var(--space-5);
  color: var(--anime-text);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: 1.65;
  tab-size: 2;
}

@media (max-width: 36rem) {
  .markdown-content {
    font-size: var(--text-base);
  }

  .markdown-content blockquote {
    padding: var(--space-4);
  }
}
</style>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { articles } from '@/content/articles'
import { siteConfig } from '@/config/site'
import { siteUpdates } from '@/config/updates'
const type = ref('全部')
const events = [
  ...articles.map((a) => ({
    id: 'article-' + a.slug,
    date: a.publishedAt,
    type: '文章发布',
    text: a.title,
    description: a.description,
    href: '/articles/' + a.slug,
  })),
  ...(siteConfig.updates ?? siteUpdates).map((u, i) => ({
    id: 'update-' + i,
    date: u.date,
    type: '站点更新',
    text: u.text,
    description: '已实际完成的站点改动',
    href: u.href,
  })),
  ...(siteConfig.nowNote
    ? [
        {
          id: 'now',
          date: siteConfig.nowNote.date,
          type: '作者小记',
          text: siteConfig.nowNote.text,
          description: '作者填写的真实近况',
          href: siteConfig.nowNote.href,
        },
      ]
    : []),
].sort((a, b) => b.date.localeCompare(a.date))
const filtered = computed(() =>
  events.filter((e) => type.value === '全部' || e.type === type.value),
)
</script>
<template>
  <div class="moments-view page-shell page-content">
    <header class="moments-heading">
      <span class="material-label">云间小记</span>
      <h1>一些发生过的小事。</h1>
      <p>文章发布、站点变化与作者近况，沿着时间慢慢翻阅。</p>
    </header>
    <div class="moment-filters">
      <button
        v-for="value in ['全部', ...new Set(events.map((e) => e.type))]"
        :key="value"
        type="button"
        class="chip"
        :aria-pressed="type === value"
        @click="type = value"
      >
        {{ value }}
      </button>
    </div>
    <ol class="moments-line">
      <li v-for="event in filtered" :key="event.id">
        <time :datetime="event.date">{{ event.date }}</time>
        <article :class="{ 'moment-post': event.type === '文章发布' }">
          <span>{{ event.type }}</span>
          <h2>{{ event.text }}</h2>
          <p>{{ event.description }}</p>
          <RouterLink v-if="event.href?.startsWith('/')" :to="event.href" class="text-link"
            >打开这条记录 →</RouterLink
          ><a
            v-else-if="event.href"
            :href="event.href"
            target="_blank"
            rel="noopener noreferrer"
            class="text-link"
            >相关链接 ↗</a
          >
        </article>
      </li>
    </ol>
  </div>
</template>
<style scoped>
.moments-view {
  max-width: 60rem;
}
.moments-heading {
  margin-bottom: 2rem;
}
.moments-heading h1 {
  font-size: var(--text-2xl);
}
.moments-heading p {
  color: var(--color-text-secondary);
  margin-top: 1rem;
}
.moment-filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}
.moments-line {
  list-style: none;
  padding: 0;
}
.moments-line li {
  position: relative;
  display: grid;
  grid-template-columns: 8rem 1fr;
  gap: 1.5rem;
  padding-bottom: 2.5rem;
}
.moments-line li::before {
  content: '';
  position: absolute;
  left: 8.8rem;
  top: 1rem;
  bottom: 0;
  border-left: 2px dashed var(--color-border);
}
.moments-line time {
  font: var(--text-sm)/1.7 var(--font-mono);
  color: var(--color-link);
  padding-top: 1rem;
}
.moments-line article {
  position: relative;
  padding: 1.5rem;
  border: 1px solid var(--color-rim);
  border-radius: var(--radius-jelly);
  background: linear-gradient(150deg, rgb(var(--tone-rose) / 0.2), var(--color-surface-glass));
  box-shadow: var(--shadow-card);
}
.moments-line .moment-post {
  background: linear-gradient(150deg, rgb(var(--tone-blue) / 0.2), var(--color-surface-glass));
}
.moments-line article > span {
  font-size: var(--text-xs);
  color: var(--color-link);
}
.moments-line h2 {
  font-size: var(--text-lg);
  margin: 0.6rem 0;
}
.moments-line p {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}
@media (max-width: 600px) {
  .moments-line li {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  .moments-line li::before {
    display: none;
  }
  .moments-line article {
    padding: 1.2rem;
  }
  .moments-heading p {
    font-size: var(--text-sm);
  }
}
</style>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { articles, type Article } from '@/content/articles'
import { searchArticles } from '@/utils/search'
import { updateSeo } from '@/utils/seo'
import { siteConfig } from '@/config/site'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import ImageFallback from '@/components/ui/ImageFallback.vue'
import ArticleCard from '@/components/content/ArticleCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import SearchField from '@/components/ui/SearchField.vue'
import { archiveSeo } from '@/utils/routeSeo'
const route = useRoute()
const router = useRouter()
const query = ref(typeof route.query.q === 'string' ? route.query.q : '')
const composing = ref(false)
const selectedTag = computed(() =>
  typeof route.params.tag === 'string' ? route.params.tag : undefined,
)
const appliedQuery = computed(() => (typeof route.query.q === 'string' ? route.query.q : ''))
const filtered = computed(() => searchArticles(appliedQuery.value, selectedTag.value))
const tags = [...new Set(articles.flatMap((a) => a.tags))]
const groups = computed(() => {
  const groups = new Map<string, Article[]>()
  for (const article of filtered.value) {
    const year = article.publishedAt.slice(0, 4)
    groups.set(year, [...(groups.get(year) ?? []), article])
  }
  return [...groups].map(([year, items]) => ({ year, items }))
})
let timer: ReturnType<typeof setTimeout> | undefined
let editing = false
let updatingUrl = false
async function syncQuery(submit = false) {
  if (timer) clearTimeout(timer)
  if (composing.value) return
  const q = query.value.trim()
  if (q !== appliedQuery.value) {
    updatingUrl = true
    // 一次输入会话只新建一个历史项，其余按键 replace；提交或标签导航开始下一次会话。
    const method = editing && !submit ? 'replace' : 'push'
    await router[method]({ path: route.path, query: q ? { q } : {} })
    updatingUrl = false
  }
  editing = !submit
}
function finishComposition() {
  composing.value = false
  inputChanged()
}
function inputChanged() {
  if (composing.value) return
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    void syncQuery()
  }, 220)
}
function tagLink(tag?: string) {
  return {
    path: tag ? '/articles/tags/' + encodeURIComponent(tag) : '/articles',
    query: query.value.trim() ? { q: query.value.trim() } : {},
  }
}
async function clear(which: 'query' | 'tag' | 'all') {
  if (timer) clearTimeout(timer)
  editing = false
  if (which !== 'tag') query.value = ''
  await router.push({
    path: which === 'query' ? route.path : '/articles',
    query: which === 'tag' && query.value.trim() ? { q: query.value.trim() } : {},
  })
}
watch(
  () => route.fullPath,
  () => {
    if (timer) clearTimeout(timer)
    if (!updatingUrl) editing = false
    if (!composing.value) query.value = appliedQuery.value
  },
)
onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})
watchEffect(() =>
  updateSeo({
    ...archiveSeo(siteConfig.meta.name, selectedTag.value),
    path: route.path,
    noIndex: !!appliedQuery.value.trim(),
  }),
)
</script>
<template>
  <div class="articles-view page-shell page-content">
    <section class="archive" aria-labelledby="articles-title">
      <header class="section-heading">
        <div>
          <h1 id="articles-title">文章与笔记</h1>
          <p class="muted">部署经验、开源工具与实践记录。</p>
        </div>
        <a class="text-link" href="/rss.xml" target="_blank" rel="noopener noreferrer"
          ><IconGlyph name="rss" :size="16" />RSS</a
        >
      </header>
      <form class="archive-search" role="search" @submit.prevent="syncQuery(true)">
        <SearchField
          v-model="query"
          label="搜索文章正文、标题与标签"
          name="q"
          placeholder="搜索标题、正文、技术关键词"
          @input="inputChanged"
          @compositionstart="composing = true"
          @compositionend="finishComposition"
          @clear="clear('query')"
        />
      </form>
      <nav class="archive-tags" aria-label="按标签筛选">
        <RouterLink class="chip" :to="tagLink()" :aria-current="!selectedTag ? 'page' : undefined"
          >全部</RouterLink
        ><RouterLink
          v-for="tag in tags"
          :key="tag"
          class="chip"
          :to="tagLink(tag)"
          :aria-current="selectedTag === tag ? 'page' : undefined"
          >{{ tag }}</RouterLink
        >
      </nav>
      <div class="filter-status">
        <p role="status">
          {{ selectedTag ? '#' + selectedTag + ' · ' : '' }}{{ filtered.length }} 篇文章{{
            appliedQuery ? ' · 搜索“' + appliedQuery + '”' : ''
          }}
        </p>
        <div v-if="appliedQuery || selectedTag" class="filter-clear">
          <button v-if="appliedQuery" class="text-link" type="button" @click="clear('query')">
            清除搜索词</button
          ><button v-if="selectedTag" class="text-link" type="button" @click="clear('tag')">
            清除标签</button
          ><button
            v-if="selectedTag && appliedQuery"
            class="text-link"
            type="button"
            @click="clear('all')"
          >
            清除全部
          </button>
        </div>
      </div>
      <section
        v-for="group in groups"
        :key="group.year"
        class="archive-year"
        :aria-label="group.year + '年文章'"
      >
        <h2>{{ group.year }}</h2>
        <ArticleCard v-for="article in group.items" :key="article.slug" :article="article" />
      </section>
      <div v-if="!filtered.length" class="archive-empty paper">
        <IconGlyph name="search" :size="32" />
        <h2>这一页还没有找到</h2>
        <p>试试更短的关键词，或清除当前筛选条件。</p>
        <BaseButton variant="secondary" @click="clear('all')">显示全部文章</BaseButton>
      </div>
    </section>
    <aside v-if="siteConfig.profile.enabled" class="archive-author" aria-label="作者资料">
      <ImageFallback
        :src="siteConfig.profile.avatar"
        :alt="siteConfig.profile.avatarAlt"
        class="archive-author__avatar"
      />
      <div>
        <h2>{{ siteConfig.profile.name }}</h2>
        <p>{{ siteConfig.profile.description }}</p>
        <RouterLink class="text-link" to="/#about"
          >关于作者 <IconGlyph name="arrow-right" :size="16"
        /></RouterLink>
      </div>
    </aside>
  </div>
</template>
<style scoped>
.articles-view {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 14rem;
  gap: 3rem;
}
.archive {
  min-width: 0;
  background: var(--color-surface);
  padding: clamp(1rem, 3vw, 2rem);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-large);
}
.archive h1 {
  font-size: var(--text-2xl);
}
.archive .section-heading {
  margin-bottom: 1.5rem;
}
.archive .section-heading p {
  font-size: var(--text-sm);
  margin-top: 0.5rem;
}
.archive-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.25rem;
}
.filter-status {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem;
  padding-block: 1rem;
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}
.filter-clear {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
}
.filter-clear button {
  background: transparent;
  border: 0;
}
.archive-year > h2 {
  font: var(--text-lg)/1.5 var(--font-mono);
  color: var(--color-text-muted);
  margin-top: 0.5rem;
}
.archive-year + .archive-year {
  margin-top: 2rem;
}
.archive-author {
  align-self: start;
  padding-top: 1rem;
}
.archive-author__avatar {
  width: 4.5rem;
  height: 4.5rem;
  border-radius: var(--radius-medium);
  margin-bottom: 1rem;
}
.archive-author h2 {
  font-size: var(--text-lg);
  margin-bottom: 0.75rem;
}
.archive-author p {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}
.archive-author .text-link {
  margin-top: 0.75rem;
  font-size: var(--text-sm);
}
.archive-empty {
  display: grid;
  justify-items: start;
  gap: 1rem;
  margin-top: 1rem;
}
@media (max-width: 1000px) {
  .articles-view {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .archive-author {
    display: flex;
    gap: 1rem;
    border-top: 1px solid var(--color-border);
  }
  .archive-author__avatar {
    flex: 0 0 4.5rem;
  }
}
@media (max-width: 540px) {
  .articles-view {
    padding-top: 0.5rem;
  }
  .archive {
    padding: 1rem;
  }
  .archive-tags {
    gap: 0.3rem;
    margin-top: 0.75rem;
  }
  .archive-tags .chip {
    padding: 0.35rem 0.65rem;
  }
  .filter-status {
    padding-block: 0.75rem;
  }
  .archive h1 {
    font-size: 1.5rem;
  }
  .archive .section-heading {
    gap: 0.25rem;
    margin-bottom: 1rem;
  }
  .archive .section-heading p {
    max-width: 13rem;
  }
}
</style>

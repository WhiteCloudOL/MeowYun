<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import ConfigIcon from '@/components/ui/ConfigIcon.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import { siteConfig } from '@/config/site'
import { articles, type Article } from '@/content/articles'

const route = useRoute()
const router = useRouter()
const searchQuery = ref(typeof route.query.q === 'string' ? route.query.q : '')
const enabledSocials = computed(() => siteConfig.profile.socials.filter((item) => item.enabled))
const tagCount = computed(() => new Set(articles.flatMap((article) => article.tags)).size)
const featuredIndex = articles.findIndex((article) => article.featured)
const selectedTag = computed(() =>
  typeof route.params.tag === 'string' ? route.params.tag : undefined,
)

const tags = computed(() => {
  const counts = new Map<string, number>()
  for (const article of articles) {
    for (const tag of article.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name, 'zh-CN'))
})

const filteredArticles = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase('zh-CN')

  return articles.filter((article) => {
    const matchesTag = !selectedTag.value || article.tags.includes(selectedTag.value)
    const matchesQuery = !query || article.searchText.includes(query)
    return matchesTag && matchesQuery
  })
})

const archiveGroups = computed(() => {
  const groups = new Map<string, Article[]>()
  for (const article of filteredArticles.value) {
    const year = article.publishedAt.slice(0, 4)
    groups.set(year, [...(groups.get(year) ?? []), article])
  }
  return [...groups.entries()].map(([year, items]) => ({ year, items }))
})

const coverFor = (slug: string) =>
  siteConfig.sections.articles.covers.find((cover) => cover.slug === slug)

const isFeatured = (index: number) => index === (featuredIndex === -1 ? 0 : featuredIndex)

const imageFor = (article: Article) => article.cover ?? coverFor(article.slug)?.image

function submitSearch() {
  const query = searchQuery.value.trim()
  void router.replace({
    path: route.path,
    query: query ? { q: query } : {},
  })
}

function clearFilters() {
  searchQuery.value = ''
  void router.push('/articles')
}

// 浏览器前进/后退时，用 URL 恢复可分享的搜索条件。
watch(
  () => route.query.q,
  (query) => {
    searchQuery.value = typeof query === 'string' ? query : ''
  },
)
</script>

<template>
  <div class="articles-view page-shell">
    <aside class="articles-profile" aria-label="作者资料">
      <BaseCard class="articles-profile__card" :hoverable="false">
        <BaseAvatar
          :src="siteConfig.profile.avatar"
          :alt="siteConfig.profile.avatarAlt"
          :initials="siteConfig.profile.name.slice(0, 1)"
          shape="squircle"
        />

        <div class="articles-profile__identity">
          <p>{{ siteConfig.profile.handle }}</p>
          <h2>{{ siteConfig.profile.name }}</h2>
          <span>{{ siteConfig.profile.tagline }}</span>
        </div>

        <div class="articles-profile__socials" aria-label="社交链接">
          <a
            v-for="social in enabledSocials"
            :key="social.id"
            :href="social.href"
            :aria-label="social.label"
            target="_blank"
            rel="noreferrer"
            :style="{ '--social-accent': social.color }"
          >
            <ConfigIcon :name="social.icon" :provider="social.iconProvider" :size="18" />
          </a>
        </div>

        <dl class="articles-profile__stats">
          <div>
            <dt>文章</dt>
            <dd>{{ articles.length }}</dd>
          </div>
          <div>
            <dt>标签</dt>
            <dd>{{ tagCount }}</dd>
          </div>
          <div>
            <dt>坐标</dt>
            <dd><IconGlyph name="map-pin" :size="13" /> {{ siteConfig.profile.location }}</dd>
          </div>
        </dl>

        <blockquote>{{ siteConfig.profile.quotes[0] }}</blockquote>
      </BaseCard>
    </aside>

    <section class="articles-archive" aria-labelledby="articles-title">
      <header class="articles-archive__header">
        <div>
          <p><IconGlyph name="feather" :size="14" /> WRITING ARCHIVE</p>
          <h1 id="articles-title">{{ selectedTag ? `# ${selectedTag}` : '文章与笔记' }}</h1>
        </div>
        <a class="articles-archive__rss" href="/rss.xml" aria-label="订阅 RSS">
          <IconGlyph name="rss" :size="15" /> RSS
        </a>
      </header>

      <form class="articles-tools" role="search" @submit.prevent="submitSearch">
        <label class="articles-search">
          <span class="articles-search__label">搜索文章</span>
          <IconGlyph name="search" :size="17" />
          <input v-model="searchQuery" type="search" placeholder="搜索标题、正文或技术关键词" />
          <button type="submit">搜索</button>
        </label>

        <nav class="articles-tags" aria-label="按标签筛选">
          <RouterLink to="/articles" :class="{ 'is-active': !selectedTag }">全部</RouterLink>
          <RouterLink
            v-for="tag in tags"
            :key="tag.name"
            :to="`/articles/tags/${encodeURIComponent(tag.name)}`"
            :class="{ 'is-active': selectedTag === tag.name }"
          >
            {{ tag.name }} <small>{{ tag.count }}</small>
          </RouterLink>
        </nav>
      </form>

      <div v-if="archiveGroups.length" class="articles-archive__groups">
        <section
          v-for="group in archiveGroups"
          :key="group.year"
          class="articles-year"
          :aria-labelledby="`articles-year-${group.year}`"
        >
          <header class="articles-year__heading">
            <h2 :id="`articles-year-${group.year}`">{{ group.year }}</h2>
            <span>{{ group.items.length }} 篇</span>
          </header>

          <div class="articles-list">
            <RouterLink
              v-for="article in group.items"
              :key="article.slug"
              :to="`/articles/${article.slug}`"
              class="article-item"
            >
              <span class="article-item__visual">
                <IconGlyph v-if="article.icon" :name="article.icon" :size="28" />
                <img
                  v-else-if="imageFor(article)"
                  :src="imageFor(article)"
                  :alt="`${article.title}缩略图`"
                  :style="{ objectPosition: coverFor(article.slug)?.position ?? 'center' }"
                  loading="lazy"
                />
                <IconGlyph v-else name="article" :size="28" />
              </span>

              <span class="article-item__content">
                <span class="article-item__topline">
                  <span
                    v-if="isFeatured(articles.findIndex((item) => item.slug === article.slug))"
                    class="article-item__featured"
                  >
                    <IconGlyph name="sparkles" :size="12" /> 推荐
                  </span>
                  <time :datetime="article.publishedAt">{{ article.displayDate }}</time>
                </span>
                <strong>{{ article.title }}</strong>
                <small>{{ article.description }}</small>
                <span class="article-item__meta">
                  <span v-for="tag in article.tags" :key="tag"># {{ tag }}</span>
                  <span>
                    <IconGlyph name="clock" :size="13" /> {{ article.readingMinutes }} 分钟
                  </span>
                </span>
              </span>

              <span class="article-item__arrow">
                <IconGlyph name="arrow-right" :size="19" />
              </span>
            </RouterLink>
          </div>
        </section>
      </div>

      <div v-else class="articles-empty">
        <IconGlyph name="search" :size="28" />
        <h2>没有找到匹配的文章</h2>
        <p>换一个关键词或清除标签后再试试。</p>
        <button type="button" @click="clearFilters">清除筛选</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.articles-view {
  display: grid;
  grid-template-columns: minmax(13.5rem, 17rem) minmax(0, 1fr);
  align-items: start;
  gap: clamp(2rem, 5vw, 5rem);
  padding-block: clamp(4rem, 9vw, 7rem) 7rem;
}

.articles-profile {
  position: sticky;
  top: 7rem;
  min-width: 0;
}

.articles-profile__card {
  display: grid;
  justify-items: center;
  gap: 1.25rem;
  padding: 1.35rem;
  text-align: center;
}

.articles-profile :deep(.base-avatar) {
  width: min(100%, 13rem);
  height: auto;
  aspect-ratio: 1;
  border-radius: 1.5rem;
}

.articles-profile__identity p {
  margin-bottom: 0.3rem;
  color: var(--anime-accent-soft);
  font-family: var(--font-mono);
  font-size: 0.69rem;
}

.articles-profile__identity {
  min-width: 0;
}

.articles-profile__identity h2 {
  margin: 0;
  font-size: 1.35rem;
  letter-spacing: -0.04em;
}

.articles-profile__identity span {
  display: block;
  margin-top: 0.45rem;
  color: var(--anime-muted);
  font-size: 0.76rem;
  line-height: 1.55;
}

.articles-profile__socials {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.55rem;
}

.articles-profile__socials a {
  display: grid;
  width: 2.35rem;
  height: 2.35rem;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--social-accent), transparent 70%);
  border-radius: 0.78rem;
  background: color-mix(in srgb, var(--social-accent), transparent 88%);
  color: var(--social-accent);
  transition:
    transform var(--transition-fast),
    background var(--transition-fast);
}

.articles-profile__stats {
  display: grid;
  width: 100%;
  gap: 0.4rem;
  margin: 0;
  padding: 0.75rem;
  border: 1px solid var(--anime-border);
  border-radius: 1rem;
  background: rgb(255 255 255 / 4%);
  text-align: left;
}

.articles-profile__stats div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-height: 1.7rem;
}

.articles-profile__stats dt {
  color: var(--anime-muted);
  font-size: 0.72rem;
}

.articles-profile__stats dd {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin: 0;
  color: var(--anime-text-soft);
  font-size: 0.72rem;
  font-weight: 700;
  text-align: right;
}

.articles-profile blockquote {
  margin: 0;
  color: var(--anime-muted);
  font-size: 0.74rem;
  font-style: normal;
  line-height: 1.75;
}

.articles-archive {
  min-width: 0;
}

.articles-archive__header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.articles-archive__header p {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--anime-accent-soft);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.15em;
}

.articles-archive__header h1 {
  margin: 0.4rem 0 0;
  font-size: clamp(2rem, 5vw, 3.8rem);
  letter-spacing: -0.065em;
}

.articles-archive__rss {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  gap: 0.45rem;
  padding-inline: 0.9rem;
  border: 1px solid var(--anime-border);
  border-radius: var(--radius-round);
  color: var(--anime-muted);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

.articles-tools {
  display: grid;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.articles-search {
  display: grid;
  min-height: 3.35rem;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-3);
  padding-left: var(--space-4);
  border: 1px solid var(--anime-border-bright);
  border-radius: 1rem;
  background: rgb(var(--anime-glass-rgb) / var(--site-glass-opacity, 46%));
  color: var(--anime-muted);
  backdrop-filter: blur(1rem);
}

.articles-search__label {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

.articles-search input {
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--anime-text);
  font: inherit;
}

.articles-search input::placeholder {
  color: var(--anime-muted);
}

.articles-search button,
.articles-empty button {
  min-height: 2.75rem;
  padding-inline: var(--space-4);
  border: 0;
  border-radius: 0.8rem;
  background: color-mix(in srgb, var(--site-accent) 16%, transparent);
  color: var(--anime-text);
  cursor: pointer;
  font-weight: 700;
}

.articles-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.articles-tags a {
  display: inline-flex;
  min-height: 2.4rem;
  align-items: center;
  gap: 0.35rem;
  padding-inline: 0.8rem;
  border: 1px solid var(--anime-border);
  border-radius: var(--radius-round);
  color: var(--anime-muted);
  font-size: var(--text-xs);
}

.articles-tags a.is-active {
  border-color: color-mix(in srgb, var(--site-accent), transparent 50%);
  background: color-mix(in srgb, var(--site-accent) 14%, transparent);
  color: var(--anime-text);
}

.articles-tags small {
  color: inherit;
  font-family: var(--font-mono);
  opacity: 0.72;
}

.articles-archive__groups,
.articles-year {
  display: grid;
  gap: var(--space-6);
}

.articles-archive__groups {
  gap: var(--space-10);
}

.articles-year__heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-inline: var(--space-2);
}

.articles-year__heading h2 {
  font-family: var(--font-mono);
  font-size: var(--text-lg);
  letter-spacing: -0.03em;
}

.articles-year__heading span {
  color: var(--anime-muted);
  font-size: var(--text-xs);
}

.articles-empty {
  display: grid;
  min-height: 20rem;
  place-items: center;
  align-content: center;
  gap: var(--space-3);
  border: 1px dashed var(--anime-border-bright);
  border-radius: var(--radius-large);
  color: var(--anime-muted);
  text-align: center;
}

.articles-empty h2 {
  color: var(--anime-text);
  font-size: var(--text-xl);
}

.articles-list {
  display: grid;
  min-width: 0;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.85rem;
}

.article-item {
  display: grid;
  width: 100%;
  min-width: 0;
  min-height: 10rem;
  grid-template-columns: 7.5rem minmax(0, 1fr) 3.2rem;
  align-items: stretch;
  gap: 1.2rem;
  padding: 0.8rem;
  overflow: hidden;
  border: 1px solid var(--anime-border-bright);
  border-radius: 1.35rem;
  background: rgb(var(--anime-glass-rgb) / var(--site-glass-opacity, 46%));
  color: var(--anime-text);
  box-shadow:
    var(--anime-shadow),
    inset 0 1px rgb(255 255 255 / 8%);
  backdrop-filter: blur(1rem) saturate(120%);
  -webkit-backdrop-filter: blur(1rem) saturate(120%);
  transition:
    transform var(--transition-normal),
    border-color var(--transition-normal),
    box-shadow var(--transition-normal);
}

.article-item__visual {
  display: grid;
  min-height: 8.4rem;
  overflow: hidden;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 1rem;
  background:
    radial-gradient(circle at 28% 20%, rgb(255 255 255 / 20%), transparent 38%),
    linear-gradient(145deg, rgb(172 185 255 / 35%), rgb(242 166 206 / 22%));
  color: #edf0ff;
}

.article-item__visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 600ms cubic-bezier(0.2, 0.75, 0.2, 1);
}

.article-item__content {
  display: grid;
  min-width: 0;
  align-content: center;
  gap: 0.55rem;
  padding-block: 0.4rem;
}

.article-item__topline,
.article-item__meta,
.article-item__featured,
.article-item__meta > span {
  display: flex;
  align-items: center;
}

.article-item__topline {
  flex-wrap: wrap;
  gap: 0.75rem;
  color: var(--anime-muted);
  font-family: var(--font-mono);
  font-size: 0.63rem;
}

.article-item__featured {
  gap: 0.28rem;
  color: var(--anime-accent-soft);
  font-family: var(--font-sans);
  font-weight: 750;
}

.article-item strong {
  overflow: hidden;
  font-size: clamp(1.05rem, 2.2vw, 1.45rem);
  line-height: 1.3;
  letter-spacing: -0.035em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-item small {
  overflow: hidden;
  color: var(--anime-muted);
  font-size: 0.76rem;
  line-height: 1.55;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-item__meta {
  flex-wrap: wrap;
  gap: 0.65rem;
  color: var(--anime-text-soft);
  font-size: 0.66rem;
}

.article-item__meta > span {
  gap: 0.3rem;
}

.article-item__arrow {
  display: grid;
  width: 100%;
  place-items: center;
  border: 1px solid rgb(190 164 255 / 18%);
  border-radius: 1rem;
  background: rgb(187 151 255 / 10%);
  color: var(--anime-accent-soft);
  transition:
    background var(--transition-fast),
    transform var(--transition-fast);
}

@media (hover: hover) {
  .articles-profile__socials a:hover {
    background: color-mix(in srgb, var(--social-accent), transparent 78%);
    transform: translateY(-0.15rem);
  }

  .article-item:hover {
    border-color: rgb(255 255 255 / 32%);
    box-shadow: 0 1.2rem 3.5rem rgb(3 7 24 / 32%);
    transform: translateY(-0.22rem);
  }

  .article-item:hover .article-item__visual img {
    transform: scale(1.055);
  }

  .article-item:hover .article-item__arrow {
    background: rgb(187 151 255 / 18%);
    transform: translateX(0.1rem);
  }
}

@media (max-width: 58rem) {
  .articles-view {
    grid-template-columns: 1fr;
  }

  .articles-profile {
    position: static;
  }

  .articles-profile__card {
    grid-template-columns: auto minmax(0, 1fr) auto;
    justify-items: start;
    text-align: left;
  }

  .articles-profile :deep(.base-avatar) {
    width: 6.5rem;
  }

  .articles-profile__socials {
    justify-content: end;
  }

  .articles-profile__stats,
  .articles-profile blockquote {
    grid-column: 1 / -1;
  }
}

@media (max-width: 40rem) {
  .articles-view {
    padding-top: 3rem;
  }

  .articles-profile__card {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .articles-profile__identity span {
    overflow-wrap: anywhere;
  }

  .articles-profile__socials {
    grid-column: 1 / -1;
    justify-content: start;
  }

  .article-item {
    grid-template-columns: 5.4rem minmax(0, 1fr);
    gap: 0.8rem;
  }

  .article-item__visual {
    min-height: 6.8rem;
  }

  .article-item__arrow {
    display: none;
  }

  .articles-search {
    grid-template-columns: auto minmax(0, 1fr);
    padding-right: var(--space-4);
  }

  .articles-search button {
    grid-column: 1 / -1;
    margin: 0 calc(var(--space-4) * -1) 0.3rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .article-item__visual img {
    transition: none;
  }
}
</style>

<script setup lang="ts">
import { computed } from 'vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import ConfigIcon from '@/components/ui/ConfigIcon.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import { siteConfig } from '@/config/site'
import { articles, type Article } from '@/content/articles'

const enabledSocials = computed(() => siteConfig.profile.socials.filter((item) => item.enabled))
const tagCount = computed(() => new Set(articles.flatMap((article) => article.tags)).size)
const featuredIndex = articles.findIndex((article) => article.featured)

const coverFor = (slug: string) =>
  siteConfig.sections.articles.covers.find((cover) => cover.slug === slug)

const isFeatured = (index: number) => index === (featuredIndex === -1 ? 0 : featuredIndex)

const imageFor = (article: Article) => article.cover ?? coverFor(article.slug)?.image
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
          <h1 id="articles-title">文章与笔记</h1>
        </div>
        <span>记录技术、设计与生活里的灵光。</span>
      </header>

      <div class="articles-list">
        <RouterLink
          v-for="(article, index) in articles"
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
              <span v-if="isFeatured(index)" class="article-item__featured">
                <IconGlyph name="sparkles" :size="12" /> 推荐
              </span>
              <time :datetime="article.publishedAt">{{ article.displayDate }}</time>
            </span>
            <strong>{{ article.title }}</strong>
            <small>{{ article.description }}</small>
            <span class="article-item__meta">
              <span v-for="tag in article.tags" :key="tag"># {{ tag }}</span>
              <span><IconGlyph name="clock" :size="13" /> {{ article.readingMinutes }} 分钟</span>
            </span>
          </span>

          <span class="article-item__arrow">
            <IconGlyph name="arrow-right" :size="19" />
          </span>
        </RouterLink>
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

.articles-archive__header > span {
  max-width: 16rem;
  color: var(--anime-muted);
  font-size: 0.78rem;
  line-height: 1.65;
  text-align: right;
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

  .articles-archive__header > span {
    display: none;
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
}

@media (prefers-reduced-motion: reduce) {
  .article-item__visual img {
    transition: none;
  }
}
</style>

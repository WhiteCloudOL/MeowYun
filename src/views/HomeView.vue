<script setup lang="ts">
import { computed } from 'vue'
import { siteConfig } from '@/config/site'
import { articles } from '@/content/articles'
import BaseButton from '@/components/ui/BaseButton.vue'
import ImageFallback from '@/components/ui/ImageFallback.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import ConfigIcon from '@/components/ui/ConfigIcon.vue'
import ProjectCard from '@/components/content/ProjectCard.vue'
import ArticleCard from '@/components/content/ArticleCard.vue'
import ContributionCalendar from '@/components/home/ContributionCalendar.vue'
import UpdateNote from '@/components/home/UpdateNote.vue'
import NowNote from '@/components/home/NowNote.vue'
const profile = siteConfig.profile
const sections = siteConfig.sections
const projects = sections.projects.items.filter((x) => x.enabled)
const featured = projects.slice(0, 3)
const latest = computed(() => articles.slice(0, Math.min(3, Math.max(2, sections.articles.limit))))
const socials = profile.socials.filter((x) => x.enabled)
function skillTarget(label: string) {
  const words = label.split(/\s*[/／]\s*/)
  const article = articles.find((a) =>
    a.tags.some((t) => words.some((w) => t.toLowerCase() === w.toLowerCase())),
  )
  if (article) {
    const tag = article.tags.find((t) => words.some((w) => t.toLowerCase() === w.toLowerCase()))
    return '/articles/tags/' + encodeURIComponent(tag!)
  }
  const project = projects.find((p) =>
    p.technologies.some((t) => words.some((w) => t.toLowerCase() === w.toLowerCase())),
  )
  return project ? '/navigation#project-' + project.id : undefined
}
</script>
<template>
  <div class="home-view page-shell">
    <section v-if="profile.enabled" id="welcome" class="welcome" aria-labelledby="welcome-title">
      <div class="welcome__paper">
        <p class="eyebrow"><IconGlyph name="cloud" :size="18" />{{ profile.greeting }}</p>
        <h1 id="welcome-title">{{ profile.name }}<span>的云间手账</span></h1>
        <p class="welcome__tagline">{{ profile.tagline }}</p>
        <p class="welcome__description">{{ profile.description }}</p>
        <div class="welcome__actions">
          <BaseButton v-if="sections.projects.enabled && projects.length" to="#projects"
            >看看作品 <IconGlyph name="arrow-down" :size="17" /></BaseButton
          ><BaseButton v-if="sections.articles.enabled" to="/articles" variant="secondary"
            >翻翻文章 <IconGlyph name="book-open" :size="17"
          /></BaseButton>
        </div>
        <p v-if="profile.quotes[0]" class="welcome__quote">{{ profile.quotes[0] }}</p>
      </div>
      <div class="polaroid-arrival">
        <figure class="polaroid">
          <ImageFallback
            :src="profile.avatar"
            :alt="profile.avatarAlt"
            class="polaroid__image"
            loading="eager"
          />
          <figcaption>
            <strong>{{ profile.name }}</strong
            ><span>{{ profile.handle }}</span
            ><IconGlyph name="heart" :size="22" />
          </figcaption>
        </figure>
      </div>
    </section>
    <nav v-if="sections.quickLinks.enabled" class="home-links" aria-label="快捷入口">
      <a
        v-for="item in sections.quickLinks.items.filter((x) => x.enabled)"
        :key="item.id"
        :href="item.href"
        :target="item.href.startsWith('http') ? '_blank' : undefined"
        rel="noopener noreferrer"
        ><ConfigIcon :name="item.icon" :provider="item.iconProvider" :size="18" />{{ item.title
        }}<IconGlyph name="arrow-up-right" :size="14"
      /></a>
    </nav>
    <section
      v-if="sections.projects.enabled && projects.length"
      id="projects"
      class="home-section"
      aria-labelledby="projects-title"
    >
      <div class="section-heading">
        <div>
          <p class="eyebrow">做成可以使用的东西</p>
          <h2 id="projects-title">作品玩具箱</h2>
        </div>
        <RouterLink class="text-link" to="/navigation#projects"
          >查看全部 {{ projects.length }} 个作品 <IconGlyph name="arrow-right" :size="17"
        /></RouterLink>
      </div>
      <div class="featured-projects">
        <ProjectCard
          v-for="(item, index) in featured"
          :key="item.id"
          :item="item"
          :featured="index === 0"
        />
      </div>
    </section>
    <section
      v-if="sections.articles.enabled"
      id="notes"
      class="home-section home-notes"
      aria-labelledby="notes-title"
    >
      <div class="section-heading">
        <div>
          <p class="eyebrow">把经验写下来</p>
          <h2 id="notes-title">最近翻开的几页</h2>
        </div>
        <RouterLink class="text-link" to="/articles"
          >全部文章 <IconGlyph name="arrow-right" :size="17"
        /></RouterLink>
      </div>
      <div class="home-notes__body">
        <p class="home-notes__margin">
          机器人、服务端与开源工具。<br />把实践中留下的笔记，<br />放在这里慢慢整理。
        </p>
        <div>
          <ArticleCard v-for="article in latest" :key="article.slug" :article="article" compact />
          <p v-if="!latest.length" class="muted">还没有公开文章。</p>
        </div>
      </div>
    </section>
    <section
      v-if="
        sections.about.enabled ||
        sections.skills.enabled ||
        sections.contributions.enabled ||
        siteConfig.nowNote
      "
      id="about"
      class="home-section home-about"
      aria-label="个人小记与档案"
    >
      <div>
        <NowNote /><template v-if="sections.about.enabled"
          ><p class="eyebrow">手账的主人</p>
          <h2>{{ sections.about.title }}</h2>
          <p class="about-description">{{ sections.about.description }}</p>
          <p v-if="profile.location" class="about-location">
            <IconGlyph name="map-pin" :size="16" />{{ profile.location }}
          </p></template
        >
        <div v-if="sections.skills.enabled" class="skill-list">
          <template
            v-for="skill in sections.skills.items.filter((x) => x.enabled)"
            :key="skill.label"
            ><RouterLink
              v-if="skillTarget(skill.label)"
              class="chip"
              :to="skillTarget(skill.label)!"
              >{{ skill.label }}</RouterLink
            ><span v-else class="skill-label">{{ skill.label }}</span></template
          >
        </div>
        <div class="profile-socials">
          <a
            v-for="item in socials"
            :key="item.id"
            class="text-link"
            :href="item.href"
            :target="item.href.startsWith('mailto:') ? undefined : '_blank'"
            rel="noopener noreferrer"
            ><ConfigIcon :name="item.icon" :provider="item.iconProvider" :size="18" />{{
              item.label
            }}</a
          >
        </div>
      </div>
      <ContributionCalendar v-if="sections.contributions.enabled" />
    </section>
    <UpdateNote />
  </div>
</template>
<style scoped>
.home-view {
  padding-top: 2rem;
  padding-bottom: var(--space-12);
}
.welcome {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  align-items: center;
  gap: clamp(2rem, 5vw, 4.5rem);
}
.welcome__paper {
  position: relative;
  background: var(--color-surface);
  padding: clamp(1.5rem, 4vw, 3rem);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-large);
  box-shadow: var(--shadow-brand);
}
.welcome__paper::before {
  content: '';
  position: absolute;
  width: 5rem;
  height: 1.35rem;
  top: -0.6rem;
  left: 2rem;
  background: var(--color-primary-soft);
  transform: rotate(-4deg);
  opacity: 0.9;
}
.welcome .eyebrow {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.welcome h1 {
  font-size: var(--text-display);
  font-weight: 750;
  line-height: 1.2;
}
.welcome h1 span {
  display: block;
  margin-top: 0.65rem;
  font-size: 0.48em;
  font-weight: 500;
  color: var(--color-text-secondary);
}
.welcome__tagline {
  margin-block: 1.5rem 0.6rem;
  font-size: var(--text-lg);
  font-weight: 600;
}
.welcome__description {
  color: var(--color-text-secondary);
}
.welcome__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.75rem;
}
.welcome__quote {
  border-top: 1px solid var(--color-border-soft);
  margin-top: 1.75rem;
  padding-top: 1rem;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}
.polaroid-arrival {
  animation: paper-arrive var(--transition-slow);
  padding: 0.75rem;
}
.polaroid {
  margin: 0;
  padding: 0.85rem 0.85rem 1.25rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.6rem;
  box-shadow: var(--shadow-card);
  transform: rotate(2deg);
  transition:
    transform var(--transition-normal),
    box-shadow var(--transition-normal);
}
.polaroid__image {
  aspect-ratio: 1;
  width: 100%;
  border-radius: 0.3rem;
}
.polaroid figcaption {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 1rem;
}
.polaroid figcaption span {
  color: var(--color-text-muted);
  font: var(--text-xs)/1.5 var(--font-mono);
  margin-left: auto;
}
.polaroid figcaption svg {
  color: var(--color-link);
  margin-left: 0.5rem;
}
.home-links {
  display: flex;
  justify-content: center;
  gap: 1rem 2rem;
  flex-wrap: wrap;
  margin-block: 2.25rem;
}
.home-links a {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: var(--tap-size);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}
.home-links a:hover {
  color: var(--color-link);
}
.home-section {
  margin-top: var(--section-gap);
}
.featured-projects {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
  gap: 1.25rem;
}
.home-notes__body {
  display: grid;
  grid-template-columns: 1fr 2.6fr;
  gap: 3rem;
}
.home-notes__margin {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  padding-top: 1.5rem;
  line-height: 2;
}
.home-about {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 3rem;
  align-items: start;
}
.home-about h2 {
  font-size: var(--text-xl);
}
.about-description {
  margin-block: 1.25rem;
  color: var(--color-text-secondary);
}
.about-location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
.skill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.5rem;
}
.skill-label {
  display: inline-flex;
  align-items: center;
  min-height: var(--tap-size);
  padding: 0.4rem 0.8rem;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}
.profile-socials {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  margin-top: 1.5rem;
}
@media (hover: hover) {
  .polaroid:hover {
    transform: rotate(0deg) translateY(-3px);
    box-shadow: var(--shadow-card-hover);
  }
}
@media (max-width: 1000px) {
  .home-about {
    grid-template-columns: 1fr;
  }
  .featured-projects {
    grid-template-columns: 1fr 1fr;
  }
  .featured-projects > :first-child {
    grid-column: 1 / -1;
  }
}
@media (max-width: 760px) {
  .home-view {
    padding-top: 0.5rem;
  }
  .welcome {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .polaroid-arrival {
    width: min(75%, 20rem);
    margin-inline: auto;
  }
  .welcome h1 {
    font-size: clamp(2.25rem, 8vw, 3rem);
  }
  .home-links {
    justify-content: flex-start;
    gap: 0.5rem 1.25rem;
  }
  .home-notes__body {
    grid-template-columns: 1fr;
    gap: 0;
  }
  .home-notes__margin {
    display: none;
  }
}
@media (max-width: 540px) {
  .featured-projects {
    grid-template-columns: 1fr;
  }
  .home-about {
    gap: 2rem;
  }
  .section-heading {
    align-items: flex-start;
  }
}
</style>

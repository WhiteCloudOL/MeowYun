<script setup lang="ts">
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseTag from '@/components/ui/BaseTag.vue'
import ConfigIcon from '@/components/ui/ConfigIcon.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import { siteConfig } from '@/config/site'
import { articles } from '@/content/articles'
import ContributionCalendar from './ContributionCalendar.vue'

const projectItems = siteConfig.sections.projects.items.filter((item) => item.enabled)
const skillItems = siteConfig.sections.skills.items.filter((item) => item.enabled)
const recentArticles = articles.slice(0, siteConfig.sections.articles.limit)
</script>

<template>
  <div class="home-dashboard">
    <BaseCard
      v-if="siteConfig.sections.about.enabled"
      class="dashboard-panel dashboard-panel--about"
      :hoverable="false"
    >
      <header class="dashboard-heading">
        <span><IconGlyph name="user" :size="19" /></span>
        <p>PROFILE</p>
      </header>
      <h2>{{ siteConfig.sections.about.title }}</h2>
      <p class="dashboard-panel__description">{{ siteConfig.sections.about.description }}</p>
      <ul class="about-facts">
        <li v-for="fact in siteConfig.sections.about.facts" :key="fact.label">
          <IconGlyph :name="fact.icon" :size="16" />
          <span>{{ fact.label }}</span>
          <strong>{{ fact.value }}</strong>
        </li>
      </ul>
    </BaseCard>

    <BaseCard
      v-if="siteConfig.sections.contributions.enabled"
      class="dashboard-panel dashboard-panel--contributions"
      :hoverable="false"
    >
      <ContributionCalendar />
    </BaseCard>

    <BaseCard
      v-if="siteConfig.sections.projects.enabled && projectItems.length"
      id="projects"
      class="dashboard-panel dashboard-panel--projects"
      :hoverable="false"
    >
      <header class="dashboard-title-row">
        <div class="dashboard-heading">
          <span><IconGlyph name="folder" :size="19" /></span>
          <h2>{{ siteConfig.sections.projects.title }}</h2>
        </div>
        <small>{{ projectItems.length }} ITEMS</small>
      </header>

      <div class="project-grid">
        <a
          v-for="project in projectItems"
          :key="project.id"
          class="project-tile"
          :href="project.href"
          target="_blank"
          rel="noopener noreferrer"
          :style="{ '--project-accent': project.accent ?? 'var(--site-accent)' }"
        >
          <span class="project-tile__icon">
            <ConfigIcon :name="project.icon" :provider="project.iconProvider" :size="23" />
          </span>
          <div>
            <h3>{{ project.title }}</h3>
            <p>{{ project.description }}</p>
          </div>
          <div class="project-tile__footer">
            <span>{{ project.technologies.join(' · ') }}</span>
            <IconGlyph name="arrow-up-right" :size="16" />
          </div>
        </a>
      </div>
    </BaseCard>

    <BaseCard
      v-if="siteConfig.sections.skills.enabled && skillItems.length"
      class="dashboard-panel dashboard-panel--skills"
      :hoverable="false"
    >
      <header class="dashboard-title-row">
        <div class="dashboard-heading">
          <span><IconGlyph name="zap" :size="19" /></span>
          <h2>{{ siteConfig.sections.skills.title }}</h2>
        </div>
      </header>

      <div class="skill-grid">
        <div
          v-for="skill in skillItems"
          :key="skill.label"
          class="skill-item"
          :style="{ '--skill-color': skill.color ?? 'var(--site-accent)' }"
          :title="skill.label"
        >
          <ConfigIcon :name="skill.icon" :provider="skill.iconProvider" :size="23" />
          <span>{{ skill.label }}</span>
        </div>
      </div>
    </BaseCard>

    <BaseCard
      v-if="siteConfig.sections.articles.enabled && recentArticles.length"
      class="dashboard-panel dashboard-panel--articles"
      :hoverable="false"
    >
      <header class="dashboard-title-row">
        <div class="dashboard-heading">
          <span><IconGlyph name="article" :size="19" /></span>
          <h2>{{ siteConfig.sections.articles.title }}</h2>
        </div>
        <RouterLink to="/articles">全部 <IconGlyph name="arrow-right" :size="14" /></RouterLink>
      </header>

      <div class="article-list">
        <RouterLink
          v-for="article in recentArticles"
          :key="article.slug"
          :to="`/articles/${article.slug}`"
          class="article-item"
        >
          <div>
            <time :datetime="article.publishedAt">{{ article.displayDate }}</time>
            <h3>{{ article.title }}</h3>
          </div>
          <div class="article-item__tags">
            <BaseTag v-for="tag in article.tags.slice(0, 2)" :key="tag">{{ tag }}</BaseTag>
          </div>
          <IconGlyph name="arrow-up-right" :size="17" />
        </RouterLink>
      </div>
    </BaseCard>
  </div>
</template>

<style scoped>
.home-dashboard {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--space-5);
}

.dashboard-panel {
  min-width: 0;
  color: var(--anime-text);
}

.dashboard-panel--about {
  grid-column: span 4;
}

.dashboard-panel--contributions {
  grid-column: span 8;
}

.dashboard-panel--projects {
  grid-column: span 8;
  scroll-margin-top: 7rem;
}

.dashboard-panel--skills {
  grid-column: span 4;
}

.dashboard-panel--articles {
  grid-column: 1 / -1;
}

.dashboard-heading,
.dashboard-title-row,
.dashboard-title-row > .dashboard-heading {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.dashboard-title-row {
  justify-content: space-between;
  margin-bottom: var(--space-6);
}

.dashboard-heading > span {
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  place-items: center;
  border: 1px solid var(--anime-border);
  border-radius: var(--radius-small);
  background: var(--anime-inner);
  color: var(--site-accent);
}

.dashboard-heading p,
.dashboard-title-row small {
  color: var(--anime-muted);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.08em;
}

.dashboard-title-row h2,
.dashboard-panel--about > h2 {
  font-size: var(--text-xl);
  letter-spacing: -0.035em;
}

.dashboard-panel--about > h2 {
  margin-top: var(--space-8);
}

.dashboard-panel__description {
  margin-top: var(--space-3);
  color: var(--anime-text-soft);
  font-size: var(--text-sm);
  line-height: 1.8;
}

.about-facts {
  display: grid;
  gap: var(--space-3);
  margin-top: var(--space-8);
  list-style: none;
}

.about-facts li {
  display: grid;
  grid-template-columns: auto 3rem 1fr;
  align-items: center;
  gap: var(--space-2);
  color: var(--anime-muted);
  font-size: var(--text-xs);
}

.about-facts strong {
  overflow: hidden;
  color: var(--anime-text-soft);
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-3);
}

.project-tile {
  display: flex;
  min-height: 12.5rem;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
  border: 1px solid var(--anime-border);
  border-radius: var(--radius-medium);
  background: var(--anime-inner);
  transition:
    transform var(--transition-press),
    background-color var(--transition-fast),
    border-color var(--transition-fast);
}

.project-tile__icon {
  display: grid;
  width: 2.8rem;
  height: 2.8rem;
  place-items: center;
  border-radius: var(--radius-small);
  background: color-mix(in srgb, var(--project-accent) 14%, transparent);
  color: var(--project-accent);
}

.project-tile h3 {
  margin-bottom: var(--space-2);
  font-size: var(--text-base);
}

.project-tile p,
.project-tile__footer {
  color: var(--anime-muted);
  font-size: var(--text-xs);
}

.project-tile__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-top: auto;
}

.skill-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-3);
}

.skill-item {
  display: grid;
  min-width: 0;
  aspect-ratio: 1;
  place-items: center;
  align-content: center;
  gap: var(--space-2);
  border: 1px solid var(--anime-border);
  border-radius: var(--radius-small);
  background: var(--anime-inner);
  color: var(--skill-color);
}

.skill-item span {
  overflow: hidden;
  width: 100%;
  color: var(--anime-muted);
  font-size: 0.58rem;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dashboard-title-row > a {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--anime-muted);
  font-size: var(--text-xs);
}

.article-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-top: 1px solid var(--anime-border);
}

.article-item {
  display: grid;
  min-width: 0;
  min-height: 10rem;
  grid-template-columns: 1fr auto;
  align-content: space-between;
  gap: var(--space-4);
  padding: var(--space-5);
  border-right: 1px solid var(--anime-border);
  transition: background-color var(--transition-fast);
}

.article-item:last-child {
  border-right: 0;
}

.article-item time {
  color: var(--anime-muted);
  font-family: var(--font-mono);
  font-size: 0.62rem;
}

.article-item h3 {
  margin-top: var(--space-3);
  font-size: var(--text-base);
  line-height: 1.45;
}

.article-item__tags {
  display: flex;
  flex-wrap: wrap;
  grid-column: 1 / -1;
  gap: var(--space-2);
}

@media (hover: hover) {
  .project-tile:hover {
    border-color: var(--anime-border-bright);
    background: color-mix(in srgb, var(--anime-inner) 82%, var(--site-accent));
    transform: translateY(-0.18rem);
  }

  .article-item:hover {
    background: var(--anime-inner);
  }
}

@media (max-width: 62rem) {
  .dashboard-panel--about,
  .dashboard-panel--skills {
    grid-column: span 5;
  }

  .dashboard-panel--contributions,
  .dashboard-panel--projects {
    grid-column: span 7;
  }

  .project-grid,
  .article-list {
    grid-template-columns: 1fr;
  }

  .article-item {
    border-right: 0;
    border-bottom: 1px solid var(--anime-border);
  }
}

@media (max-width: 48rem) {
  .home-dashboard {
    grid-template-columns: 1fr;
  }

  .dashboard-panel--about,
  .dashboard-panel--contributions,
  .dashboard-panel--projects,
  .dashboard-panel--skills,
  .dashboard-panel--articles {
    grid-column: 1;
  }
}

@media (max-width: 30rem) {
  .skill-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>

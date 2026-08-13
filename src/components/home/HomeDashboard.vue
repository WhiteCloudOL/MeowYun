<script setup lang="ts">
import { ref } from 'vue'
import AnimeCard from '@/components/ui/AnimeCard.vue'
import BaseTag from '@/components/ui/BaseTag.vue'
import ConfigIcon from '@/components/ui/ConfigIcon.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import JellyButton from '@/components/ui/JellyButton.vue'
import { useSpringAnimation } from '@/composables/useSpringAnimation'
import { siteConfig } from '@/config/site'
import { articles } from '@/content/articles'
import ContributionCalendar from './ContributionCalendar.vue'

const projectItems = siteConfig.sections.projects.items.filter((item) => item.enabled)
const skillItems = siteConfig.sections.skills.items.filter((item) => item.enabled)
const recentArticles = articles.slice(0, siteConfig.sections.articles.limit)
const dashboard = ref<HTMLElement>()
const { itemStyle, visible } = useSpringAnimation(dashboard, { staggerMs: 95 })
</script>

<template>
  <div ref="dashboard" class="home-dashboard" :class="{ 'is-visible': visible }">
    <section class="dashboard-story dashboard-story--intro">
      <AnimeCard
        v-if="siteConfig.sections.about.enabled"
        class="dashboard-panel dashboard-panel--about spring-piece"
        :style="itemStyle(0, -1.4)"
        :tilt="-1.4"
        tape="yellow"
        sticker="♡"
      >
        <header class="dashboard-heading">
          <span><IconGlyph name="user" :size="19" /></span>
          <p>PROFILE NOTE</p>
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
      </AnimeCard>

      <AnimeCard
        v-if="siteConfig.sections.contributions.enabled"
        class="dashboard-panel dashboard-panel--contributions spring-piece"
        :style="itemStyle(1, 0.6)"
        :tilt="0.6"
        tape="blue"
        sticker="✦"
      >
        <ContributionCalendar />
      </AnimeCard>
    </section>

    <div class="dashboard-wave" aria-hidden="true">
      <svg viewBox="0 0 1200 80" preserveAspectRatio="none">
        <path d="M0 36C132 8 232 70 365 38S610 7 738 42s226 31 462-7" />
      </svg>
      <span>projects loading... ♪</span>
    </div>

    <section
      v-if="siteConfig.sections.projects.enabled && projectItems.length"
      id="projects"
      class="dashboard-projects spring-piece"
      :style="itemStyle(2)"
    >
      <header class="dashboard-section-heading">
        <div>
          <span class="dashboard-kicker">MY CREATIONS</span>
          <h2>{{ siteConfig.sections.projects.title }}</h2>
        </div>
        <p>横向翻阅我的作品卡片 →</p>
      </header>

      <div class="project-gallery">
        <a
          v-for="(project, index) in projectItems"
          :key="project.id"
          class="project-card"
          :href="project.href"
          target="_blank"
          rel="noopener noreferrer"
          :style="{
            '--project-accent': project.accent ?? 'var(--site-accent)',
            '--project-tilt': `${index % 2 === 0 ? -1.1 : 1.2}deg`,
          }"
        >
          <span class="project-card__number">0{{ index + 1 }}</span>
          <span class="project-card__icon">
            <ConfigIcon :name="project.icon" :provider="project.iconProvider" :size="25" />
          </span>
          <h3>{{ project.title }}</h3>
          <p>{{ project.description }}</p>
          <div class="project-card__footer">
            <span class="project-card__technologies">
              <i v-for="technology in project.technologies" :key="technology">{{ technology }}</i>
            </span>
            <IconGlyph name="arrow-up-right" :size="17" />
          </div>
        </a>
      </div>
    </section>

    <section
      v-if="siteConfig.sections.skills.enabled && skillItems.length"
      class="dashboard-skills spring-piece"
      :style="itemStyle(3)"
    >
      <div class="dashboard-section-heading dashboard-section-heading--skills">
        <div>
          <span class="dashboard-kicker">SKILL MAGNETS</span>
          <h2>{{ siteConfig.sections.skills.title }}</h2>
        </div>
        <p>会发光的工具，和还在升级中的我。</p>
      </div>
      <div class="skill-cloud">
        <div
          v-for="(skill, index) in skillItems"
          :key="skill.label"
          class="skill-magnet"
          :style="{
            '--skill-color': skill.color ?? 'var(--site-accent)',
            '--skill-tilt': `${(index % 5 - 2) * 2.1}deg`,
          }"
          :title="skill.label"
        >
          <ConfigIcon :name="skill.icon" :provider="skill.iconProvider" :size="23" />
          <span>{{ skill.label }}</span>
        </div>
      </div>
    </section>

    <section
      v-if="siteConfig.sections.articles.enabled && recentArticles.length"
      class="dashboard-notes spring-piece"
      :style="itemStyle(4)"
    >
      <div class="notebook-rings" aria-hidden="true">
        <i v-for="index in 9" :key="index"></i>
      </div>
      <header class="dashboard-section-heading">
        <div>
          <span class="dashboard-kicker">RECENT JOURNAL</span>
          <h2>{{ siteConfig.sections.articles.title }}</h2>
        </div>
        <JellyButton to="/articles" tone="yellow" icon="arrow-right">全部手账</JellyButton>
      </header>

      <div class="article-notes">
        <RouterLink
          v-for="(article, index) in recentArticles"
          :key="article.slug"
          :to="`/articles/${article.slug}`"
          class="article-note"
          :class="`article-note--${(index % 3) + 1}`"
        >
          <time :datetime="article.publishedAt">{{ article.displayDate }}</time>
          <h3>{{ article.title }}</h3>
          <div class="article-note__tags">
            <BaseTag v-for="tag in article.tags.slice(0, 2)" :key="tag">{{ tag }}</BaseTag>
          </div>
          <IconGlyph name="arrow-up-right" :size="17" />
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-dashboard { display: grid; min-width: 0; grid-template-columns: minmax(0, 1fr); gap: clamp(4.5rem, 10vw, 8rem); }
.dashboard-story { display: flex; min-width: 0; align-items: center; gap: clamp(1rem, 4vw, 3rem); }
.dashboard-panel { min-width: 0; color: var(--anime-text); }
.dashboard-panel--about { width: min(36%, 23rem); flex: none; }
.dashboard-panel--contributions { width: min(72%, 54rem); margin-left: -2rem; margin-top: 4.5rem; }
.dashboard-heading, .dashboard-section-heading { display: flex; align-items: center; gap: var(--space-3); }
.dashboard-heading > span { display: grid; width: 2.6rem; height: 2.6rem; place-items: center; border: 1px dashed var(--anime-border-bright); border-radius: 50%; background: rgb(255 183 178 / 18%); color: var(--anime-accent-soft); }
.dashboard-heading p, .dashboard-kicker { color: var(--anime-muted); font-family: var(--font-mono); font-size: .65rem; font-weight: 800; letter-spacing: .12em; }
.dashboard-panel h2 { margin-top: var(--space-7); font-size: var(--text-2xl); }
.dashboard-panel__description { margin-top: var(--space-3); color: var(--anime-text-soft); font-size: var(--text-sm); line-height: 1.8; }
.about-facts { display: grid; gap: .7rem; margin-top: var(--space-7); list-style: none; }
.about-facts li { display: grid; grid-template-columns: auto 3rem 1fr; align-items: center; gap: .55rem; padding-bottom: .45rem; border-bottom: 1px dashed var(--paper-edge); color: var(--anime-muted); font-size: var(--text-xs); }
.about-facts strong { overflow: hidden; color: var(--anime-text); text-overflow: ellipsis; white-space: nowrap; }
.dashboard-wave { position: relative; height: 4rem; margin-block: -2rem; color: var(--site-accent); }
.dashboard-wave svg { width: 100%; height: 100%; overflow: visible; }
.dashboard-wave path { fill: none; stroke: currentcolor; stroke-dasharray: 10 12; stroke-linecap: round; stroke-width: 2; opacity: .48; }
.dashboard-wave span { position: absolute; top: 1.2rem; left: 50%; padding: .2rem .65rem; border-radius: var(--radius-round); background: var(--paper-surface); color: var(--anime-muted); font-family: var(--font-mono); font-size: .6rem; transform: rotate(-2deg) translateX(-50%); }
.dashboard-section-heading { justify-content: space-between; margin-bottom: 2rem; }
.dashboard-section-heading h2 { margin-top: .3rem; font-size: clamp(1.7rem, 4vw, 2.8rem); letter-spacing: -.045em; }
.dashboard-section-heading > p { max-width: 20rem; color: var(--anime-muted); font-size: var(--text-xs); text-align: right; }
.dashboard-projects { scroll-margin-top: 7rem; }
.project-gallery { display: flex; gap: 1.2rem; margin-inline: calc(var(--page-padding) * -.25); padding: 1.5rem calc(var(--page-padding) * .25) 2.4rem; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-color: color-mix(in srgb, var(--site-accent) 36%, transparent) transparent; }
.project-card { position: relative; display: flex; min-width: clamp(17rem, 31vw, 23rem); min-height: 20rem; flex-direction: column; gap: var(--space-4); padding: 1.5rem; overflow: hidden; border: 2px solid rgb(255 255 255 / 58%); border-radius: 2rem 1rem 2.4rem 1.2rem; background: radial-gradient(circle at 86% 10%, rgb(255 255 255 / 58%), transparent 26%), color-mix(in srgb, var(--project-accent) 13%, var(--paper-surface)); box-shadow: .55rem .65rem 0 color-mix(in srgb, var(--project-accent) 22%, transparent), var(--shadow-card); scroll-snap-align: start; transform: rotate(var(--project-tilt)); transition: transform 520ms var(--ease-spring-bold), box-shadow 420ms var(--ease-spring); }
.project-card::after { position: absolute; right: -2rem; bottom: -2.5rem; width: 8rem; height: 8rem; border: 1px dashed color-mix(in srgb, var(--project-accent) 45%, transparent); border-radius: 50%; content: ''; }
.project-card__number { position: absolute; top: 1rem; right: 1.2rem; color: color-mix(in srgb, var(--project-accent) 54%, var(--anime-muted)); font-family: var(--font-mono); font-size: 1.4rem; font-weight: 800; }
.project-card__icon { display: grid; width: 3.6rem; height: 3.6rem; place-items: center; border: 2px dashed color-mix(in srgb, var(--project-accent) 44%, transparent); border-radius: 50% 44% 55% 42%; background: color-mix(in srgb, var(--project-accent) 18%, var(--paper-surface)); color: color-mix(in srgb, var(--project-accent) 62%, var(--anime-text)); }
.project-card h3 { margin-top: 1.1rem; font-size: var(--text-xl); }
.project-card p { color: var(--anime-text-soft); font-size: var(--text-sm); line-height: 1.75; }
.project-card__footer { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: auto; padding-top: 1rem; border-top: 1px dashed var(--paper-edge); color: var(--anime-muted); font-size: var(--text-xs); }
.project-card__technologies { display: flex; flex-wrap: wrap; gap: 0.35rem; }
.project-card__technologies i { padding: 0.18rem 0.42rem; border-radius: var(--radius-round); background: color-mix(in srgb, var(--project-accent) 12%, transparent); font-style: normal; transition: transform 420ms var(--ease-spring-bold); }
.dashboard-skills { display: grid; grid-template-columns: minmax(14rem, .65fr) minmax(0, 1.35fr); align-items: center; gap: clamp(1rem, 6vw, 5rem); }
.dashboard-section-heading--skills { display: block; margin: 0; }
.dashboard-section-heading--skills > p { margin-top: 1rem; text-align: left; line-height: 1.7; }
.skill-cloud { display: flex; flex-wrap: wrap; justify-content: center; gap: .85rem; padding: 2rem; border: 2px dashed rgb(255 255 255 / 28%); border-radius: 47% 53% 40% 60% / 56% 43% 57% 44%; background: rgb(var(--anime-glass-rgb) / 22%); }
.skill-magnet { display: grid; min-width: 6.2rem; min-height: 5.4rem; place-items: center; align-content: center; gap: .5rem; padding: .7rem; border: 2px solid rgb(255 255 255 / 62%); border-radius: 1.4rem .8rem 1.2rem .9rem; background: color-mix(in srgb, var(--skill-color) 17%, var(--paper-surface)); box-shadow: .25rem .32rem 0 color-mix(in srgb, var(--skill-color) 28%, transparent); color: color-mix(in srgb, var(--skill-color) 55%, var(--anime-text)); transform: rotate(var(--skill-tilt)); transition: transform 460ms var(--ease-spring-bold); }
.skill-magnet span { color: var(--anime-text-soft); font-size: .67rem; font-weight: 750; }
.dashboard-notes { position: relative; padding: clamp(2rem, 5vw, 3.5rem); border: 1px solid var(--paper-edge); border-radius: 1.1rem 2.5rem 1.4rem 2rem; background: repeating-linear-gradient(180deg, transparent 0, transparent 2.25rem, var(--paper-line) 2.25rem, var(--paper-line) calc(2.25rem + 1px)), var(--paper-surface-alt); box-shadow: .7rem .9rem 0 rgb(124 185 232 / 13%), var(--shadow-card); }
.notebook-rings { position: absolute; top: -1rem; right: 3rem; left: 3rem; display: flex; justify-content: space-around; }
.notebook-rings i { width: .7rem; height: 2.1rem; border: 2px solid color-mix(in srgb, var(--anime-muted) 70%, transparent); border-radius: var(--radius-round); background: var(--paper-surface); }
.article-notes { display: flex; align-items: stretch; gap: 1rem; }
.article-note { position: relative; display: grid; min-width: 0; min-height: 12rem; flex: 1; align-content: space-between; gap: .8rem; padding: 1.35rem; border: 1px solid rgb(255 255 255 / 60%); border-radius: .6rem 1rem .7rem .9rem; box-shadow: .28rem .34rem 0 rgb(74 49 71 / 10%); transition: transform 460ms var(--ease-spring-bold); }
.article-note--1 { background: color-mix(in srgb, #fdfd96 25%, var(--paper-surface)); transform: rotate(-1deg); }
.article-note--2 { background: color-mix(in srgb, #ffb7b2 18%, var(--paper-surface)); transform: translateY(1.1rem) rotate(.7deg); }
.article-note--3 { background: color-mix(in srgb, #b4f8c8 18%, var(--paper-surface)); transform: rotate(-.5deg); }
.article-note time { color: var(--anime-muted); font-family: var(--font-mono); font-size: .63rem; }
.article-note h3 { font-size: var(--text-base); line-height: 1.45; }
.article-note__tags { display: flex; flex-wrap: wrap; gap: .35rem; }
.article-note > :deep(svg) { position: absolute; right: 1rem; bottom: 1rem; }
.spring-piece { opacity: 0; transform: translateY(2.5rem) rotate(var(--spring-tilt)) scale(.9); }
.home-dashboard.is-visible .spring-piece { animation: spring-reveal 760ms var(--ease-spring-bold) var(--spring-delay) both; }
@keyframes spring-reveal { to { opacity: 1; transform: translateY(0) rotate(var(--spring-tilt)) scale(1); } }
@media (hover: hover) { .project-card:hover { box-shadow: .8rem 1rem 0 color-mix(in srgb, var(--project-accent) 26%, transparent), var(--shadow-card-hover); transform: translateY(-.55rem) rotate(calc(var(--project-tilt) * -.35)) perspective(60rem) rotateX(2deg); } .project-card:hover .project-card__technologies i { animation: technology-hop 520ms var(--ease-spring-bold) both; } .project-card:hover .project-card__technologies i:nth-child(2) { animation-delay: 55ms; } .project-card:hover .project-card__technologies i:nth-child(3) { animation-delay: 110ms; } .project-card:hover .project-card__technologies i:nth-child(4) { animation-delay: 165ms; } .skill-magnet:hover { transform: translateY(-.45rem) rotate(-4deg) scale(1.08); } .article-note:hover { transform: translateY(-.4rem) rotate(-1.5deg) scale(1.02); } }
@keyframes technology-hop { 45% { transform: translateY(-0.35rem) rotate(-3deg); } 75% { transform: translateY(0.08rem) rotate(1deg); } }
@media (max-width: 52rem) { .dashboard-story { align-items: stretch; flex-direction: column; } .dashboard-panel--about, .dashboard-panel--contributions { width: 100%; margin: 0; } .dashboard-panel--about { max-width: 30rem; align-self: flex-start; } .dashboard-panel--contributions { align-self: flex-end; } .dashboard-skills { grid-template-columns: 1fr; } .dashboard-section-heading--skills { text-align: center; } .dashboard-section-heading--skills > p { margin-inline: auto; text-align: center; } .article-notes { flex-wrap: wrap; } .article-note { flex-basis: calc(50% - .5rem); } }
@media (max-width: 36rem) { .dashboard-section-heading { align-items: flex-start; flex-direction: column; } .dashboard-section-heading > p { text-align: left; } .project-card { min-width: 82vw; } .skill-cloud { padding: 1.2rem .7rem; } .skill-magnet { min-width: calc(33.333% - .7rem); } .article-note { flex-basis: 100%; } .article-note--2 { transform: rotate(.7deg); } }
@media (prefers-reduced-motion: reduce) { .home-dashboard .spring-piece { opacity: 1; transform: none; animation: none; } .project-card, .skill-magnet, .article-note { transition: none; } }
</style>

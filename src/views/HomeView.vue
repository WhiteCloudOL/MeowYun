<script setup lang="ts">
import { vEntrance } from '@/utils/entrance'
import { siteConfig } from '@/config/site'
import { articles } from '@/content/articles'
import SoftIllustration from '@/components/ui/SoftIllustration.vue'
import CloudAvatar from '@/components/ui/CloudAvatar.vue'
import CloudBanner from '@/components/ui/CloudBanner.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ProjectCard from '@/components/content/ProjectCard.vue'
import ArticleCard from '@/components/content/ArticleCard.vue'
import SaveButton from '@/components/content/SaveButton.vue'
import DiscoveryMachine from '@/components/content/DiscoveryMachine.vue'
import ContributionCalendar from '@/components/home/ContributionCalendar.vue'
import UpdateNote from '@/components/home/UpdateNote.vue'
import NowNote from '@/components/home/NowNote.vue'
import CloudGuide from '@/components/scene/CloudGuide.vue'
import { useAppearance } from '@/composables/useAppearance'
const { guide } = useAppearance()
const { profile, sections } = siteConfig
const projects = sections.projects.items.filter((p) => p.enabled).slice(0, 3)
</script>
<template>
  <div class="home-view page-shell">
    <section id="welcome" v-entrance class="home-welcome" aria-labelledby="welcome-title">
      <div class="welcome-heading">
        <p class="welcome-greeting">
          <span class="greeting-cloud" aria-hidden="true"
            ><IconGlyph name="cloud" :size="19" /></span
          >你好，我是
        </p>
        <h1 id="welcome-title">{{ profile.name }}<span aria-hidden="true">。</span></h1>
        <p class="welcome-identity">{{ profile.tagline }}</p>
      </div>
      <div class="welcome-portrait">
        <svg class="portrait-cloudscape" viewBox="0 0 420 400" aria-hidden="true">
          <path
            d="M33 263C-6 228 14 168 52 165C13 100 84 48 126 79C163 7 263 40 263 92C328 56 389 114 359 167C421 194 403 267 361 273C371 331 293 365 255 329C199 386 113 355 105 317C54 341 16 301 33 263Z"
            fill="rgb(var(--tone-blue) / .38)"
            stroke="var(--color-rim)"
            stroke-width="3"
          />
          <path
            d="M35 105C94 12 288 8 372 134M64 324C154 398 323 373 374 281"
            fill="none"
            stroke="rgb(var(--tone-lilac) / .75)"
            stroke-width="2"
            stroke-dasharray="3 9"
            stroke-linecap="round"
          />
        </svg>
        <CloudAvatar :src="profile.avatar" :alt="profile.avatarAlt" />
        <span class="portrait-code" aria-hidden="true">&lt; / &gt;</span>
        <span class="portrait-star" aria-hidden="true">✦</span>
        <RouterLink class="portrait-note" to="/lab"
          ><IconGlyph name="sparkles" :size="17" />带一点灵感走
          <IconGlyph name="arrow-right" :size="15"
        /></RouterLink>
      </div>
      <div class="welcome-detail">
        <p class="welcome-description">写点代码，也收集一些有趣的灵感。</p>
        <div class="welcome-actions">
          <BaseButton to="/projects"
            >看看作品 <IconGlyph name="arrow-right" :size="16"
          /></BaseButton>
          <BaseButton to="/articles" variant="secondary">翻翻文章</BaseButton>
        </div>
        <CloudGuide v-if="guide" />
      </div>
    </section>
    <section v-if="sections.projects.enabled" id="projects" class="home-section">
      <header class="section-heading">
        <div>
          <p class="section-kicker">代码与创作</p>
          <h2>做过的一些小东西</h2>
        </div>
        <RouterLink to="/projects" class="text-link">全部作品 →</RouterLink>
      </header>
      <div v-entrance class="home-project-grid">
        <div v-for="(project, index) in projects" :key="project.id" class="home-project">
          <ProjectCard
            :item="project"
            :featured="index === 0"
            :tone="(['rose', 'blue', 'mint'] as const)[index]"
          />
          <SaveButton :id="'project-' + project.id" class="project-save" compact />
        </div>
      </div>
    </section>
    <section v-if="sections.articles.enabled" id="notes" class="home-section">
      <header class="section-heading">
        <div>
          <p class="section-kicker">边做边记</p>
          <h2>最近的文章</h2>
        </div>
        <RouterLink to="/articles" class="text-link">全部文章 →</RouterLink>
      </header>
      <div v-entrance class="home-article-list">
        <ArticleCard
          v-for="article in articles.slice(0, 3)"
          :key="article.slug"
          :article="article"
          layout="list"
        />
      </div>
    </section>
    <CloudBanner class="home-workshop home-section" aria-labelledby="workshop-title">
      <div>
        <p class="section-kicker">留一点灵感给自己</p>
        <h2 id="workshop-title">寄给今天的一张明信片</h2>
        <p>写句话，选张贴纸，把喜欢的颜色和收集的印章一起带走。</p>
        <RouterLink to="/lab/postcard" class="text-link">打开明信片工坊 →</RouterLink>
      </div>
      <template #note
        ><div class="postcard-sample" aria-hidden="true">
          <SoftIllustration kind="mail" tone="rose" class="postcard-illustration" />
          <p>留一点好奇心，<br />给平凡的每一天。</p>
          <span>一张小小的问候</span>
        </div></template
      ></CloudBanner
    >
    <DiscoveryMachine />
    <section v-if="sections.about.enabled" id="about" class="home-about home-section">
      <div>
        <p class="section-kicker">再认识我一点</p>
        <h2>{{ sections.about.title }}</h2>
        <p class="about-description">{{ sections.about.description }}</p>
        <div v-if="sections.skills.enabled" class="skill-list">
          <span
            v-for="skill in sections.skills.items.filter((s) => s.enabled)"
            :key="skill.label"
            class="chip"
            >{{ skill.label }}</span
          >
        </div>
        <RouterLink to="/about" class="text-link">更多关于我 →</RouterLink><NowNote />
      </div>
      <ContributionCalendar v-if="sections.contributions.enabled" />
    </section>
    <UpdateNote />
  </div>
</template>
<style scoped>
.home-view {
  padding-bottom: 4rem;
}
.home-welcome {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  grid-template-rows: auto auto;
  column-gap: clamp(3rem, 9vw, 8rem);
  align-content: center;
  align-items: center;
  padding: 3.5rem 3rem 5rem;
}
.welcome-heading {
  align-self: end;
  animation: paper-arrive 420ms var(--ease-spring);
}
.welcome-greeting {
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
}
.welcome-heading h1 {
  font-size: clamp(2.75rem, 4vw, 3.5rem);
  font-weight: 650;
  line-height: 1.25;
  letter-spacing: 0;
}
.welcome-heading h1 span {
  color: var(--color-link);
}
.welcome-identity {
  margin-top: 1rem;
  font-size: var(--text-base);
  color: var(--color-text-secondary);
}
.welcome-detail {
  align-self: start;
  animation: paper-arrive 460ms var(--ease-spring);
}
.welcome-description {
  margin-top: 0.65rem;
  color: var(--color-text-secondary);
  font-size: var(--text-base);
}
.welcome-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.7rem;
}
.welcome-actions :deep(.base-button) {
  min-height: 46px;
}
.welcome-portrait {
  grid-column: 2;
  grid-row: 1/3;
  animation: paper-arrive 480ms var(--ease-spring);
}

.home-section {
  margin-bottom: 4.5rem;
}
.section-heading {
  margin-bottom: 1.5rem;
}
.section-kicker {
  color: var(--color-link);
  font-size: var(--text-xs);
  letter-spacing: 0.04em;
  margin-bottom: 0.4rem;
}
.home-project-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
}
.home-project {
  position: relative;
  min-width: 0;
  display: flex;
}
.home-project :deep(.project-card) {
  width: 100%;
}
.project-save {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
}
.home-article-list {
  display: grid;
  gap: 1.2rem;
}

.home-workshop h2,
.home-about h2 {
  font-size: var(--text-xl);
}
.home-workshop p:not(.section-kicker) {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-top: 0.65rem;
  max-width: 32rem;
}
.home-workshop .text-link {
  margin-top: 0.8rem;
}

.postcard-sample svg {
  color: var(--color-link);
  stroke-width: 1.2;
}
.postcard-sample span {
  display: block;
  margin-top: 1.5rem;
  padding-top: 0.6rem;
  border-top: 1px solid var(--color-border);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
.home-about {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: 3rem;
  margin-top: 4.5rem;
}
.about-description {
  margin: 1rem 0;
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}
.skill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.skill-list .chip {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  font-size: var(--text-sm);
}
@media (max-width: 1000px) {
  .home-welcome {
    grid-template-columns: minmax(0, 1fr) 260px;
    column-gap: 2.5rem;
    padding-inline: 0;
  }
  .home-project-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .home-project:last-child {
    grid-column: 1/-1;
  }
  .home-about {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 600px) {
  .home-welcome {
    grid-template-columns: minmax(0, 1fr) 128px;
    column-gap: 1rem;
    row-gap: 1.4rem;
    padding: 1.4rem 0 3.25rem;
  }
  .welcome-heading {
    align-self: center;
  }
  .welcome-heading h1 {
    font-size: clamp(1.875rem, 8vw, 2.125rem);
  }
  .welcome-heading h1 span {
    display: none;
  }
  .welcome-greeting {
    font-size: var(--text-sm);
    margin-bottom: 0.35rem;
  }
  .welcome-identity {
    margin-top: 0.6rem;
    font-size: var(--text-xs);
  }
  .welcome-portrait {
    grid-row: 1;
    grid-column: 2;
  }
  .welcome-detail {
    grid-column: 1/-1;
  }
  .welcome-description {
    margin: 0;
    font-size: var(--text-sm);
  }
  .welcome-actions {
    margin-top: 1.1rem;
  }
  .home-section {
    margin-bottom: 3.25rem;
  }
  .section-heading {
    gap: 0.5rem;
    align-items: center;
  }
  .section-heading h2 {
    font-size: var(--text-lg);
  }
  .section-heading .text-link {
    font-size: var(--text-sm);
  }
  .home-project-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .home-project:last-child {
    grid-column: auto;
  }
  .postcard-sample {
    max-width: 260px;
    width: 100%;
    justify-self: center;
  }
  .home-about {
    gap: 1.5rem;
    margin-top: 3.25rem;
  }
}

.portrait-cloudscape {
  position: absolute;
  inset: -17% -20%;
  width: 140%;
  height: 140%;
  max-width: none;
  z-index: -1;
}
.welcome-portrait {
  position: relative;
  isolation: isolate;
}
@media (min-width: 601px) and (max-width: 1000px) {
  .welcome-portrait {
    width: 220px;
    justify-self: start;
  }
  .portrait-cloudscape {
    inset: -12%;
    width: 124%;
    height: 124%;
  }
}
.portrait-code {
  position: absolute;
  left: -15%;
  top: 5%;
  display: grid;
  place-items: center;
  width: 68px;
  height: 55px;
  font: 600 20px var(--font-mono);
  color: var(--color-link);
  background: var(--color-surface-glass);
  border: 1px solid var(--color-rim);
  border-radius: 22px 20px 25px 17px;
  transform: rotate(-12deg);
  box-shadow: var(--shadow-card);
}
.portrait-star {
  position: absolute;
  right: -8%;
  top: 2%;
  color: rgb(var(--tone-rose));
  font-size: 64px;
  line-height: 1;
  transform: rotate(12deg);
  text-shadow: 0 2px var(--color-rim);
}
.portrait-note {
  position: absolute;
  right: -8%;
  bottom: -6%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
  padding: 0.6rem 0.95rem;
  border: 1px solid var(--color-rim);
  border-radius: 22px 25px 20px 24px;
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
  color: var(--color-link);
  font-size: var(--text-sm);
  transform: none;
  transition: background 160ms ease;
}
.portrait-note:hover,
.portrait-note:focus-visible {
  background: var(--color-primary-soft);
}
.welcome-greeting {
  display: flex;
  gap: 0.55rem;
  align-items: center;
}
.greeting-cloud {
  display: grid;
  place-items: center;
  width: 36px;
  height: 30px;
  background: rgb(var(--tone-blue) / 0.35);
  border: 1px solid var(--color-rim);
  border-radius: 45% 50% 40% 43%;
  color: var(--color-link);
}
.postcard-illustration {
  width: 120px;
  margin: -0.7rem auto -0.5rem;
}
@media (max-width: 600px) {
  .portrait-code {
    width: 36px;
    height: 30px;
    font-size: 12px;
    left: -10%;
    top: 0;
  }
  .portrait-star {
    font-size: 32px;
    right: -7%;
  }
  .portrait-note {
    font-size: 11px;
    gap: 4px;
    padding: 5px 9px;
    bottom: -28%;
    right: -10%;
    white-space: nowrap;
  }
  .portrait-note .icon-glyph {
    width: 13px;
  }
  .portrait-cloudscape {
    inset: -12% -12%;
    width: 124%;
    height: 124%;
  }
}
</style>

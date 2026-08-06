<script setup lang="ts">
import { computed } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import ConfigIcon from '@/components/ui/ConfigIcon.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import { siteConfig } from '@/config/site'

const siteLinks = computed(() =>
  siteConfig.sections.navigation.items.filter((item) => item.enabled),
)

const projects = computed(() => siteConfig.sections.projects.items.filter((item) => item.enabled))

const isInternal = (href: string) => href.startsWith('/')
</script>

<template>
  <main class="navigation-view page-shell">
    <header class="navigation-view__hero">
      <span class="navigation-view__eyebrow">
        <IconGlyph name="compass" :size="15" />
        EXPLORE
      </span>
      <h1>导航站</h1>
      <p>收藏散落在站点里的入口、作品与常用去处，愿你总能找到下一颗星星。</p>
    </header>

    <section
      v-if="siteConfig.sections.navigation.enabled && siteLinks.length"
      class="navigation-view__section"
      aria-labelledby="site-links-title"
    >
      <div class="navigation-view__heading">
        <div>
          <span>MY SITES & PICKS</span>
          <h2 id="site-links-title">{{ siteConfig.sections.navigation.title }}</h2>
        </div>
        <IconGlyph name="sparkles" :size="20" />
      </div>

      <div class="navigation-view__grid">
        <BaseCard v-for="item in siteLinks" :key="item.id" class="navigation-card" hoverable>
          <RouterLink v-if="isInternal(item.href)" class="navigation-card__link" :to="item.href">
            <span class="navigation-card__icon" :style="{ '--card-accent': item.accent }">
              <ConfigIcon :name="item.icon" :provider="item.iconProvider" :size="23" />
            </span>
            <span class="navigation-card__copy">
              <strong>{{ item.title }}</strong>
              <small>{{ item.description }}</small>
            </span>
            <IconGlyph name="arrow-right" :size="17" />
          </RouterLink>

          <a
            v-else
            class="navigation-card__link"
            :href="item.href"
            target="_blank"
            rel="noreferrer"
          >
            <span class="navigation-card__icon" :style="{ '--card-accent': item.accent }">
              <ConfigIcon :name="item.icon" :provider="item.iconProvider" :size="23" />
            </span>
            <span class="navigation-card__copy">
              <strong>{{ item.title }}</strong>
              <small>{{ item.description }}</small>
            </span>
            <IconGlyph name="arrow-up-right" :size="17" />
          </a>
        </BaseCard>
      </div>
    </section>

    <section v-if="projects.length" class="navigation-view__section" aria-labelledby="project-title">
      <div class="navigation-view__heading">
        <div>
          <span>CREATIONS</span>
          <h2 id="project-title">{{ siteConfig.sections.projects.title }}</h2>
        </div>
        <IconGlyph name="layers" :size="20" />
      </div>

      <div class="navigation-view__grid navigation-view__grid--projects">
        <BaseCard v-for="project in projects" :key="project.id" class="navigation-card" hoverable>
          <a
            class="navigation-card__link"
            :href="project.href"
            target="_blank"
            rel="noreferrer"
          >
            <span class="navigation-card__icon" :style="{ '--card-accent': project.accent }">
              <ConfigIcon :name="project.icon" :provider="project.iconProvider" :size="23" />
            </span>
            <span class="navigation-card__copy">
              <strong>{{ project.title }}</strong>
              <small>{{ project.description }}</small>
            </span>
            <IconGlyph name="arrow-up-right" :size="17" />
          </a>
        </BaseCard>
      </div>
    </section>
  </main>
</template>

<style scoped>
.navigation-view {
  display: grid;
  gap: clamp(3rem, 7vw, 5rem);
  padding-block: clamp(5rem, 11vw, 8rem) 7rem;
}

.navigation-view__hero {
  max-width: 48rem;
  margin-inline: auto;
  text-align: center;
}

.navigation-view__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 1.1rem;
  color: var(--anime-accent-soft);
  font-size: 0.73rem;
  font-weight: 800;
  letter-spacing: 0.18em;
}

.navigation-view__hero h1 {
  margin: 0;
  font-size: clamp(2.8rem, 8vw, 5.5rem);
  line-height: 0.95;
  letter-spacing: -0.07em;
  text-shadow: 0 0.35rem 2rem rgb(5 8 25 / 32%);
}

.navigation-view__hero p {
  max-width: 38rem;
  margin: 1.5rem auto 0;
  color: var(--anime-muted);
  font-size: clamp(0.95rem, 2vw, 1.08rem);
  line-height: 1.85;
}

.navigation-view__section {
  display: grid;
  gap: 1.35rem;
}

.navigation-view__heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  padding-inline: 0.25rem;
  color: var(--anime-accent-soft);
}

.navigation-view__heading span {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.navigation-view__heading h2 {
  margin: 0.3rem 0 0;
  color: var(--anime-text);
  font-size: clamp(1.35rem, 3vw, 2rem);
  letter-spacing: -0.04em;
}

.navigation-view__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.navigation-view__grid--projects {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.navigation-card {
  padding: 0;
  overflow: hidden;
}

.navigation-card__link {
  display: grid;
  min-height: 7.75rem;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem;
  color: var(--anime-text);
}

.navigation-card__icon {
  display: grid;
  width: 3.2rem;
  height: 3.2rem;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--card-accent, var(--site-accent)), transparent 68%);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--card-accent, var(--site-accent)), transparent 85%);
  color: var(--card-accent, var(--site-accent));
  box-shadow: inset 0 1px rgb(255 255 255 / 12%);
}

.navigation-card__copy {
  display: grid;
  min-width: 0;
  gap: 0.35rem;
}

.navigation-card__copy strong {
  font-size: 1rem;
}

.navigation-card__copy small {
  overflow: hidden;
  color: var(--anime-muted);
  font-size: 0.8rem;
  line-height: 1.55;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 52rem) {
  .navigation-view__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 36rem) {
  .navigation-view {
    gap: 3rem;
    padding-top: 4rem;
  }

  .navigation-view__grid,
  .navigation-view__grid--projects {
    grid-template-columns: 1fr;
  }

  .navigation-card__link {
    min-height: 6.75rem;
  }
}
</style>

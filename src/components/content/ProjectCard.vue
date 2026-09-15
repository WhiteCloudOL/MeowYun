<script setup lang="ts">
import type { ProjectItem } from '@/config/schema'
import SoftIllustration from '@/components/ui/SoftIllustration.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
defineProps<{
  item: ProjectItem
  featured?: boolean
  tone?: 'rose' | 'blue' | 'mint' | 'lilac'
  staticCover?: boolean
}>()
</script>
<template>
  <article
    :id="'project-' + item.id"
    class="project-card"
    :data-tone="tone ?? (featured ? 'rose' : 'blue')"
    :class="{ 'is-static': staticCover }"
  >
    <span class="project-card__decoration" aria-hidden="true"
      ><span class="project-card__underlay"></span
    ></span>
    <span class="project-card__skin" aria-hidden="true"></span>
    <div class="project-card__content">
      <div class="project-card__art" :data-transition-key="'project-' + item.id">
        <SoftIllustration :kind="item.icon" :tone="tone ?? (featured ? 'rose' : 'blue')" />
      </div>
      <span class="project-card__tech">{{ item.technologies.slice(0, 2).join(' / ') }}</span>
      <h3>
        <span v-if="staticCover">{{ item.title }}</span
        ><RouterLink v-else :to="'/projects/' + item.id">{{ item.title }}</RouterLink>
      </h3>
      <p>{{ item.description }}</p>
      <RouterLink v-if="!staticCover" class="project-card__open" :to="'/projects/' + item.id"
        >了解作品 <IconGlyph name="arrow-right" :size="16"
      /></RouterLink>
    </div>
  </article>
</template>
<style scoped>
.project-card {
  --card-tone: var(--tone-rose);
  transform: none;
  rotate: none;
  --card-tilt: -4deg;
  position: relative;
  isolation: isolate;
  min-width: 0;
  display: flex;
}
.project-card[data-tone='blue'] {
  --card-tone: var(--tone-blue);
  --card-tilt: 4deg;
}
.project-card[data-tone='mint'] {
  --card-tone: var(--tone-mint);
  --card-tilt: -3deg;
}
.project-card[data-tone='lilac'] {
  --card-tone: var(--tone-lilac);
  --card-tilt: 3deg;
}
.project-card__decoration {
  position: absolute;
  inset: -14px;
  overflow: hidden;
  pointer-events: none;
  z-index: -1;
}
.project-card__underlay {
  position: absolute;
  inset: 16px 10px 11px;
  z-index: -1;
  border-radius: 44px 29px 46px 31px / 36px 43px 29px 40px;
  background: linear-gradient(135deg, rgb(var(--card-tone) / 0.65), rgb(var(--card-tone) / 0.97));
  transform: rotate(var(--card-tilt));
  box-shadow: 0 14px 32px -15px rgb(var(--card-tone) / 0.75);
  transition: transform 430ms var(--ease-spring-bold);
  pointer-events: none;
}
.project-card__skin {
  position: absolute;
  inset: 0;
  z-index: 0;
  border: 1px solid var(--color-rim);
  border-radius: var(--radius-jelly);
  background:
    linear-gradient(145deg, var(--color-surface-glass), var(--color-surface-glass)),
    rgb(var(--card-tone) / 0.3);
  box-shadow:
    inset 0 2px 2px var(--color-rim),
    0 10px 28px -17px rgb(var(--card-tone) / 0.7);
  pointer-events: none;
}
.project-card__content {
  position: relative;
  transform: none;
  rotate: none;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-height: 310px;
  width: 100%;
  padding: 1.5rem;
}
.project-card__art {
  width: 140px;
  align-self: flex-end;
  margin: -0.75rem -0.4rem -2rem 0;
}
.project-card__tech {
  max-width: 65%;
}
.project-card__tech {
  font: var(--text-xs)/1.5 var(--font-mono);
  color: var(--color-text-secondary);
}
.project-card h3 {
  font-size: var(--text-lg);
  font-weight: 650;
  margin: 0.7rem 0;
}
.project-card h3 a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  border-radius: var(--radius-small);
}
.project-card p {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
}
.project-card__open {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
  margin-top: auto;
  padding-right: 3rem;
  font-size: var(--text-sm);
  color: var(--color-link);
}
.project-card:focus-within .project-card__underlay {
  transform: rotate(var(--card-tilt));
}
@media (hover: hover) {
  .project-card:not(.is-static):hover .project-card__underlay {
    transform: rotate(var(--card-tilt)) translateY(-2px);
  }

  .project-card:not(.is-static):hover .project-card__skin {
    animation: soft-card-release 430ms var(--ease-spring);
  }
}
@media (max-width: 600px) {
  .project-card__content {
    min-height: 0;
    padding: 1.25rem;
  }
}
</style>

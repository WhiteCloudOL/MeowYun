<script setup lang="ts">
import ConfigIcon from '@/components/ui/ConfigIcon.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import type { ProjectItem } from '@/config/schema'
defineProps<{ item: ProjectItem; featured?: boolean }>()
</script>
<template>
  <a
    :id="'project-' + item.id"
    class="project-card"
    :class="{ 'project-card--featured': featured }"
    :href="item.href"
    target="_blank"
    rel="noopener noreferrer"
  >
    <div class="project-card__label">
      <span class="project-card__icon"
        ><ConfigIcon :name="item.icon" :provider="item.iconProvider" :size="26"
      /></span>
      <h3>{{ item.title }}</h3>
      <IconGlyph name="arrow-up-right" class="project-card__arrow" />
    </div>
    <div class="project-card__content">
      <p>{{ item.description }}</p>
      <p v-if="item.audience" class="project-card__audience">适合：{{ item.audience }}</p>
      <div class="project-card__tags">
        <span v-for="tag in item.technologies" :key="tag">{{ tag }}</span>
      </div>
      <div v-if="item.status || item.updatedAt || item.note" class="project-card__maintenance">
        <span v-if="item.status">{{ item.status }}</span
        ><time v-if="item.updatedAt" :datetime="item.updatedAt">{{ item.updatedAt }}</time>
        <p v-if="item.note">{{ item.note }}</p>
      </div>
    </div>
    <div class="project-card__base" aria-hidden="true"><i></i><span></span><i></i></div>
  </a>
</template>
<style scoped>
.project-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 1.35rem 1.5rem 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-large) var(--radius-large) var(--radius-medium) var(--radius-medium);
  background: var(--color-surface);
  transition:
    transform var(--transition-normal),
    box-shadow var(--transition-normal);
}
.project-card--featured {
  background: var(--color-secondary-soft);
  border-width: 2px;
}
.project-card__label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  gap: 0.75rem;
}
.project-card__icon {
  display: grid;
  place-items: center;
  width: 3.25rem;
  height: 3.25rem;
  flex-shrink: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-medium);
  background: var(--color-surface);
  color: var(--color-link);
}
.project-card h3 {
  font-size: var(--text-lg);
  min-width: 0;
  flex: 1;
  overflow-wrap: anywhere;
}
.project-card--featured h3 {
  font-size: var(--text-xl);
}
.project-card p {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}
.project-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
  font: var(--text-xs)/1.5 var(--font-mono);
  color: var(--color-text-secondary);
}
.project-card__tags span {
  padding: 0.25rem 0.5rem;
  background: var(--color-background-soft);
  border-radius: 0.35rem;
}
.project-card__content {
  flex: 1;
}
.project-card__maintenance {
  font-size: var(--text-xs);
  margin-top: 1rem;
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.project-card__base {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
  border-top: 1px solid var(--color-border);
  padding-top: 0.75rem;
}
.project-card__base i {
  width: 0.35rem;
  height: 0.35rem;
  border: 1px solid var(--color-text-muted);
  border-radius: 50%;
}
.project-card__base span {
  height: 0.35rem;
  width: 34%;
  margin: auto;
  border-radius: 2px;
  background: repeating-linear-gradient(90deg, var(--color-border) 0 3px, transparent 3px 7px);
}
.project-card__arrow {
  transition: transform var(--transition-fast);
}
@media (hover: hover) {
  .project-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-card-hover);
  }
  .project-card:hover .project-card__arrow {
    transform: translate(2px, -2px);
  }
}
</style>

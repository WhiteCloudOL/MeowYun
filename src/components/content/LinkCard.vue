<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import ConfigIcon from '@/components/ui/ConfigIcon.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import type { LinkCardItem } from '@/config/schema'
const props = defineProps<{ item: LinkCardItem }>()
const internal = computed(() => props.item.href.startsWith('/'))
</script>
<template>
  <component
    :is="internal ? RouterLink : 'a'"
    :id="'site-' + item.id"
    :to="internal ? item.href : undefined"
    :href="internal ? undefined : item.href"
    :target="internal ? undefined : '_blank'"
    rel="noopener noreferrer"
    class="link-card"
    ><span class="link-card__icon"
      ><ConfigIcon :name="item.icon" :provider="item.iconProvider" :size="23"
    /></span>
    <div>
      <h3>{{ item.title }}</h3>
      <p>{{ item.description }}</p>
    </div>
    <IconGlyph :name="internal ? 'arrow-right' : 'arrow-up-right'" :size="18"
  /></component>
</template>
<style scoped>
.link-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: start;
  padding: 1.4rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-medium);
  background: var(--color-surface-glass);
  box-shadow: var(--shadow-card);
  transition:
    transform var(--transition-normal),
    box-shadow var(--transition-normal);
}
.link-card__icon {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius-small);
  background: var(--color-accent-soft);
  color: var(--color-link);
}
.link-card h3 {
  font-size: var(--text-base);
  margin-bottom: 0.5rem;
}
.link-card p {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}
@media (hover: hover) {
  .link-card:hover {
    box-shadow: var(--shadow-card-hover);
  }
}
</style>

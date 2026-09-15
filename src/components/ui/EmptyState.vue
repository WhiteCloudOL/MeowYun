<script setup lang="ts">
import IconGlyph from './IconGlyph.vue'
import type { SiteIcon } from '@/types/icon'
withDefaults(
  defineProps<{ title: string; description: string; icon?: SiteIcon; label?: string }>(),
  { icon: 'cloud' },
)
</script>
<template>
  <section class="empty-state paper">
    <IconGlyph :name="icon" :size="40" />
    <p v-if="label" class="eyebrow">{{ label }}</p>
    <h1>{{ title }}</h1>
    <p class="empty-state__description">{{ description }}</p>
    <div class="empty-state__actions"><slot /></div>
  </section>
</template>
<style scoped>
.empty-state {
  display: grid;
  justify-items: center;
  gap: 1.25rem;
  max-width: 42rem;
  margin-inline: auto;
  text-align: center;
}
.empty-state > svg {
  color: var(--color-link);
}
.empty-state h1 {
  font-size: var(--text-2xl);
}
.empty-state__description {
  color: var(--color-text-secondary);
}
.empty-state__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}
</style>

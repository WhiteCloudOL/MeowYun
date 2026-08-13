<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: 'neutral' | 'rose' | 'sky' | 'violet'
  }>(),
  { tone: 'neutral' },
)
</script>

<template>
  <span class="base-tag" :class="`base-tag--${tone}`"><slot /></span>
</template>

<style scoped>
.base-tag {
  display: inline-flex;
  min-height: 1.9rem;
  align-items: center;
  padding: 0.3rem 0.7rem;
  border: 1px dashed var(--paper-edge);
  border-radius: var(--radius-round);
  background: var(--paper-surface-alt);
  box-shadow: 0.12rem 0.14rem 0 color-mix(in srgb, var(--site-accent) 10%, transparent);
  color: var(--anime-text-soft);
  font-size: var(--text-xs);
  font-weight: 650;
  line-height: 1.2;
}

.base-tag--rose {
  background: var(--color-primary-soft);
  color: var(--color-primary-hover);
}

.base-tag--sky {
  background: var(--color-secondary-soft);
  color: var(--color-text-secondary);
}

.base-tag--violet {
  background: var(--color-accent-soft);
  color: var(--color-text-secondary);
}
</style>

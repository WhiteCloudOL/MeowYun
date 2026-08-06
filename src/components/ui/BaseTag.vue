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
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-round);
  background: rgb(220 229 255 / 9%);
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

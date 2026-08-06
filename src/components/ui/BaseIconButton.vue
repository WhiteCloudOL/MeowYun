<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    pressed?: boolean
  }>(),
  { pressed: false },
)
</script>

<template>
  <button class="base-icon-button" type="button" :aria-label="label" :aria-pressed="pressed">
    <slot />
  </button>
</template>

<style scoped>
.base-icon-button {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  flex: none;
  place-items: center;
  border: 1px solid var(--anime-border);
  border-radius: 50%;
  background: var(--anime-glass-strong);
  cursor: pointer;
  font-size: 1.1rem;
  color: var(--anime-text);
  backdrop-filter: blur(0.8rem);
  transition:
    transform var(--transition-press),
    background-color var(--transition-fast),
    border-color var(--transition-fast);
}

.base-icon-button:active {
  transform: scale(0.94);
}

@media (hover: hover) {
  .base-icon-button:hover {
    background: var(--color-primary-soft);
  }
}
</style>

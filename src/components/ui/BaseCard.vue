<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'solid' | 'glass'
    hoverable?: boolean
    padded?: boolean
  }>(),
  {
    variant: 'glass',
    hoverable: true,
    padded: true,
  },
)
</script>

<template>
  <section
    class="base-card"
    :class="[
      `base-card--${variant}`,
      { 'base-card--hoverable': hoverable, 'base-card--padded': padded },
    ]"
  >
    <slot />
  </section>
</template>

<style scoped>
.base-card {
  position: relative;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--anime-border);
  border-radius: var(--radius-large);
  transition:
    transform var(--transition-normal),
    box-shadow var(--transition-normal),
    background-color var(--transition-normal),
    border-color var(--transition-normal);
}

.base-card--padded {
  padding: clamp(var(--space-6), 4vw, var(--space-10));
}

.base-card--solid {
  background: var(--anime-glass-strong);
  box-shadow: var(--anime-shadow);
}

.base-card--glass {
  border-color: var(--anime-border-bright);
  background: rgb(var(--anime-glass-rgb) / var(--site-glass-opacity, 46%));
  box-shadow: var(--anime-shadow), inset 0 1px 0 rgb(255 255 255 / 8%);
  backdrop-filter: blur(1.1rem) saturate(120%);
  -webkit-backdrop-filter: blur(1.1rem) saturate(120%);
}

@media (hover: hover) {
  .base-card--hoverable:hover {
    box-shadow: var(--shadow-card-hover);
    transform: translateY(-0.2rem);
  }
}

@supports not (backdrop-filter: blur(1px)) {
  .base-card--glass {
    background: var(--color-surface-fallback);
  }
}

@media (prefers-reduced-transparency: reduce) {
  .base-card--glass {
    background: var(--color-surface-fallback);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}

@media (max-width: 48rem) {
  .base-card--glass {
    backdrop-filter: blur(0.65rem) saturate(115%);
    -webkit-backdrop-filter: blur(0.65rem) saturate(115%);
  }
}
</style>

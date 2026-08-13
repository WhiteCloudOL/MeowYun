<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'solid' | 'glass' | 'paper'
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

.base-card::before {
  position: absolute;
  z-index: 0;
  top: 0;
  right: 12%;
  left: 12%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgb(255 179 211 / 70%), transparent);
  content: '';
  opacity: 0.75;
  pointer-events: none;
}

.base-card > :deep(*) {
  position: relative;
  z-index: 1;
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
  box-shadow: var(--anime-shadow), inset 0 1px 0 rgb(255 255 255 / 12%);
  backdrop-filter: blur(1.1rem) saturate(128%);
  -webkit-backdrop-filter: blur(1.1rem) saturate(128%);
}

.base-card--paper {
  overflow: visible;
  border-color: var(--paper-edge);
  border-radius: 1.5rem 1.5rem 1.5rem 0.65rem;
  background:
    repeating-linear-gradient(
      180deg,
      transparent 0,
      transparent 2.25rem,
      var(--paper-line) 2.25rem,
      var(--paper-line) calc(2.25rem + 1px)
    ),
    var(--paper-surface);
  box-shadow: var(--paper-shadow);
}

.base-card--paper::before {
  top: -0.55rem;
  right: auto;
  left: 50%;
  width: 4.4rem;
  height: 1.15rem;
  border: 0;
  background: var(--tape-surface);
  clip-path: polygon(5% 8%, 96% 0, 100% 90%, 0 100%);
  opacity: 0.88;
  transform: translateX(-50%) rotate(-1.5deg);
}

@media (hover: hover) {
  .base-card--hoverable:hover {
    box-shadow: var(--shadow-card-hover);
    transform: translateY(-0.28rem) scale(1.005);
  }


  .base-card--paper.base-card--hoverable:hover {
    box-shadow: 0.6rem 0.75rem 0 color-mix(in srgb, var(--site-accent) 14%, transparent), var(--shadow-card-hover);
    transform: translateY(-0.3rem) rotate(-0.25deg);
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

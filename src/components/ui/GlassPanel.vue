<script setup lang="ts">
withDefaults(
  defineProps<{
    as?: 'section' | 'article' | 'div'
    density?: 'airy' | 'compact'
  }>(),
  {
    as: 'section',
    density: 'airy',
  },
)
</script>

<template>
  <component
    :is="as"
    class="glass-panel relative overflow-hidden border border-white/40 bg-white/20 backdrop-blur-xl"
    :class="`glass-panel--${density}`"
  >
    <slot />
  </component>
</template>

<style scoped>
.glass-panel {
  border-radius: clamp(1.4rem, 3vw, 2.25rem);
  background-color: rgb(255 255 255 / 42%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 72%),
    0 1.25rem 4rem rgb(35 34 58 / 14%);
  color: var(--home-ink, #2f2b3b);
  transition:
    border-color 320ms var(--ease-spring),
    box-shadow 420ms var(--ease-spring),
    transform 520ms var(--ease-spring);
}

.glass-panel--airy {
  padding: clamp(1.25rem, 4vw, 2.75rem);
}

.glass-panel--compact {
  padding: clamp(1rem, 2.8vw, 1.8rem);
}

@media (hover: hover) {
  .glass-panel:hover {
    border-color: rgb(255 255 255 / 68%);
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 84%),
      0 1.7rem 4.8rem rgb(35 34 58 / 18%);
    transform: translateY(-0.25rem);
  }
}

:global(:root[data-theme='dark']) .glass-panel {
  border-color: rgb(255 255 255 / 22%);
  background-color: rgb(25 24 43 / 44%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 16%),
    0 1.25rem 4rem rgb(4 4 15 / 28%);
  color: var(--home-ink, #f8f5fb);
}

@media (prefers-reduced-transparency: reduce) {
  .glass-panel,
  :global(:root[data-theme='dark']) .glass-panel {
    background-color: var(--color-surface-fallback);
    backdrop-filter: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .glass-panel {
    transition: none;
  }
}
</style>

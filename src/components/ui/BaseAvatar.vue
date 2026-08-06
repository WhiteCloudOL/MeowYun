<script setup lang="ts">
withDefaults(
  defineProps<{
    src?: string
    alt: string
    initials: string
    size?: 'medium' | 'large'
    shape?: 'round' | 'squircle'
  }>(),
  {
    src: '',
    size: 'large',
    shape: 'squircle',
  },
)
</script>

<template>
  <div class="base-avatar" :class="[`base-avatar--${size}`, `base-avatar--${shape}`]">
    <img v-if="src" :src="src" :alt="alt" class="base-avatar__image" />
    <span v-else class="base-avatar__fallback" role="img" :aria-label="alt">{{ initials }}</span>
  </div>
</template>

<style scoped>
.base-avatar {
  flex: none;
  overflow: hidden;
  border: 1px solid var(--color-border-glass);
  border-radius: var(--radius-avatar);
  background: var(--gradient-ribbon);
  box-shadow: var(--shadow-avatar);
  transition:
    transform var(--transition-normal),
    box-shadow var(--transition-normal);
}

.base-avatar--round {
  border-radius: 50%;
}

.base-avatar--medium {
  width: 4rem;
  height: 4rem;
}

.base-avatar--large {
  width: clamp(5.5rem, 12vw, 7.5rem);
  height: clamp(5.5rem, 12vw, 7.5rem);
}

.base-avatar__image,
.base-avatar__fallback {
  width: 100%;
  height: 100%;
}

.base-avatar__image {
  object-fit: cover;
}

.base-avatar__fallback {
  display: grid;
  place-items: center;
  background: rgb(255 255 255 / 30%);
  color: #ffffff;
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  text-shadow: 0 0.1rem 0.6rem rgb(84 61 75 / 16%);
}

@media (hover: hover) {
  .base-avatar:hover {
    box-shadow: var(--shadow-card-hover);
    transform: scale(1.025);
  }
}
</style>

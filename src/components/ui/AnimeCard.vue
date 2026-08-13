<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'

const props = withDefaults(
  defineProps<{
    as?: 'article' | 'section' | 'div'
    tilt?: number
    tape?: 'pink' | 'blue' | 'mint' | 'yellow' | 'none'
    sticker?: string
    interactive?: boolean
    padded?: boolean
  }>(),
  {
    as: 'section',
    tilt: 0,
    tape: 'pink',
    sticker: '✦',
    interactive: true,
    padded: true,
  },
)

const cardStyle = computed(
  () =>
    ({
      '--anime-card-tilt': `${props.tilt}deg`,
    }) as CSSProperties,
)
</script>

<template>
  <component
    :is="as"
    class="anime-card glass-acrylic relative isolate rounded-scrapbook"
    :class="{
      'anime-card--interactive': interactive,
      'anime-card--padded': padded,
    }"
    :style="cardStyle"
  >
    <span v-if="tape !== 'none'" class="anime-card__tape" :data-tone="tape" aria-hidden="true"></span>
    <span v-if="sticker" class="anime-card__sticker" aria-hidden="true">{{ sticker }}</span>
    <div class="anime-card__content">
      <slot />
    </div>
  </component>
</template>

<style scoped>
.anime-card {
  min-width: 0;
  border-color: color-mix(in srgb, white 66%, var(--site-accent));
  background:
    radial-gradient(circle at 14% 10%, rgb(255 255 255 / 74%), transparent 32%),
    rgb(var(--anime-glass-rgb) / 72%);
  box-shadow:
    inset 0 2px 4px rgb(255 255 255 / 64%),
    0.42rem 0.5rem 0 color-mix(in srgb, var(--site-accent) 10%, transparent),
    0 1rem 2.6rem rgb(49 42 73 / 12%);
  transform: rotate(var(--anime-card-tilt));
  transform-style: preserve-3d;
  transition:
    transform 520ms var(--ease-spring),
    box-shadow 420ms var(--ease-spring),
    border-color 300ms var(--ease-spring);
}

.anime-card--padded {
  padding: clamp(1.25rem, 4vw, 2.4rem);
}

.anime-card__content {
  position: relative;
  z-index: 1;
}

.anime-card__tape {
  position: absolute;
  z-index: 3;
  top: -0.65rem;
  left: 50%;
  width: 5.4rem;
  height: 1.35rem;
  clip-path: polygon(4% 10%, 96% 0, 100% 88%, 0 100%);
  background: rgb(255 183 178 / 54%);
  box-shadow: inset 0 1px rgb(255 255 255 / 35%);
  transform: translateX(-50%) rotate(-2deg);
  transition: transform 420ms var(--ease-spring-bold);
}

.anime-card__tape[data-tone='blue'] {
  background: rgb(124 185 232 / 48%);
}

.anime-card__tape[data-tone='mint'] {
  background: rgb(180 248 200 / 48%);
}

.anime-card__tape[data-tone='yellow'] {
  background: rgb(253 253 150 / 52%);
}

.anime-card__sticker {
  position: absolute;
  z-index: 2;
  right: 1rem;
  bottom: 0.8rem;
  display: grid;
  width: 2.2rem;
  height: 2.2rem;
  place-items: center;
  border: 1px dashed color-mix(in srgb, var(--site-accent) 45%, transparent);
  border-radius: 48% 52% 45% 55% / 55% 42% 58% 45%;
  background: color-mix(in srgb, var(--spark-yellow, #fdfd96) 48%, var(--paper-surface));
  color: color-mix(in srgb, var(--site-accent) 66%, var(--anime-text));
  font-size: 0.86rem;
  transform: rotate(7deg);
  transition: transform 420ms var(--ease-spring-bold);
}

@media (hover: hover) {
  .anime-card--interactive:hover {
    border-color: color-mix(in srgb, var(--site-accent) 42%, white);
    box-shadow:
      inset 0 2px 4px rgb(255 255 255 / 72%),
      0.55rem 0.68rem 0 color-mix(in srgb, var(--site-accent) 17%, transparent),
      0 1.5rem 3.6rem color-mix(in srgb, var(--site-accent) 22%, rgb(49 42 73 / 16%));
    transform: translateY(-0.5rem) rotate(calc(var(--anime-card-tilt) * 0.45)) perspective(60rem)
      rotateX(1.2deg);
  }

  .anime-card--interactive:hover .anime-card__tape {
    transform: translateX(-50%) rotate(2deg) scale(1.04);
  }

  .anime-card--interactive:hover .anime-card__sticker {
    transform: rotate(-8deg) scale(1.12);
  }
}

@media (prefers-reduced-motion: reduce) {
  .anime-card,
  .anime-card__tape,
  .anime-card__sticker {
    transition: none;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .anime-card {
    background: var(--color-surface-fallback);
    backdrop-filter: none;
  }
}
</style>

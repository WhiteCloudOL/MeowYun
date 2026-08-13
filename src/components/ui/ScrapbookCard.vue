<script setup lang="ts">
import { computed } from 'vue'

type CardTag = 'article' | 'div' | 'section'
type CardTone = 'cream' | 'mint' | 'pink' | 'white' | 'yellow'

const props = withDefaults(
  defineProps<{
    as?: CardTag
    interactive?: boolean
    tape?: boolean
    tilt?: number
    tone?: CardTone
  }>(),
  {
    as: 'div',
    interactive: false,
    tape: true,
    tilt: 0,
    tone: 'white',
  },
)

const cardStyle = computed(() => ({ '--scrapbook-tilt': `${props.tilt}deg` }))
</script>

<template>
  <component
    :is="as"
    class="scrapbook-card relative rounded-[2rem] border-4 border-chocolate"
    :class="[`scrapbook-card--${tone}`, { 'scrapbook-card--interactive': interactive }]"
    :style="cardStyle"
  >
    <span v-if="tape" class="scrapbook-card__tape scrapbook-card__tape--left" aria-hidden="true"></span>
    <span v-if="tape" class="scrapbook-card__tape scrapbook-card__tape--right" aria-hidden="true"></span>
    <div class="scrapbook-card__content">
      <slot />
    </div>
  </component>
</template>

<style scoped>
.scrapbook-card {
  --card-paper: #ffffff;
  --card-shadow: #ff9ebb;
  position: relative;
  border: 4px solid #4a3b32;
  border-radius: 2rem;
  background-color: var(--card-paper);
  box-shadow: 7px 7px 0 var(--card-shadow);
  color: #4a3b32;
  transform: rotate(var(--scrapbook-tilt));
  transform-origin: center;
}

.scrapbook-card--cream {
  --card-paper: #fffdf9;
  --card-shadow: #a7e9af;
}

.scrapbook-card--yellow {
  --card-paper: #fffbd1;
  --card-shadow: #ff9ebb;
}

.scrapbook-card--mint {
  --card-paper: #e5f9e8;
  --card-shadow: #fdfd96;
}

.scrapbook-card--pink {
  --card-paper: #fff0f5;
  --card-shadow: #a7e9af;
}

.scrapbook-card--interactive {
  transition:
    box-shadow 380ms cubic-bezier(0.34, 1.56, 0.64, 1),
    transform 480ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.scrapbook-card__content {
  position: relative;
  z-index: 1;
}

.scrapbook-card__tape {
  position: absolute;
  z-index: 2;
  top: -1.15rem;
  width: 5.6rem;
  height: 1.65rem;
  border: 2px solid rgb(74 59 50 / 28%);
  background-color: rgb(253 253 150 / 82%);
  clip-path: polygon(3% 8%, 98% 0, 94% 92%, 0 100%);
  pointer-events: none;
}

.scrapbook-card__tape--left {
  left: 12%;
  transform: rotate(-7deg);
}

.scrapbook-card__tape--right {
  right: 12%;
  background-color: rgb(167 233 175 / 78%);
  transform: rotate(6deg);
}

@media (hover: hover) {
  .scrapbook-card--interactive:hover {
    box-shadow: 10px 11px 0 var(--card-shadow);
    transform: translateY(-0.45rem) rotate(calc(var(--scrapbook-tilt) * -0.35)) scale(1.015);
  }
}

@media (prefers-reduced-motion: reduce) {
  .scrapbook-card--interactive {
    transition: none;
  }
}
</style>

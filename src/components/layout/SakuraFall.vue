<script setup lang="ts">
interface SakuraPetal {
  id: number
  delay: string
  drift: string
  duration: string
  left: string
  opacity: string
  size: string
}

const petals: SakuraPetal[] = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: `${(index * 37 + 5) % 100}%`,
  size: `${8 + (index % 5) * 2}px`,
  delay: `${-((index * 1.61) % 18)}s`,
  duration: `${13 + (index % 7) * 1.55}s`,
  drift: `${(index % 2 === 0 ? 1 : -1) * (36 + (index % 5) * 17)}px`,
  opacity: `${0.34 + (index % 4) * 0.09}`,
}))
</script>

<template>
  <div class="sakura-fall" aria-hidden="true">
    <i
      v-for="petal in petals"
      :key="petal.id"
      :style="{
        '--petal-left': petal.left,
        '--petal-size': petal.size,
        '--petal-delay': petal.delay,
        '--petal-duration': petal.duration,
        '--petal-drift': petal.drift,
        '--petal-opacity': petal.opacity,
      }"
    ></i>
  </div>
</template>

<style scoped>
.sakura-fall {
  position: fixed;
  z-index: 0;
  inset: 0;
  contain: strict;
  overflow: clip;
  pointer-events: none;
}

.sakura-fall i {
  position: absolute;
  top: -6vh;
  left: var(--petal-left);
  width: var(--petal-size);
  height: calc(var(--petal-size) * 0.72);
  border: 1px solid rgb(74 59 50 / 22%);
  border-radius: 82% 18% 76% 24%;
  background-color: #ffacc5;
  animation: sakura-drift var(--petal-duration) linear var(--petal-delay) infinite;
  opacity: 0;
  will-change: transform, opacity;
}

.sakura-fall i:nth-child(3n) {
  background-color: #ffd4e1;
}

.sakura-fall i:nth-child(4n) {
  background-color: #fff1f6;
}

@keyframes sakura-drift {
  0% {
    opacity: 0;
    transform: translate3d(0, -4vh, 0) rotate(-25deg);
  }

  12%,
  84% {
    opacity: var(--petal-opacity);
  }

  48% {
    transform: translate3d(var(--petal-drift), 52vh, 0) rotate(190deg);
  }

  100% {
    opacity: 0;
    transform: translate3d(calc(var(--petal-drift) * -0.4), 112vh, 0) rotate(390deg);
  }
}

@media (max-width: 42rem) {
  .sakura-fall i:nth-child(2n) {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sakura-fall {
    display: none;
  }
}
</style>

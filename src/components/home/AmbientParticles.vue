<script setup lang="ts">
type ParticleKind = 'cloud' | 'note' | 'star'

interface AmbientParticle {
  id: number
  kind: ParticleKind
  left: string
  top: string
  size: string
  delay: string
  duration: string
  drift: string
  opacity: string
}

const particleKinds: ParticleKind[] = ['cloud', 'star', 'note']
const particles: AmbientParticle[] = Array.from({ length: 16 }, (_, index) => ({
    id: index,
    kind: particleKinds[index % particleKinds.length] ?? 'star',
    left: `${(index * 43 + 7) % 100}%`,
    top: `${(index * 31 + 9) % 88}%`,
    size: `${12 + (index % 5) * 4}px`,
    delay: `${-((index * 1.37) % 13)}s`,
    duration: `${10 + (index % 7) * 1.8}s`,
    drift: `${(index % 2 === 0 ? 1 : -1) * (9 + (index % 4) * 5)}px`,
    opacity: `${0.3 + (index % 4) * 0.08}`,
  }))
</script>

<template>
  <div class="ambient-particles" aria-hidden="true">
    <i
      v-for="particle in particles"
      :key="particle.id"
      :class="`ambient-particles__${particle.kind}`"
      :style="{
        '--particle-left': particle.left,
        '--particle-top': particle.top,
        '--particle-size': particle.size,
        '--particle-delay': particle.delay,
        '--particle-duration': particle.duration,
        '--particle-drift': particle.drift,
        '--particle-opacity': particle.opacity,
      }"
    ></i>
  </div>
</template>

<style scoped>
.ambient-particles {
  position: fixed;
  z-index: 0;
  inset: 0;
  contain: strict;
  overflow: clip;
  pointer-events: none;
}

.ambient-particles i {
  position: absolute;
  top: var(--particle-top);
  left: var(--particle-left);
  width: var(--particle-size);
  height: var(--particle-size);
  animation: ambient-float var(--particle-duration) ease-in-out var(--particle-delay) infinite alternate;
  opacity: var(--particle-opacity);
  will-change: transform, opacity;
}

.ambient-particles__cloud {
  width: calc(var(--particle-size) * 1.8) !important;
  height: calc(var(--particle-size) * 0.72) !important;
  border: 2px solid rgb(74 59 50 / 22%);
  border-radius: 999px;
  background-color: #ffffff;
}

.ambient-particles__cloud::before,
.ambient-particles__cloud::after {
  position: absolute;
  bottom: 35%;
  border: inherit;
  border-bottom: 0;
  border-radius: 50% 50% 0 0;
  background-color: inherit;
  content: '';
}

.ambient-particles__cloud::before {
  left: 18%;
  width: 42%;
  height: 100%;
}

.ambient-particles__cloud::after {
  right: 14%;
  width: 34%;
  height: 78%;
}

.ambient-particles__star {
  clip-path: polygon(50% 0, 59% 40%, 100% 50%, 59% 60%, 50% 100%, 41% 60%, 0 50%, 41% 40%);
  background-color: #f6d85f;
}

.ambient-particles__note::before {
  position: absolute;
  inset: -0.3em;
  color: #ff7fa7;
  content: '♪';
  font-family: ui-rounded, 'Microsoft YaHei UI', sans-serif;
  font-size: calc(var(--particle-size) * 1.5);
  font-style: normal;
  font-weight: 900;
  line-height: 1;
}

@keyframes ambient-float {
  from {
    transform: translate3d(0, 0.5rem, 0) rotate(-7deg);
  }

  to {
    transform: translate3d(var(--particle-drift), -1rem, 0) rotate(8deg);
  }
}

@media (max-width: 42rem) {
  .ambient-particles i:nth-child(2n) {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ambient-particles i {
    animation: none;
    opacity: var(--particle-opacity);
    transform: none;
  }
}
</style>

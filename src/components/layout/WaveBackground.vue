<template>
  <div class="wave-background" aria-hidden="true">
    <svg class="wave-background__ribbon" viewBox="0 0 1600 430" preserveAspectRatio="none">
      <defs>
        <linearGradient id="ribbon-main" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#f2a7c1" />
          <stop offset="0.5" stop-color="#9dd5f5" />
          <stop offset="1" stop-color="#c5b7f5" />
        </linearGradient>
      </defs>
      <path
        class="wave-background__path wave-background__path--soft"
        d="M-80 318C244 120 422 397 739 242C1036 96 1198 198 1680 26V474H-80Z"
        fill="url(#ribbon-main)"
      />
      <path
        class="wave-background__path wave-background__path--line"
        d="M-40 335C272 148 450 390 745 254C1046 116 1260 182 1660 42"
        fill="none"
        stroke="url(#ribbon-main)"
        stroke-linecap="round"
        stroke-width="12"
      />
    </svg>
  </div>
</template>

<style scoped>
.wave-background {
  position: fixed;
  z-index: -1;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.wave-background__ribbon {
  position: absolute;
  right: -8%;
  bottom: -4%;
  width: min(112rem, 180vw);
  height: clamp(11rem, 36vh, 27rem);
  animation: ribbon-drift 16s var(--ease-spring) infinite alternate;
  opacity: 0.14;
  transform-origin: 70% 100%;
}

.wave-background__path--soft {
  opacity: 0.26;
}

.wave-background__path--line {
  opacity: 0.34;
}

@keyframes ribbon-drift {
  from {
    transform: translate3d(0, 0, 0) scaleY(1);
  }

  to {
    transform: translate3d(-3.5%, 1%, 0) scaleY(1.045);
  }
}

@media (max-width: 48rem) {
  .wave-background__ribbon {
    right: -28%;
    height: 12rem;
    opacity: 0.1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .wave-background__ribbon {
    animation: none;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .wave-background__ribbon {
    opacity: 0.12;
  }
}
</style>

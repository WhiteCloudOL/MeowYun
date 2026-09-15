<template>
  <section class="cloud-banner" :class="{ 'cloud-banner--single': !$slots.note }">
    <svg
      class="cloud-banner__shape"
      viewBox="0 0 1100 280"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M34 206C6 190 3 146 28 130C3 90 28 57 69 59C72 24 116 16 149 37C177 7 225 8 254 34C286 11 329 9 355 32C398 6 455 10 484 31C518 3 570 11 597 29C643 6 684 11 714 33C757 12 806 11 835 34C877 9 922 21 941 43C997 21 1031 45 1035 79C1081 70 1104 112 1080 140C1109 177 1090 215 1052 219C1044 258 996 269 966 246C925 274 883 266 851 246C813 272 769 270 738 248C698 275 652 267 623 247C579 271 534 268 506 247C463 273 419 267 386 246C345 272 304 264 276 244C235 269 190 264 163 242C120 268 75 254 72 227C53 227 40 220 34 206Z"
      />
    </svg>
    <svg
      class="cloud-banner__shape cloud-banner__shape--mobile"
      viewBox="0 0 400 380"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M27 82C4 71 15 37 47 35C53 6 91 6 112 24C146 2 176 8 190 26C229 2 264 12 279 30C315 12 350 22 354 54C389 51 408 83 391 108C408 139 400 164 379 180C405 210 403 240 382 255C403 291 385 320 354 321C348 356 315 373 284 357C254 383 217 372 196 356C164 378 129 371 109 352C75 371 38 351 37 320C4 310 3 278 21 257C0 230 9 194 24 179C2 146 4 109 27 97Z"
      />
    </svg>
    <div class="cloud-banner__content"><slot /></div>
    <div v-if="$slots.note" class="cloud-banner__note"><slot name="note" /></div>
  </section>
</template>
<style scoped>
.cloud-banner {
  position: relative;
  isolation: isolate;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 230px;
  align-items: center;
  gap: 3rem;
  padding: 3rem;
}
.cloud-banner--single {
  grid-template-columns: minmax(0, 1fr);
}
.cloud-banner__shape {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
  filter: drop-shadow(0 8px 15px rgb(var(--tone-rose) / 0.18));
}
.cloud-banner__shape path {
  fill: rgb(var(--tone-rose) / 0.3);
  stroke: rgb(var(--tone-rose) / 0.55);
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}
.cloud-banner__shape--mobile {
  display: none;
}
.cloud-banner__note {
  padding: 1.5rem;
  border: 1px solid var(--color-rim);
  border-radius: var(--radius-jelly);
  background: var(--color-surface-glass);
  box-shadow: var(--shadow-card);
  transform: none;
  transition: transform 430ms var(--ease-spring-bold);
}
.cloud-banner:focus-within .cloud-banner__note {
  transform: none;
}
@media (hover: hover) {
  .cloud-banner:hover .cloud-banner__note {
    transform: translateY(-2px);
  }
}
@media (max-width: 600px) {
  .cloud-banner {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    padding: 2rem;
  }
  .cloud-banner__shape {
    display: none;
  }
  .cloud-banner__shape--mobile {
    display: block;
  }
  .cloud-banner__note {
    width: min(100%, 230px);
    justify-self: end;
    padding: 1.25rem;
  }
}
</style>

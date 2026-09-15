<template>
  <div class="sky-backdrop" aria-hidden="true">
    <svg v-for="n in 4" :key="n" class="sky-cloud" :class="'sky-cloud--' + n" viewBox="0 0 700 300">
      <path
        d="M40 247C-15 237-8 164 49 156C21 104 65 51 118 71C143 1 242 3 270 62C334 30 399 66 410 117C471 78 527 108 539 155C620 110 687 155 677 214C722 254 670 299 617 286H98C64 291 30 278 40 247Z"
      />
    </svg>
    <span v-for="n in 5" :key="'star' + n" class="sky-star" :style="{ '--star-index': n }">✦</span>
  </div>
</template>
<style scoped>
.sky-backdrop {
  position: absolute;
  z-index: -2;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  background:
    radial-gradient(ellipse 650px 450px at 70% 6%, rgb(var(--tone-blue) / 0.14), transparent),
    radial-gradient(
      ellipse 1200px 700px at 20% 0%,
      rgb(var(--atmosphere-tone) / 0.16),
      transparent
    ),
    linear-gradient(145deg, var(--color-warm), var(--color-background) 24%);
}
.sky-cloud {
  position: absolute;
  width: 650px;
  height: 280px;
  left: -220px;
  top: 250px;
  fill: var(--color-cloud);
  opacity: 0.72;
}
.sky-cloud--2 {
  left: auto;
  right: -210px;
  top: 31%;
  fill: var(--color-cloud-lilac);
  opacity: 0.5;
  transform: scaleX(-1);
}
.sky-cloud--3 {
  top: 60%;
  fill: var(--color-cloud-blue);
  opacity: 0.6;
}
.sky-cloud--4 {
  top: auto;
  bottom: 2rem;
  left: calc(50% - 320px);
  opacity: 0.8;
}
.sky-star {
  position: absolute;
  left: 7%;
  top: calc(var(--star-index) * 17%);
  font-size: 14px;
  color: rgb(var(--tone-lilac));
  opacity: 0.5;
}
.sky-star:nth-of-type(2n) {
  left: auto;
  right: 7%;
}
:global(.reading-page .sky-backdrop) {
  background: var(--color-background);
}
:global(.reading-page .sky-cloud) {
  opacity: 0.15;
}
:global([data-scenery='false'] .sky-cloud),
:global([data-scenery='false'] .sky-star) {
  display: none;
}
@media (max-width: 600px) {
  .sky-cloud {
    width: 430px;
    left: -230px;
  }
  .sky-cloud--2 {
    left: auto;
    right: -240px;
  }
  .sky-cloud--4 {
    left: -30px;
  }
  .sky-star {
    font-size: 11px;
  }
}
</style>

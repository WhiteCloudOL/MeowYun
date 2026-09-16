<template>
  <svg class="cloud-brand-mark" viewBox="0 0 48 48" role="img" aria-label="清蒸云鸭云朵标识">
    <path
      class="cloud-brand-mark__wash"
      d="M13.1 36.1c-5.2 0-9.1-3.5-9.1-8.1 0-4 2.8-7.2 6.8-8.1.6-6.1 5.5-10.7 11.8-10.7 4.8 0 8.9 2.7 10.7 6.8 6-.1 10.7 4 10.7 9.6 0 5.8-4.9 10.5-11.1 10.5Z"
    />
    <path
      class="cloud-brand-mark__line"
      d="M13.1 36.1c-5.2 0-9.1-3.5-9.1-8.1 0-4 2.8-7.2 6.8-8.1.6-6.1 5.5-10.7 11.8-10.7 4.8 0 8.9 2.7 10.7 6.8 6-.1 10.7 4 10.7 9.6 0 5.8-4.9 10.5-11.1 10.5Z"
    />
    <circle class="cloud-brand-mark__dot" cx="19.1" cy="29" r="1.2" />
    <circle class="cloud-brand-mark__dot" cx="24" cy="29" r="1.2" />
    <circle class="cloud-brand-mark__dot" cx="28.9" cy="29" r="1.2" />
  </svg>
</template>

<style scoped>
.cloud-brand-mark {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}
.cloud-brand-mark__wash {
  fill: rgb(var(--tone-lilac) / 0.18);
}
.cloud-brand-mark__line {
  fill: none;
  stroke: color-mix(in srgb, var(--color-link) 58%, var(--color-blue));
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}
.cloud-brand-mark__dot {
  fill: color-mix(in srgb, var(--color-link) 58%, var(--color-blue));
}
</style>

<template>
  <svg class="cloud-brand-mark" viewBox="0 0 48 48" role="img" aria-label="清蒸云鸭云朵标识">
    <path
      class="cloud-brand-mark__wash"
      d="M12.8 35.6c-5.1 0-8.8-3.7-8.8-8.2 0-3.8 2.6-7 6.4-8 .7-6.3 5.7-11 12.2-11 5.5 0 10.2 3.4 11.8 8.4 5.4.2 9.6 4.3 9.6 9.4 0 5.2-4.4 9.4-10 9.4Z"
    />
    <path
      class="cloud-brand-mark__line"
      d="M12.8 35.6c-5.1 0-8.8-3.7-8.8-8.2 0-3.8 2.6-7 6.4-8 .7-6.3 5.7-11 12.2-11 5.5 0 10.2 3.4 11.8 8.4 5.4.2 9.6 4.3 9.6 9.4 0 5.2-4.4 9.4-10 9.4Z"
    />
    <path
      class="cloud-brand-mark__curl"
      d="M14.5 24.7c.8 2.8 3.1 4.7 5.8 4.7 2.1 0 3.9-1 5-2.6 1 1.2 2.5 2 4.2 2 2 0 3.7-1 4.7-2.6"
    />
    <circle class="cloud-brand-mark__dot cloud-brand-mark__dot--rose" cx="15.4" cy="20.2" r="2" />
    <circle class="cloud-brand-mark__dot cloud-brand-mark__dot--blue" cx="32.7" cy="20" r="2" />
    <path
      class="cloud-brand-mark__spark"
      d="m38.1 8.4.8 2.1 2.1.8-2.1.8-.8 2.1-.8-2.1-2.1-.8 2.1-.8Z"
    />
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
.cloud-brand-mark__line,
.cloud-brand-mark__curl {
  fill: none;
  stroke: color-mix(in srgb, var(--color-link) 72%, var(--color-blue));
  stroke-width: 2.1;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}
.cloud-brand-mark__curl {
  stroke-width: 1.8;
}
.cloud-brand-mark__dot--rose {
  fill: rgb(var(--tone-rose));
}
.cloud-brand-mark__dot--blue {
  fill: rgb(var(--tone-blue));
}
.cloud-brand-mark__spark {
  fill: rgb(var(--tone-lilac));
  stroke: var(--color-rim);
  stroke-width: 0.8;
}
</style>

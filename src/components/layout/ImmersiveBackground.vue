<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { PageBackground } from '@/config/schema'

const props = withDefaults(
  defineProps<{
    config: PageBackground
    cinematic?: boolean
  }>(),
  { cinematic: false },
)

const root = ref<HTMLElement>()
let parallaxFrame: number | undefined

const backgroundStyle = computed(() => ({
  '--background-image': `url("${props.config.image}")`,
  '--background-mobile-image': `url("${props.config.mobileImage ?? props.config.image}")`,
  '--background-position': props.config.position,
  '--background-overlay': props.config.overlay,
  '--background-blur': `${props.config.blur}px`,
  '--background-image-opacity': props.config.imageOpacity,
  '--background-grayscale': props.config.grayscale,
  '--background-saturation': props.config.saturation,
  '--background-brightness': props.config.brightness,
  '--background-tint': props.config.tintColor,
  '--background-tint-opacity': `${props.config.tintOpacity * 100}%`,
}))

// 使用确定性位置而非运行时随机数，避免路由切换或 hydration 后装饰突然跳动。
const particles = Array.from({ length: 24 }, (_, index) => ({
  id: index,
  left: `${(index * 37 + 11) % 100}%`,
  top: `${(index * 61 + 7) % 100}%`,
  delay: `${-((index * 0.73) % 9)}s`,
  duration: `${8 + (index % 7)}s`,
  size: `${3 + (index % 5)}px`,
}))

const twinkles = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: `${(index * 43 + 8) % 96}%`,
  top: `${(index * 67 + 5) % 92}%`,
  delay: `${-((index * 1.17) % 7)}s`,
  duration: `${3.8 + (index % 5) * 0.72}s`,
  size: `${4 + (index % 3) * 2}px`,
}))

function renderPointerParallax(event: PointerEvent) {
  if (parallaxFrame) return

  // 只在下一帧写入 CSS 变量，避免高频 pointermove 直接触发连续样式计算。
  parallaxFrame = requestAnimationFrame(() => {
    const x = event.clientX / window.innerWidth - 0.5
    const y = event.clientY / window.innerHeight - 0.5
    root.value?.style.setProperty('--parallax-image-x', `${x * -16}px`)
    root.value?.style.setProperty('--parallax-image-y', `${y * -12}px`)
    root.value?.style.setProperty('--parallax-near-x', `${x * 18}px`)
    root.value?.style.setProperty('--parallax-near-y', `${y * 12}px`)
    root.value?.style.setProperty('--parallax-far-x', `${x * -8}px`)
    root.value?.style.setProperty('--parallax-far-y', `${y * -5}px`)
    parallaxFrame = undefined
  })
}

function renderScrollParallax() {
  root.value?.style.setProperty('--parallax-scroll', `${Math.min(window.scrollY * 0.035, 28)}px`)
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  window.addEventListener('pointermove', renderPointerParallax, { passive: true })
  window.addEventListener('scroll', renderScrollParallax, { passive: true })
  renderScrollParallax()
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', renderPointerParallax)
  window.removeEventListener('scroll', renderScrollParallax)
  if (parallaxFrame) cancelAnimationFrame(parallaxFrame)
})
</script>

<template>
  <div
    ref="root"
    class="immersive-background"
    :class="[
      `immersive-background--${config.effect}`,
      {
        'immersive-background--pan': config.autoPan,
        'immersive-background--cinematic': cinematic,
      },
    ]"
    :style="backgroundStyle"
    aria-hidden="true"
  >
    <div class="immersive-background__aurora"></div>
    <div class="immersive-background__image"></div>
    <div class="immersive-background__overlay"></div>
    <svg
      class="immersive-background__doodles"
      viewBox="0 0 1200 800"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path class="doodle doodle--cloud" d="M46 150c18-31 62-32 80-4 25-18 66-2 63 31 29 2 38 43 11 56H55c-43-3-48-66-9-83Z" />
      <path class="doodle doodle--star" d="m1082 127 10 26 27 10-27 10-10 27-10-27-27-10 27-10 10-26Z" />
      <path class="doodle doodle--heart" d="M1090 650c-44-34-80-61-80-105 0-35 41-51 65-24 24-27 65-11 65 24 0 44-36 71-80 105Z" />
      <path class="doodle doodle--spark" d="m105 628 7 19 19 7-19 7-7 19-7-19-19-7 19-7 7-19Z" />
    </svg>
    <div v-if="config.twinkles" class="immersive-background__twinkles">
      <span
        v-for="twinkle in twinkles"
        :key="twinkle.id"
        :style="{
          '--twinkle-left': twinkle.left,
          '--twinkle-top': twinkle.top,
          '--twinkle-delay': twinkle.delay,
          '--twinkle-duration': twinkle.duration,
          '--twinkle-size': twinkle.size,
        }"
      ></span>
    </div>
    <div v-if="config.effect !== 'none'" class="immersive-background__particles">
      <span
        v-for="particle in particles"
        :key="particle.id"
        :style="{
          '--particle-left': particle.left,
          '--particle-top': particle.top,
          '--particle-delay': particle.delay,
          '--particle-duration': particle.duration,
          '--particle-size': particle.size,
        }"
      ></span>
    </div>
  </div>
</template>

<style scoped>
.immersive-background {
  position: fixed;
  z-index: -1;
  inset: 0;
  contain: strict;
  overflow: clip;
  --parallax-image-x: 0px;
  --parallax-image-y: 0px;
  --parallax-near-x: 0px;
  --parallax-near-y: 0px;
  --parallax-far-x: 0px;
  --parallax-far-y: 0px;
  --parallax-scroll: 0px;
  background:
    radial-gradient(circle at 16% 18%, rgb(124 185 232 / 32%), transparent 36%),
    radial-gradient(circle at 82% 20%, rgb(255 183 178 / 30%), transparent 38%),
    radial-gradient(circle at 50% 84%, rgb(180 248 200 / 18%), transparent 34%),
    linear-gradient(135deg, #f4f7fb, #fff0f5 58%, #f3efff);
  pointer-events: none;
}

.immersive-background__aurora,
.immersive-background__image,
.immersive-background__overlay,
.immersive-background__doodles,
.immersive-background__twinkles,
.immersive-background__particles {
  position: absolute;
  inset: 0;
}

.immersive-background__aurora {
  inset: -18%;
  animation: aurora-flow 18s var(--ease-spring) infinite alternate;
  background:
    radial-gradient(circle at 28% 28%, rgb(124 185 232 / 24%), transparent 34%),
    radial-gradient(circle at 74% 36%, rgb(255 183 178 / 26%), transparent 38%),
    radial-gradient(circle at 48% 74%, rgb(253 253 150 / 14%), transparent 34%);
  filter: blur(3.5rem);
}

.immersive-background__doodles {
  width: 100%;
  height: 100%;
  color: color-mix(in srgb, var(--site-accent) 50%, #7cb9e8);
  opacity: 0.2;
  transform: translate3d(
    var(--parallax-near-x),
    calc(var(--parallax-near-y) - var(--parallax-scroll)),
    0
  );
  transition: transform 700ms var(--ease-spring);
}

.doodle {
  fill: rgb(255 255 255 / 10%);
  stroke: currentcolor;
  stroke-dasharray: 7 9;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
  vector-effect: non-scaling-stroke;
}

.doodle--cloud,
.doodle--heart {
  animation: doodle-float 7s var(--ease-spring) infinite alternate;
  transform-origin: center;
}

.doodle--star,
.doodle--spark {
  animation: doodle-wiggle 6s var(--ease-spring-bold) infinite alternate;
  transform-origin: center;
}

.immersive-background__twinkles span {
  position: absolute;
  top: var(--twinkle-top);
  left: var(--twinkle-left);
  width: var(--twinkle-size);
  height: var(--twinkle-size);
  border-radius: 50%;
  animation: starlight-twinkle var(--twinkle-duration) var(--ease-spring) var(--twinkle-delay) infinite;
  background: currentcolor;
  box-shadow: 0 0 0.7rem currentcolor;
  color: color-mix(in srgb, #ffd5e8, var(--anime-text) 35%);
  opacity: 0.16;
}

.immersive-background__twinkles span::before,
.immersive-background__twinkles span::after {
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: var(--radius-round);
  background: currentcolor;
  content: '';
  transform: translate(-50%, -50%);
}

.immersive-background__twinkles span::before {
  width: 1px;
  height: 280%;
}

.immersive-background__twinkles span::after {
  width: 280%;
  height: 1px;
}

.immersive-background__image {
  inset: -1.5%;
  background-image: var(--background-image);
  background-position: var(--background-position);
  background-size: cover;
  filter: blur(var(--background-blur)) grayscale(var(--background-grayscale))
    saturate(var(--background-saturation)) brightness(var(--background-brightness));
  opacity: var(--background-image-opacity);
  transform: scale(1.035) translate3d(var(--parallax-image-x), var(--parallax-image-y), 0);
  transition: transform 900ms var(--ease-spring);
}

.immersive-background--pan .immersive-background__image {
  animation: background-breathe 20s var(--ease-spring) infinite alternate;
}

.immersive-background--cinematic {
  background-color: #fffdf9;
}

.immersive-background--cinematic .immersive-background__aurora,
.immersive-background--cinematic .immersive-background__doodles,
.immersive-background--cinematic .immersive-background__twinkles,
.immersive-background--cinematic .immersive-background__particles {
  display: none;
}

.immersive-background--cinematic .immersive-background__image {
  /* 首页底图由各场景独立渲染；此处关闭全局副本，保证透明度和模糊配置不会重复叠加。 */
  display: none;
}

.immersive-background--cinematic .immersive-background__overlay {
  background:
    radial-gradient(circle, rgb(255 158 187 / 32%) 2px, transparent 2.5px) 0 0 / 34px 34px,
    linear-gradient(90deg, rgb(167 233 175 / 14%) 1px, transparent 1px) 0 0 / 68px 68px,
    linear-gradient(rgb(167 233 175 / 14%) 1px, transparent 1px) 0 0 / 68px 68px,
    rgb(255 253 249 / 18%);
}

:global(:root[data-theme='dark'])
  .immersive-background--cinematic
  .immersive-background__overlay {
  background:
    radial-gradient(circle, rgb(255 158 187 / 26%) 2px, transparent 2.5px) 0 0 / 34px 34px,
    linear-gradient(90deg, rgb(167 233 175 / 9%) 1px, transparent 1px) 0 0 / 68px 68px,
    linear-gradient(rgb(167 233 175 / 9%) 1px, transparent 1px) 0 0 / 68px 68px,
    rgb(43 36 48 / 28%);
}

.immersive-background__overlay {
  background:
    radial-gradient(circle, rgb(255 255 255 / 12%) 1px, transparent 1.2px) 0 0 / 22px 22px,
    linear-gradient(90deg, rgb(124 185 232 / 4%) 1px, transparent 1px) 0 0 / 44px 44px,
    linear-gradient(rgb(255 183 178 / 4%) 1px, transparent 1px) 0 0 / 44px 44px,
    linear-gradient(
      color-mix(
        in srgb,
        var(--background-tint) var(--background-tint-opacity),
        transparent
      ),
      color-mix(
        in srgb,
        var(--background-tint) var(--background-tint-opacity),
        transparent
      )
    ),
    linear-gradient(180deg, rgb(45 20 43 / 8%), rgb(48 21 43 / 34%)),
    rgb(43 20 39 / var(--background-overlay));
}

.immersive-background__particles span {
  position: absolute;
  top: var(--particle-top);
  left: var(--particle-left);
  width: var(--particle-size);
  height: var(--particle-size);
  animation: particle-drift var(--particle-duration) var(--ease-spring) var(--particle-delay) infinite;
  opacity: 0.38;
}

.immersive-background__particles {
  transform: translate3d(
    var(--parallax-near-x),
    calc(var(--parallax-near-y) - var(--parallax-scroll)),
    0
  );
  transition: transform 760ms var(--ease-spring);
}

.immersive-background__twinkles {
  transform: translate3d(var(--parallax-far-x), var(--parallax-far-y), 0);
  transition: transform 900ms var(--ease-spring);
}

.immersive-background--stars .immersive-background__particles span {
  border-radius: 50%;
  background: #ffe0ee;
  box-shadow: 0 0 0.6rem rgb(255 189 218 / 56%);
}

.immersive-background--petals .immersive-background__particles span {
  border-radius: 85% 12% 78% 18%;
  background: linear-gradient(145deg, #fff1f7, #ffaad0);
  box-shadow: 0 0.15rem 0.45rem rgb(102 42 78 / 12%);
  transform: rotate(35deg);
}

.immersive-background--petals .immersive-background__particles span:nth-child(3n) {
  background: linear-gradient(145deg, #f9edff, #cbb4ef);
}

.immersive-background--petals .immersive-background__particles span:nth-child(4n) {
  background: linear-gradient(145deg, #ffffff, #f8cce0);
}

.immersive-background--snow .immersive-background__particles span {
  border-radius: 50%;
  background: #ffffff;
}

@keyframes background-breathe {
  from {
    transform: scale(1.035) translate3d(var(--parallax-image-x), var(--parallax-image-y), 0);
  }

  to {
    transform: scale(1.065)
      translate3d(
        calc(var(--parallax-image-x) - 0.5%),
        calc(var(--parallax-image-y) + 0.4%),
        0
      );
  }
}

@keyframes cinematic-breathe {
  from {
    transform: scale(1.02) translate3d(var(--parallax-image-x), var(--parallax-image-y), 0);
  }

  to {
    transform: scale(1.07)
      translate3d(
        calc(var(--parallax-image-x) - 0.35%),
        calc(var(--parallax-image-y) + 0.25%),
        0
      );
  }
}

@keyframes aurora-flow {
  from {
    transform: translate3d(var(--parallax-far-x), var(--parallax-far-y), 0) rotate(-3deg)
      scale(1);
  }

  to {
    transform: translate3d(
        calc(var(--parallax-far-x) + 2%),
        calc(var(--parallax-far-y) - 1%),
        0
      )
      rotate(4deg) scale(1.08);
  }
}

@keyframes doodle-float {
  to {
    transform: translateY(-0.8rem) rotate(2deg);
  }
}

@keyframes doodle-wiggle {
  to {
    transform: rotate(12deg) scale(1.08);
  }
}

@keyframes particle-drift {
  0% {
    opacity: 0;
    transform: translate3d(-0.35rem, 2.2rem, 0) rotate(-18deg) scale(0.78);
  }

  28% {
    opacity: 0.58;
    transform: translate3d(0.9rem, 0.4rem, 0) rotate(48deg) scale(1);
  }

  100% {
    opacity: 0;
    transform: translate3d(-0.25rem, -4rem, 0) rotate(150deg) scale(0.86);
  }
}

@keyframes starlight-twinkle {
  0%,
  100% {
    opacity: 0.08;
    transform: scale(0.55);
  }

  42% {
    opacity: 0.72;
    transform: scale(1);
  }

  58% {
    opacity: 0.26;
    transform: scale(0.72);
  }
}

@media (max-width: 48rem) {
  .immersive-background__image {
    background-image: var(--background-mobile-image);
  }

  .immersive-background__particles span:nth-child(2n) {
    display: none;
  }

  .immersive-background__twinkles span:nth-child(3n) {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .immersive-background--pan .immersive-background__image,
  .immersive-background__aurora,
  .immersive-background__doodles .doodle,
  .immersive-background__twinkles span,
  .immersive-background__particles span {
    animation: none;
  }

  .immersive-background__twinkles span {
    opacity: 0.28;
    transform: scale(0.72);
  }

  .immersive-background__image,
  .immersive-background__aurora,
  .immersive-background__doodles,
  .immersive-background__twinkles,
  .immersive-background__particles {
    transition: none;
    transform: none;
  }
}
</style>

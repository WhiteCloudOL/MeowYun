<script setup lang="ts">
import { computed } from 'vue'
import type { PageBackground } from '@/config/schema'

const props = defineProps<{
  config: PageBackground
}>()

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
</script>

<template>
  <div
    class="immersive-background"
    :class="[
      `immersive-background--${config.effect}`,
      { 'immersive-background--pan': config.autoPan },
    ]"
    :style="backgroundStyle"
    aria-hidden="true"
  >
    <div class="immersive-background__image"></div>
    <div class="immersive-background__overlay"></div>
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
  overflow: hidden;
  background: #0b1230;
  pointer-events: none;
}

.immersive-background__image,
.immersive-background__overlay,
.immersive-background__twinkles,
.immersive-background__particles {
  position: absolute;
  inset: 0;
}

.immersive-background__twinkles span {
  position: absolute;
  top: var(--twinkle-top);
  left: var(--twinkle-left);
  width: var(--twinkle-size);
  height: var(--twinkle-size);
  border-radius: 50%;
  animation: starlight-twinkle var(--twinkle-duration) ease-in-out var(--twinkle-delay) infinite;
  background: currentcolor;
  box-shadow: 0 0 0.7rem currentcolor;
  color: color-mix(in srgb, var(--anime-text), transparent 12%);
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
  transform: scale(1.035);
}

.immersive-background--pan .immersive-background__image {
  animation: background-breathe 20s ease-in-out infinite alternate;
}

.immersive-background__overlay {
  background:
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
    linear-gradient(180deg, rgb(7 11 30 / 10%), rgb(7 11 30 / 38%)),
    rgb(8 13 35 / var(--background-overlay));
}

.immersive-background__particles span {
  position: absolute;
  top: var(--particle-top);
  left: var(--particle-left);
  width: var(--particle-size);
  height: var(--particle-size);
  animation: particle-drift var(--particle-duration) ease-in-out var(--particle-delay) infinite;
  opacity: 0.38;
}

.immersive-background--stars .immersive-background__particles span {
  border-radius: 50%;
  background: #dce7ff;
  box-shadow: 0 0 0.6rem rgb(200 218 255 / 65%);
}

.immersive-background--petals .immersive-background__particles span {
  border-radius: 80% 10% 80% 10%;
  background: #ffd6e7;
  transform: rotate(35deg);
}

.immersive-background--snow .immersive-background__particles span {
  border-radius: 50%;
  background: #ffffff;
}

@keyframes background-breathe {
  from {
    transform: scale(1.035) translate3d(0, 0, 0);
  }

  to {
    transform: scale(1.065) translate3d(-0.5%, 0.4%, 0);
  }
}

@keyframes particle-drift {
  0%,
  100% {
    opacity: 0.18;
    transform: translate3d(0, -0.8rem, 0) rotate(0deg);
  }

  50% {
    opacity: 0.58;
    transform: translate3d(0.8rem, 1.5rem, 0) rotate(90deg);
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
  .immersive-background__twinkles span,
  .immersive-background__particles span {
    animation: none;
  }

  .immersive-background__twinkles span {
    opacity: 0.28;
    transform: scale(0.72);
  }
}
</style>

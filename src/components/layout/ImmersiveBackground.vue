<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { PageBackground } from '@/config/schema'
import { useMotion } from '@/composables/useMotion'
const props = withDefaults(
  defineProps<{ config: PageBackground; cinematic?: boolean; reading?: boolean }>(),
  { cinematic: false, reading: false },
)
const { motionAllowed } = useMotion()
const root = ref<HTMLElement>()
const onScreen = ref(true)
let observer: IntersectionObserver | undefined
// 背景装饰限定在页面顶部，离屏停止；正文没有粒子、鼠标监听或持续呼吸。
onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    onScreen.value = entries[0]?.isIntersecting ?? false
  })
  if (root.value) observer.observe(root.value)
})
onBeforeUnmount(() => observer?.disconnect())
const style = computed(() => ({
  '--wallpaper': 'url("' + props.config.image + '")',
  '--mobile-wallpaper': 'url("' + (props.config.mobileImage ?? props.config.image) + '")',
  '--position': props.config.position,
  '--wallpaper-opacity':
    Math.max(0, Math.min(1, props.config.imageOpacity)) *
    (props.reading ? 0.05 : props.cinematic ? 0.24 : 0.12),
  '--wallpaper-saturation': Math.max(0, Math.min(1.2, props.config.saturation)),
  '--wallpaper-brightness': Math.max(0.4, Math.min(1.2, props.config.brightness)),
}))
</script>
<template>
  <div
    ref="root"
    class="site-background"
    :class="{ 'is-home': cinematic, 'is-reading': reading }"
    :style="style"
    aria-hidden="true"
  >
    <div class="site-background__image"></div>
    <span
      v-if="cinematic && config.effect !== 'none'"
      class="cloud-note"
      :style="{ animationPlayState: motionAllowed && onScreen ? 'running' : 'paused' }"
      >✧</span
    >
  </div>
</template>
<style scoped>
.site-background {
  position: absolute;
  inset: 0 0 auto;
  height: 52rem;
  z-index: -1;
  pointer-events: none;
}
.site-background__image {
  position: absolute;
  inset: 0;
  background-image: var(--wallpaper);
  background-position: var(--position);
  background-size: cover;
  opacity: var(--wallpaper-opacity);
  filter: saturate(var(--wallpaper-saturation)) brightness(var(--wallpaper-brightness));
  mask-image: linear-gradient(to bottom, #000, transparent);
}
.is-reading {
  height: 28rem;
}
.cloud-note {
  position: absolute;
  top: 12rem;
  right: 6%;
  color: var(--color-link);
  font-size: 2rem;
  animation: cloud-drift 8s ease-in-out infinite alternate;
}
@media (max-width: 760px) {
  .site-background__image {
    background-image: var(--mobile-wallpaper);
  }
  .cloud-note {
    display: none;
  }
}
</style>

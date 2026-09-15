<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import ImageFallback from './ImageFallback.vue'
import { useMotion } from '@/composables/useMotion'
const { motionAllowed } = useMotion()
defineProps<{ src: string; alt: string }>()
const frame = ref<HTMLElement>()
const inView = ref(true)
let observer: IntersectionObserver | undefined
// 遮罩只作用在图像层，原头像留出内边距保护猫耳和发饰；不复制不透明图伪造破框。
onMounted(() => {
  if (!frame.value || !('IntersectionObserver' in window)) return
  observer = new IntersectionObserver(([entry]) => {
    inView.value = entry?.isIntersecting ?? false
  })
  observer.observe(frame.value)
})
onBeforeUnmount(() => observer?.disconnect())
</script>
<template>
  <figure ref="frame" class="cloud-avatar" :class="{ 'is-offscreen': !inView || !motionAllowed }">
    <div class="cloud-avatar__float">
      <div class="cloud-avatar__halo" aria-hidden="true"></div>
      <div class="cloud-avatar__rim" aria-hidden="true"></div>
      <div class="cloud-avatar__photo">
        <ImageFallback :src="src" :alt="alt" loading="eager" fit="contain" />
      </div>
      <span class="cloud-avatar__spark" aria-hidden="true">✦</span>
    </div>
  </figure>
</template>
<style scoped>
.cloud-avatar {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  isolation: isolate;
}
.cloud-avatar__float {
  position: absolute;
  inset: 0;
}
.cloud-avatar__halo {
  position: absolute;
  inset: 10%;
  z-index: -1;
  border-radius: 50%;
  background: conic-gradient(
    from 70deg,
    rgb(var(--tone-blue) / 0.65),
    rgb(var(--tone-rose) / 0.6),
    rgb(var(--tone-lilac) / 0.6),
    rgb(var(--tone-mint) / 0.5)
  );
  filter: blur(18px);
}
.cloud-avatar__rim,
.cloud-avatar__photo {
  position: absolute;
  inset: 0;
  mask-image: url('../../assets/cloud-mask.svg?no-inline');
  mask-size: 100% 100%;
  mask-repeat: no-repeat;
  overflow: hidden;
  border-radius: 43% 57% 58% 42% / 46% 42% 58% 54%;
}
.cloud-avatar__rim {
  background: var(--color-rim);
}
.cloud-avatar__photo {
  inset: 5px;
  background: var(--color-surface);
}
.cloud-avatar__photo :deep(.image-fallback) {
  width: 100%;
  height: 100%;
  padding: 10%;
  background: var(--color-avatar-paper);
}
.cloud-avatar__spark {
  position: absolute;
  left: 4%;
  top: 30%;
  color: var(--color-rim);
  text-shadow: 0 2px 8px rgb(var(--tone-blue) / 0.65);
  font-size: 1.8rem;
}
:global([data-motion='full'] .cloud-avatar__float) {
  animation: soft-float 7s ease-in-out infinite;
}
.is-offscreen .cloud-avatar__float {
  animation-play-state: paused;
}
</style>

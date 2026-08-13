<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const root = ref<HTMLElement>()
const visible = ref(false)
let observer: IntersectionObserver | undefined

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    visible.value = true
    return
  }

  // 只在首次进入视口时触发；完成后断开观察，避免滚动时反复执行动画。
  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return
      visible.value = true
      observer?.disconnect()
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
  )

  if (root.value) observer.observe(root.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div ref="root" class="reveal-block" :class="{ 'reveal-block--visible': visible }">
    <slot />
  </div>
</template>

<style scoped>
.reveal-block {
  min-width: 0;
  opacity: 0;
  transform: translateY(1.8rem) scale(0.97) rotate(0.35deg);
  transition:
    opacity 620ms var(--ease-spring),
    transform 760ms var(--ease-spring-bold);
}

.reveal-block--visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

@media (prefers-reduced-motion: reduce) {
  .reveal-block {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useId } from 'vue'
import { useMotion } from '@/composables/useMotion'
const { motionAllowed } = useMotion()
const root = ref<HTMLElement>()
const visible = ref(false)
const open = ref(false)
const gaze = ref(0)
const id = useId()
let observer: IntersectionObserver | undefined
function look(event: PointerEvent) {
  if (event.pointerType !== 'mouse' || !motionAllowed.value) return
  const box = (event.currentTarget as HTMLElement).getBoundingClientRect()
  gaze.value = Math.max(-2, Math.min(2, ((event.clientX - box.left) / box.width - 0.5) * 4))
}
// 眨眼只在可见且允许动态时运行；正文、原头像与点击目标都不参与变形。
onMounted(() => {
  observer = new IntersectionObserver(([entry]) => {
    visible.value = !!entry?.isIntersecting
  })
  if (root.value) observer.observe(root.value)
})
onBeforeUnmount(() => observer?.disconnect())
</script>
<template>
  <div ref="root" class="cloud-guide" :class="{ 'cloud-guide--awake': motionAllowed && visible }">
    <button
      type="button"
      class="cloud-guide__button"
      :aria-expanded="open"
      :aria-controls="id"
      aria-label="和云团小向导打招呼"
      @pointermove="look"
      @pointerleave="gaze = 0"
      @click="open = !open"
    >
      <svg viewBox="0 0 112 80" aria-hidden="true">
        <path d="M24 68C3 70-2 40 17 35C11 9 44 3 55 21C76 0 99 18 94 39C116 42 113 68 93 69Z" />
        <g :style="{ transform: 'translateX(' + (motionAllowed ? gaze : 0) + 'px)' }">
          <g class="cloud-guide__eyes"><path d="M40 39v6M70 39v6" /></g>
        </g>
        <path class="cloud-guide__smile" :d="open ? 'M47 51Q55 65 64 51Z' : 'M48 52Q56 60 64 52'" />
        <ellipse cx="29" cy="51" rx="7" ry="3" />
        <ellipse cx="81" cy="51" rx="7" ry="3" /></svg
      ><span>云团带路</span>
    </button>
    <div v-if="open" :id="id" class="cloud-guide__reply">
      <p>把好奇心交给一张小纸签吧。</p>
      <a class="text-link" href="#discovery" @click="open = false">去抽一张真实的灵感签 →</a>
    </div>
  </div>
</template>
<style scoped>
.cloud-guide {
  margin-top: 1.25rem;
  max-width: 26rem;
}
.cloud-guide__button {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.2rem 0.65rem 0.2rem 0;
  border: 0;
  background: none;
  border-radius: var(--radius-medium);
  color: var(--color-link);
  font-size: var(--text-sm);
}
.cloud-guide__button svg {
  width: 70px;
  height: 50px;
  overflow: visible;
}
.cloud-guide__button svg > path:first-child {
  fill: var(--color-surface);
  stroke: rgb(var(--tone-blue));
  stroke-width: 2;
  filter: drop-shadow(0 3px 0 rgb(var(--tone-blue) / 0.45));
}
.cloud-guide__eyes path,
.cloud-guide__smile {
  fill: none;
  stroke: var(--color-link);
  stroke-width: 2.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.cloud-guide__button ellipse {
  fill: rgb(var(--tone-rose));
}
.cloud-guide__eyes {
  transform-origin: 55px 42px;
}
.cloud-guide--awake .cloud-guide__eyes {
  animation: cloud-blink 8s linear infinite;
}
.cloud-guide__reply {
  margin-top: 0.5rem;
  padding: 0.8rem 1rem;
  background: rgb(var(--tone-blue) / 0.18);
  border: 1px solid var(--color-rim);
  border-radius: var(--radius-medium);
  font-size: var(--text-sm);
}
.cloud-guide__reply a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
}
@keyframes cloud-blink {
  0%,
  95%,
  100% {
    transform: scaleY(1);
  }
  97% {
    transform: scaleY(0.12);
  }
}
</style>

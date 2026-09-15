<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useMotion } from '@/composables/useMotion'
import { useAppearance } from '@/composables/useAppearance'
const { motionAllowed, preference } = useMotion(),
  { pointerFeedback } = useAppearance()
const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
const pulse = ref<{ x: number; y: number; id: number }>()
const portal = ref<string | HTMLElement>('body')
let down: { x: number; y: number; target: Element } | undefined,
  timer: ReturnType<typeof setTimeout> | undefined,
  sequence = 0
function target(event: PointerEvent) {
  if (
    event.pointerType !== 'mouse' ||
    !fine.matches ||
    !motionAllowed.value ||
    !pointerFeedback.value ||
    event.button !== 0
  )
    return
  const element = event.target instanceof Element ? event.target : undefined
  return element
}
function start(event: PointerEvent) {
  const control = target(event)
  down = control ? { x: event.clientX, y: event.clientY, target: control } : undefined
}
function release(event: PointerEvent) {
  const control = target(event),
    previous = down
  down = undefined
  if (
    !control ||
    !previous ||
    control !== previous.target ||
    Math.hypot(event.clientX - previous.x, event.clientY - previous.y) > 7 ||
    window.getSelection()?.toString()
  )
    return
  portal.value = control.closest<HTMLDialogElement>('dialog[open]') ?? 'body'
  pulse.value = { x: event.clientX, y: event.clientY, id: ++sequence }
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => (pulse.value = undefined), 430)
}
function clear() {
  pulse.value = undefined
  down = undefined
  if (timer) clearTimeout(timer)
}
watch([motionAllowed, pointerFeedback], clear)
// 全站鼠标点击显示一个有界局部光点，包括空白、阅读与输入区；不拦截事件或替换系统光标。
// 拖拽/选中文字不触发；切后台、静止、关闭增强时立即清理。
onMounted(() => {
  document.addEventListener('pointerdown', start, true)
  document.addEventListener('pointerup', release, true)
  document.addEventListener('pointercancel', clear, true)
  window.addEventListener('blur', clear)
})
onBeforeUnmount(() => {
  clear()
  document.removeEventListener('pointerdown', start, true)
  document.removeEventListener('pointerup', release, true)
  document.removeEventListener('pointercancel', clear, true)
  window.removeEventListener('blur', clear)
})
</script>
<template>
  <Teleport :to="portal"
    ><span
      v-if="pulse"
      :key="pulse.id"
      class="pointer-bloom"
      :class="{ 'pointer-bloom--gentle': preference === 'gentle' }"
      :style="{ left: pulse.x + 'px', top: pulse.y + 'px' }"
      aria-hidden="true"
      ><i></i><i></i><i></i></span
  ></Teleport>
</template>
<style scoped>
.pointer-bloom {
  position: fixed;
  z-index: 70;
  width: 0;
  height: 0;
  pointer-events: none;
}
.pointer-bloom::before {
  content: '';
  position: absolute;
  width: 24px;
  height: 24px;
  left: -12px;
  top: -12px;
  border: 1.5px solid var(--color-link);
  border-radius: 50%;
  animation: pointer-ring 430ms ease-out;
}
.pointer-bloom i {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-link);
  animation: pointer-drop 430ms ease-out;
  --dx: 15px;
  --dy: -14px;
}
.pointer-bloom i:nth-child(2) {
  --dx: -16px;
  --dy: -7px;
  background: var(--color-blue);
}
.pointer-bloom i:nth-child(3) {
  --dx: 8px;
  --dy: 17px;
  background: var(--color-secondary);
}
.pointer-bloom--gentle i {
  display: none;
}
@keyframes pointer-ring {
  from {
    opacity: 0.6;
    transform: scale(0.5);
  }
  to {
    opacity: 0;
    transform: scale(1.5);
  }
}
@keyframes pointer-drop {
  0% {
    opacity: 0.8;
    transform: translate(0, 0) scale(0.6);
  }
  70% {
    opacity: 0.4;
  }
  100% {
    opacity: 0;
    transform: translate(var(--dx), var(--dy)) scale(0.4);
  }
}
</style>

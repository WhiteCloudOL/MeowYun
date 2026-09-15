<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch, useId, nextTick } from 'vue'
import { useRoute } from 'vue-router'
const props = defineProps<{ label: string; iconOnly?: boolean }>()
const id = useId()
const root = ref<HTMLElement>()
const trigger = ref<HTMLButtonElement>()
const open = ref(false)
const panel = ref<HTMLElement>()
const position = ref({ left: '0px', top: '0px', maxHeight: '70dvh' })
function place() {
  if (!open.value || !trigger.value || !panel.value) return
  const anchor = trigger.value.getBoundingClientRect(),
    width = panel.value.offsetWidth
  const left = Math.max(8, Math.min(innerWidth - width - 8, anchor.right - width))
  const below = innerHeight - anchor.bottom - 18
  const top =
    below >= 180 ? anchor.bottom + 10 : Math.max(8, anchor.top - panel.value.offsetHeight - 10)
  const origin = root.value?.getBoundingClientRect() ?? { left: 0, top: 0 }
  position.value = {
    left: left - origin.left + 'px',
    top: top - origin.top + 'px',
    maxHeight: Math.max(100, innerHeight - top - 8) + 'px',
  }
}
// 浮层仍在触发器的 DOM 顺序中；按触发器容器定位并夹紧视口边界，避免阅读设置在窄屏向左溢出。
watch(open, async (value) => {
  if (value) {
    await nextTick()
    place()
  }
})

const route = useRoute()
function close(restore = true) {
  open.value = false
  if (restore) trigger.value?.focus()
}
function outside(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) close(false)
}
function keydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) {
    event.stopPropagation()
    close()
  }
}
function toggle() {
  if (!open.value) document.dispatchEvent(new CustomEvent('meowyun:popover', { detail: id }))
  open.value = !open.value
}
function other(event: Event) {
  if ((event as CustomEvent<string>).detail !== id) close(false)
}
// 普通浮层不冒充应用菜单或困住焦点；关闭与路由切换释放状态。
watch(
  () => route.fullPath,
  () => close(false),
)
onMounted(() => {
  window.addEventListener('resize', place)
  window.addEventListener('scroll', place, true)
  document.addEventListener('pointerdown', outside)
  document.addEventListener('keydown', keydown)
  document.addEventListener('meowyun:popover', other)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', place)
  window.removeEventListener('scroll', place, true)
  document.removeEventListener('pointerdown', outside)
  document.removeEventListener('keydown', keydown)
  document.removeEventListener('meowyun:popover', other)
})
</script>
<template>
  <div ref="root" class="popover">
    <button
      ref="trigger"
      type="button"
      :class="iconOnly ? 'icon-button' : 'popover-trigger'"
      :aria-label="props.label"
      :aria-expanded="open"
      :aria-controls="id"
      @click="toggle"
    >
      <slot name="trigger" />
    </button>
    <Transition name="popover"
      ><div v-if="open" :id="id" ref="panel" :style="position" class="popover-panel">
        <slot :close="close" /></div
    ></Transition>
  </div>
</template>
<style scoped>
.popover {
  position: relative;
}
.popover-trigger {
  transform: none;
  rotate: none;
  transition:
    background 160ms ease,
    color 160ms ease;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: var(--tap-size);
  min-width: var(--tap-size);
  justify-content: center;
  padding: 0.5rem 0.7rem;
  border: 0;
  border-radius: var(--radius-round);
  background: transparent;
  font-size: var(--text-sm);
}
.popover-trigger[aria-expanded='true'],
.popover-trigger:hover {
  background: var(--color-primary-soft);
}
.popover-panel {
  position: absolute;
  overflow-y: auto;
  z-index: var(--z-popover);
  width: max-content;
  min-width: 11rem;
  max-width: min(21rem, calc(100vw - 2rem));
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 24px 29px 25px 27px;
  background: linear-gradient(150deg, var(--color-surface-raised), var(--color-background-soft));
  box-shadow: var(--shadow-popover);
}
.popover-panel :deep(a),
.popover-panel :deep(button) {
  transform: none;
  rotate: none;
  animation: none;
  transition:
    background 160ms ease,
    color 160ms ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  min-height: var(--tap-size);
  padding: 0.5rem 0.75rem;
  border: 0;
  border-radius: var(--radius-small);
  background: transparent;
  text-align: left;
  font-size: var(--text-sm);
}
.popover-panel :deep(a:hover),
.popover-panel :deep(button:hover),
.popover-panel :deep([aria-pressed='true']) {
  background: var(--color-primary-soft);
}
</style>

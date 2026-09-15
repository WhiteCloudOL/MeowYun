<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useClipboard } from '@/composables/useClipboard'
import { useMotion } from '@/composables/useMotion'
import IconGlyph from '@/components/ui/IconGlyph.vue'
const props = defineProps<{ title: string }>()
const { message, manualText, copy } = useClipboard()
const { quietEffective } = useMotion()
const progress = ref(0)
const canShare = ref(false)
const shareMessage = ref('')
const scrolled = ref(false)
let frame = 0
let start = 0
let distance = 1
let observer: ResizeObserver | undefined
function update() {
  frame = 0
  scrolled.value = window.scrollY > 500
  progress.value = Math.min(
    100,
    Math.max(0, Math.round(((window.scrollY - start) / distance) * 100)),
  )
}
function schedule() {
  if (!frame) frame = requestAnimationFrame(update)
}
function measure() {
  const element = document.querySelector('.article-body')
  if (element) {
    start = element.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.25
    distance = Math.max(1, element.scrollHeight - window.innerHeight * 0.5)
  }
  schedule()
}
async function share() {
  try {
    await navigator.share({ title: props.title, url: window.location.href })
    shareMessage.value = ''
  } catch (error) {
    shareMessage.value =
      error instanceof Error && error.name === 'AbortError'
        ? ''
        : '系统分享暂不可用，可以复制链接。'
  }
}
function copyLink() {
  void copy(window.location.href)
}
function top() {
  window.scrollTo({ top: 0, behavior: quietEffective.value ? 'auto' : 'smooth' })
}
// 阅读进度只在滚动帧更新数值，几何尺寸由 ResizeObserver 维护；卸载释放全部监听。
onMounted(() => {
  canShare.value = typeof navigator.share === 'function'
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', measure)
  observer = new ResizeObserver(measure)
  const element = document.querySelector('.article-body')
  if (element) observer.observe(element)
  measure()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', schedule)
  window.removeEventListener('resize', measure)
  observer?.disconnect()
  if (frame) cancelAnimationFrame(frame)
})
</script>
<template>
  <div
    class="reading-progress"
    role="progressbar"
    aria-label="阅读进度"
    :aria-valuenow="progress"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <span :style="{ transform: 'scaleX(' + progress / 100 + ')' }"></span>
  </div>
  <aside class="reading-tools" aria-label="阅读工具">
    <div v-if="message || shareMessage || manualText" class="reading-feedback">
      <p role="status">{{ message || shareMessage }}</p>
      <input
        v-if="manualText"
        :value="manualText"
        readonly
        aria-label="手动复制文章链接"
        @focus="($event.target as HTMLInputElement).select()"
      />
    </div>
    <button type="button" @click="copyLink">
      <IconGlyph name="link" :size="17" /><span>复制链接</span></button
    ><button v-if="canShare" type="button" @click="share">
      <IconGlyph name="share-2" :size="17" /><span>分享</span></button
    ><button v-if="scrolled" type="button" @click="top">
      <IconGlyph name="arrow-down" class="up-arrow" :size="17" /><span>顶部</span>
    </button>
  </aside>
</template>
<style scoped>
.reading-progress {
  position: fixed;
  z-index: 50;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  pointer-events: none;
}
.reading-progress span {
  display: block;
  height: 100%;
  background: var(--color-link);
  transform-origin: left;
}
.reading-tools {
  position: fixed;
  z-index: 25;
  right: var(--page-padding);
  bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
  display: flex;
  gap: 0.25rem;
  max-width: calc(100% - 2rem);
  padding: 0.35rem;
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-round);
  box-shadow: var(--shadow-card);
}
.reading-tools button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: var(--tap-size);
  padding: 0.5rem 0.8rem;
  border: 0;
  border-radius: var(--radius-round);
  background: transparent;
  font-size: var(--text-sm);
}
.reading-tools button:hover {
  background: var(--color-primary-soft);
}
.up-arrow {
  transform: rotate(180deg);
}
.reading-feedback {
  position: absolute;
  bottom: calc(100% + 0.5rem);
  right: 0;
  padding: 0.75rem;
  width: min(22rem, calc(100vw - 2rem));
  font-size: var(--text-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-small);
  background: var(--color-surface-raised);
}
.reading-feedback input {
  width: 100%;
  min-height: var(--tap-size);
  margin-top: 0.5rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 0.3rem;
  padding: 0.5rem;
}
@media (max-width: 760px) {
  .reading-tools {
    position: relative;
    right: auto;
    bottom: auto;
    width: fit-content;
    max-width: 100%;
    margin-block: 1.5rem;
    flex-wrap: wrap;
  }
}
</style>

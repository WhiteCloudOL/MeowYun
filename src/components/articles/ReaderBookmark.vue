<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { usePocket } from '@/composables/usePocket'
import { useReadingPreferences } from '@/composables/useReadingPreferences'
import SaveButton from '@/components/content/SaveButton.vue'
import BasePopover from '@/components/ui/BasePopover.vue'
const props = defineProps<{ articleId: string }>()
const { data, toggleLater, rememberReading } = usePocket()
const { settings, setFontSize, setLineHeight, reset } = useReadingPreferences()
const later = computed(() => data.value.later.includes(props.articleId))
const saved = data.value.reading.find((r) => r.id === props.articleId)?.progress ?? 0
const offer = ref(false)
let dismissed = false
let body: HTMLElement | null = null,
  range = 0,
  top = 0,
  last = -1,
  intent = false,
  timer: ReturnType<typeof setTimeout> | undefined,
  observer: ResizeObserver | undefined
function measure() {
  if (!body) return
  const header = document.querySelector('.app-header')
  const clearance = (header?.getBoundingClientRect().bottom ?? 88) + 16
  top = body.getBoundingClientRect().top + scrollY - clearance
  range = body.scrollHeight - Math.max(1, innerHeight - clearance)
  offer.value = !dismissed && saved > 0.03 && range > 80 && !location.hash
}
function mark(event: Event) {
  if (
    event instanceof KeyboardEvent &&
    (!['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key) ||
      (event.target as HTMLElement)?.closest('input,textarea,button,[contenteditable]'))
  )
    return
  intent = true
}
function dismiss() {
  dismissed = true
  offer.value = false
}
function flush() {
  if (last >= 0) rememberReading(props.articleId, last)
}
function scroll() {
  if (!intent || range <= 80) return
  last = Math.max(0, Math.min(1, (scrollY - top) / range))
  if (timer) clearTimeout(timer)
  timer = setTimeout(flush, 700)
}
function resume() {
  window.scrollTo({ top: Math.max(0, top + range * saved), behavior: 'auto' })
  dismiss()
  intent = true
}
function hide() {
  if (document.visibilityState === 'hidden') flush()
}
// 初始导航与锚点滚动不覆盖上次位置；只有发生真实浏览操作后才延迟保存。短文不制造进度。
onMounted(() => {
  body = document.querySelector('.article-body')
  if (body) {
    observer = new ResizeObserver(measure)
    observer.observe(body)
  }
  measure()
  window.addEventListener('scroll', scroll, { passive: true })
  window.addEventListener('wheel', mark, { passive: true })
  window.addEventListener('touchstart', mark, { passive: true })
  window.addEventListener('keydown', mark)
  window.addEventListener('resize', measure)
  window.addEventListener('pagehide', flush)
  document.addEventListener('visibilitychange', hide)
})
onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
  flush()
  observer?.disconnect()
  window.removeEventListener('scroll', scroll)
  window.removeEventListener('wheel', mark)
  window.removeEventListener('touchstart', mark)
  window.removeEventListener('keydown', mark)
  window.removeEventListener('resize', measure)
  window.removeEventListener('pagehide', flush)
  document.removeEventListener('visibilitychange', hide)
})
</script>
<template>
  <div class="reader-bookmark">
    <div class="reader-controls">
      <SaveButton :id="articleId" /><button
        type="button"
        class="chip"
        :aria-pressed="later"
        @click="toggleLater(articleId)"
      >
        {{ later ? '已放入稍后读' : '留着稍后读' }}</button
      ><BasePopover label="阅读设置"
        ><template #trigger>Aa · 阅读设置</template
        ><template #default
          ><div class="reader-options">
            <p>字号</p>
            <button
              v-for="size in [16, 18, 20, 22]"
              :key="size"
              type="button"
              :aria-pressed="settings.fontSize === size"
              @click="setFontSize(size)"
            >
              {{ size }}px
            </button>
            <p>行距</p>
            <button
              v-for="height in [1.7, 1.9, 2.1]"
              :key="height"
              type="button"
              :aria-pressed="settings.lineHeight === height"
              @click="setLineHeight(height)"
            >
              {{ height }}</button
            ><button type="button" @click="reset">恢复默认阅读设置</button>
          </div></template
        ></BasePopover
      >
    </div>
    <div v-if="offer" class="resume-note">
      <p>上次浏览到约 {{ Math.round(saved * 100) }}%。接着看看？</p>
      <button type="button" class="text-link" @click="resume">继续上次的位置 →</button
      ><button type="button" class="text-link" @click="dismiss">从这里开始</button>
    </div>
  </div>
</template>
<style scoped>
.reader-bookmark {
  margin-top: 1.5rem;
}
.reader-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
}
.reader-options {
  font-size: var(--text-sm);
}
.reader-options p {
  padding: 0.5rem 0.75rem;
  color: var(--color-text-muted);
}
.resume-note {
  margin-top: 1rem;
  padding: 1rem 1.2rem;
  border-left: 4px solid var(--color-primary);
  background: var(--color-blue-soft);
  font-size: var(--text-sm);
  border-radius: 0 12px 12px 0;
}
.resume-note button {
  margin-right: 1rem;
}
.reader-options :deep([aria-pressed='true']) {
  background: var(--color-primary-soft);
  font-weight: 700;
}
</style>

import { computed, ref, watch } from 'vue'
import { readPreference, writePreference } from '@/utils/preferences'
const media = window.matchMedia('(prefers-reduced-motion: reduce)')
const quiet = ref(readPreference('meowyun-quiet') === 'true')
const reduced = ref(media.matches)
const visible = ref(document.visibilityState === 'visible')
const quietEffective = computed(() => quiet.value || reduced.value)
const motionAllowed = computed(() => !quietEffective.value && visible.value)
function onChange(event: MediaQueryListEvent) {
  reduced.value = event.matches
}
function onVisibility() {
  visible.value = document.visibilityState === 'visible'
}
// 系统偏好实时生效且优先于站内偏好；全局单例在 HMR 时释放监听器。
media.addEventListener('change', onChange)
document.addEventListener('visibilitychange', onVisibility)
const stop = watch(
  quietEffective,
  (value) => {
    document.documentElement.dataset.quiet = String(value)
  },
  { immediate: true },
)
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    stop()
    media.removeEventListener('change', onChange)
    document.removeEventListener('visibilitychange', onVisibility)
  })
export function useMotion() {
  return {
    quiet,
    reduced,
    quietEffective,
    motionAllowed,
    toggleQuiet: () => {
      quiet.value = !quiet.value
      writePreference('meowyun-quiet', String(quiet.value))
    },
  }
}

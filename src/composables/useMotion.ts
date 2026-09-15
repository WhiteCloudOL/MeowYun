import { computed, ref, watch } from 'vue'
import { readPreference, writePreference } from '@/utils/preferences'
export type MotionPreference = 'full' | 'gentle' | 'off'
const media = window.matchMedia('(prefers-reduced-motion: reduce)')
const stored = readPreference('meowyun-motion')
// 新偏好缺省时保留用户已有安静模式；主题与收藏的旧键不迁移、不清空。
const preference = ref<MotionPreference>(
  stored === 'full' || stored === 'gentle' || stored === 'off'
    ? stored
    : readPreference('meowyun-quiet') === 'true'
      ? 'off'
      : 'full',
)
const reduced = ref(media.matches)
const visible = ref(document.visibilityState === 'visible')
const quiet = computed(() => preference.value === 'off')
const quietEffective = computed(() => quiet.value || reduced.value)
const motionAllowed = computed(() => !quietEffective.value && visible.value)
function onChange(event: MediaQueryListEvent) {
  reduced.value = event.matches
}
function onVisibility() {
  visible.value = document.visibilityState === 'visible'
}
function setMotion(value: MotionPreference) {
  preference.value = value
  writePreference('meowyun-motion', value)
  writePreference('meowyun-quiet', String(value === 'off'))
}
media.addEventListener('change', onChange)
document.addEventListener('visibilitychange', onVisibility)
// 单例同步所有动效入口，系统 reduce 优先；后台暂停不改变用户持久化选择。
const stop = watch(
  [quietEffective, preference, visible],
  () => {
    document.documentElement.dataset.quiet = String(quietEffective.value)
    document.documentElement.dataset.motion = quietEffective.value ? 'off' : preference.value
    document.documentElement.dataset.paused = String(!visible.value)
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
    preference,
    setMotion,
    toggleQuiet: () => setMotion(quiet.value ? 'full' : 'off'),
  }
}

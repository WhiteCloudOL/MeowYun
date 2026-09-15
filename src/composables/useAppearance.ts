import { ref, watch } from 'vue'
import { readPreference, writePreference } from '@/utils/preferences'
export type Atmosphere = 'cream' | 'sky' | 'mint'
const stored = readPreference('meowyun-atmosphere')
const atmosphere = ref<Atmosphere>(stored === 'sky' || stored === 'mint' ? stored : 'cream')
const pointerFeedback = ref(readPreference('meowyun-pointer-feedback') !== 'false')
const scenery = ref(readPreference('meowyun-scenery') !== 'false')
const guide = ref(readPreference('meowyun-guide') !== 'false')
const stop = watch(
  [atmosphere, scenery],
  ([value, showScenery]) => {
    document.documentElement.dataset.atmosphere = value
    document.documentElement.dataset.scenery = String(showScenery)
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        'content',
        getComputedStyle(document.documentElement).getPropertyValue('--color-background').trim(),
      )
  },
  { immediate: true },
)
// 预设只调整氛围 token，不改文字对比度和用户明暗偏好；单例监听在 HMR 时释放。
if (import.meta.hot) import.meta.hot.dispose(stop)
export function useAppearance() {
  return {
    atmosphere,
    pointerFeedback,
    scenery,
    guide,
    setScenery: (value: boolean) => {
      scenery.value = value
      writePreference('meowyun-scenery', String(value))
    },
    setGuide: (value: boolean) => {
      guide.value = value
      writePreference('meowyun-guide', String(value))
    },
    setAtmosphere: (value: Atmosphere) => {
      atmosphere.value = value
      writePreference('meowyun-atmosphere', value)
    },
    setPointerFeedback: (value: boolean) => {
      pointerFeedback.value = value
      writePreference('meowyun-pointer-feedback', String(value))
    },
  }
}

import { computed, ref } from 'vue'
import { readPreference, writePreference } from '@/utils/preferences'
export type Theme = 'light' | 'dark'
export type ThemePreference = Theme | 'system'
const storageKey = 'meowyun-theme'
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
const stored = readPreference(storageKey)
const preference = ref<ThemePreference>(stored === 'light' || stored === 'dark' ? stored : 'system')
const systemTheme = ref<Theme>(mediaQuery.matches ? 'dark' : 'light')
const theme = computed<Theme>(() =>
  preference.value === 'system' ? systemTheme.value : preference.value,
)
function syncDocumentTheme() {
  document.documentElement.dataset.theme = theme.value
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme.value === 'dark' ? '#1f1b25' : '#fbf7f5')
}
function applyThemePreference(value: ThemePreference) {
  preference.value = value
  writePreference(storageKey, value)
  syncDocumentTheme()
}
function onSystemChange(event: MediaQueryListEvent) {
  systemTheme.value = event.matches ? 'dark' : 'light'
  syncDocumentTheme()
}
// 全局单例仅注册一次；HMR 替换时清理，避免开发环境累积监听器。
mediaQuery.addEventListener('change', onSystemChange)
if (import.meta.hot)
  import.meta.hot.dispose(() => mediaQuery.removeEventListener('change', onSystemChange))
syncDocumentTheme()
export function useTheme() {
  return { theme, preference, isDark: computed(() => theme.value === 'dark'), applyThemePreference }
}

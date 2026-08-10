import { computed, ref } from 'vue'

export type Theme = 'light' | 'dark'
export type ThemePreference = Theme | 'system'

const storageKey = 'meowyun-theme'
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
const storedPreference = localStorage.getItem(storageKey)
const initialPreference: ThemePreference =
  storedPreference === 'light' || storedPreference === 'dark' || storedPreference === 'system'
    ? storedPreference
    : 'system'

const preference = ref<ThemePreference>(initialPreference)
const systemTheme = ref<Theme>(mediaQuery.matches ? 'dark' : 'light')
const theme = computed<Theme>(() =>
  preference.value === 'system' ? systemTheme.value : preference.value,
)

function syncDocumentTheme() {
  document.documentElement.dataset.theme = theme.value
}

function applyThemePreference(nextPreference: ThemePreference) {
  preference.value = nextPreference
  localStorage.setItem(storageKey, nextPreference)
  syncDocumentTheme()
}

// 系统主题变化时只影响“跟随系统”，不会覆盖用户明确选择的主题。
mediaQuery.addEventListener('change', (event) => {
  systemTheme.value = event.matches ? 'dark' : 'light'
  syncDocumentTheme()
})

syncDocumentTheme()

export function useTheme() {
  return {
    theme,
    preference,
    isDark: computed(() => theme.value === 'dark'),
    applyThemePreference,
  }
}

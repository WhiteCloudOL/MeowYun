import { computed, ref } from 'vue'

export type Theme = 'light' | 'dark'

const storedTheme = localStorage.getItem('meowyun-theme') as Theme | null
const theme = ref<Theme>(storedTheme ?? 'dark')

function applyTheme(nextTheme: Theme, persist = true) {
  theme.value = nextTheme
  document.documentElement.dataset.theme = nextTheme
  if (persist) localStorage.setItem('meowyun-theme', nextTheme)
}

function toggleTheme() {
  applyTheme(theme.value === 'dark' ? 'light' : 'dark')
}

applyTheme(theme.value, false)

export function useTheme() {
  return {
    theme,
    isDark: computed(() => theme.value === 'dark'),
    applyTheme,
    toggleTheme,
  }
}

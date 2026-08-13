<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import { useTheme, type ThemePreference } from '@/composables/useTheme'
import type { SiteIcon } from '@/types/icon'

const selector = ref<HTMLDetailsElement>()
const { preference, applyThemePreference } = useTheme()
const options: Array<{ value: ThemePreference; label: string; icon: SiteIcon }> = [
  { value: 'system', label: '跟随系统', icon: 'monitor' },
  { value: 'light', label: '浅色', icon: 'sun' },
  { value: 'dark', label: '深色', icon: 'moon' },
]
const fallbackOption = { value: 'system', label: '跟随系统', icon: 'monitor' } as const
const currentOption = computed(
  () => options.find((option) => option.value === preference.value) ?? fallbackOption,
)
let hoverCloseTimer: ReturnType<typeof setTimeout> | undefined

function selectTheme(nextPreference: ThemePreference) {
  applyThemePreference(nextPreference)
  selector.value?.removeAttribute('open')
}

function setHoverOpen(open: boolean) {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || !selector.value) return

  if (hoverCloseTimer) clearTimeout(hoverCloseTimer)
  if (open) {
    selector.value.open = true
    return
  }

  hoverCloseTimer = setTimeout(() => {
    if (selector.value) selector.value.open = false
  }, 220)
}

onBeforeUnmount(() => {
  if (hoverCloseTimer) clearTimeout(hoverCloseTimer)
})
</script>

<template>
  <details
    ref="selector"
    class="theme-selector"
    @mouseenter="setHoverOpen(true)"
    @mouseleave="setHoverOpen(false)"
  >
    <summary :aria-label="`主题设置：${currentOption.label}`" title="主题设置">
      <IconGlyph :name="currentOption.icon" :size="18" />
    </summary>
    <div class="theme-selector__menu" role="group" aria-label="选择主题">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        :class="{ 'is-active': preference === option.value }"
        :aria-pressed="preference === option.value"
        @click="selectTheme(option.value)"
      >
        <IconGlyph :name="option.icon" :size="16" />
        {{ option.label }}
      </button>
    </div>
  </details>
</template>

<style scoped>
.theme-selector {
  position: relative;
}

.theme-selector[open]::after {
  position: absolute;
  top: 100%;
  right: 0;
  width: 9.5rem;
  height: 0.7rem;
  content: '';
}

.theme-selector summary {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border: 1px solid var(--anime-border);
  border-radius: 50%;
  background: var(--anime-glass);
  color: var(--anime-text-soft);
  cursor: pointer;
  list-style: none;
  backdrop-filter: blur(0.8rem);
  transition:
    transform var(--transition-press),
    border-color var(--transition-fast),
    color var(--transition-fast);
}

.theme-selector summary::-webkit-details-marker {
  display: none;
}

.theme-selector summary:active {
  transform: scale(0.94);
}

.theme-selector[open] summary {
  border-color: color-mix(in srgb, var(--site-accent) 45%, var(--anime-border));
  background: var(--color-primary-soft);
  color: var(--anime-text);
  transform: rotate(8deg);
}

.theme-selector__menu {
  position: absolute;
  top: calc(100% + 0.65rem);
  right: 0;
  z-index: 30;
  display: grid;
  width: 9.5rem;
  gap: 0.25rem;
  padding: 0.4rem;
  border: 1px solid var(--anime-border-bright);
  border-radius: 0.95rem;
  background: var(--anime-popover);
  box-shadow: var(--shadow-popover);
  backdrop-filter: blur(1.25rem);
  animation: theme-menu-pop 220ms cubic-bezier(0.2, 0.9, 0.25, 1.2);
}

@keyframes theme-menu-pop {
  from {
    opacity: 0;
    transform: translateY(-0.4rem) scale(0.92) rotate(1deg);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1) rotate(0);
  }
}

.theme-selector__menu button {
  display: flex;
  min-height: 2.5rem;
  align-items: center;
  gap: 0.65rem;
  padding-inline: 0.75rem;
  border: 0;
  border-radius: 0.7rem;
  background: transparent;
  color: var(--anime-text-soft);
  cursor: pointer;
  font: inherit;
  font-size: var(--text-sm);
  text-align: left;
}

.theme-selector__menu button.is-active {
  background: color-mix(in srgb, var(--site-accent) 16%, transparent);
  color: var(--anime-text);
  font-weight: 700;
}

@media (hover: hover) {
  .theme-selector summary:hover {
    border-color: var(--anime-border-bright);
    color: var(--anime-text);
  }

  .theme-selector__menu button:hover {
    background: color-mix(in srgb, var(--site-accent) 11%, transparent);
  }
}

@media (prefers-reduced-motion: reduce) {
  .theme-selector__menu {
    animation: none;
  }
}

.theme-selector summary {
  border: 3px solid #4a3b32;
  border-radius: 0.95rem;
  background: #ffd6e3;
  box-shadow: 0 4px 0 #4a3b32;
  color: #2b2d42;
  backdrop-filter: none;
  transition:
    box-shadow 300ms cubic-bezier(0.34, 1.56, 0.64, 1),
    transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.theme-selector summary:active {
  box-shadow: none;
  transform: translateY(4px);
}

.theme-selector[open] summary {
  border-color: #4a3b32;
  background: #fdfd96;
  color: #2b2d42;
  transform: rotate(4deg);
}

.theme-selector__menu {
  border: 3px solid #4a3b32;
  border-radius: 1.1rem;
  background: #fffdf9;
  box-shadow: 6px 7px 0 #ff9ebb;
  backdrop-filter: none;
  animation: theme-menu-pop 360ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.theme-selector__menu button {
  border: 2px solid transparent;
  color: #6b584e;
  font-family: ui-rounded, 'Hiragino Maru Gothic ProN', 'Microsoft YaHei UI', sans-serif;
  font-weight: 850;
  transition:
    background-color 220ms ease,
    transform 360ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.theme-selector__menu button.is-active {
  border-color: #4a3b32;
  background: #ccefd1;
  color: #2b2d42;
}

@media (hover: hover) {
  .theme-selector summary:hover {
    border-color: #4a3b32;
    box-shadow: 0 6px 0 #4a3b32;
    color: #2b2d42;
    transform: translateY(-0.15rem) rotate(-2deg);
  }

  .theme-selector__menu button:hover {
    border-color: #4a3b32;
    background: #fff3b5;
    color: #2b2d42;
    transform: translateX(0.15rem);
  }
}
</style>

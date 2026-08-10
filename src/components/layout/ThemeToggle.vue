<script setup lang="ts">
import { computed, ref } from 'vue'
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

function selectTheme(nextPreference: ThemePreference) {
  applyThemePreference(nextPreference)
  selector.value?.removeAttribute('open')
}
</script>

<template>
  <details ref="selector" class="theme-selector">
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
</style>

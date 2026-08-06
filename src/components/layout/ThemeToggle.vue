<script setup lang="ts">
import BaseIconButton from '@/components/ui/BaseIconButton.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import { useTheme } from '@/composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <BaseIconButton
    :label="isDark ? '切换到浅色模式' : '切换到深色模式'"
    :pressed="isDark"
    @click="toggleTheme"
  >
    <span class="theme-toggle__icon" aria-hidden="true">
      <IconGlyph :name="isDark ? 'moon' : 'sun'" :size="18" />
    </span>
  </BaseIconButton>
</template>

<style scoped>
.theme-toggle__icon {
  display: block;
  line-height: 1;
  transition: transform var(--transition-normal);
}

button:active .theme-toggle__icon {
  transform: scale(0.9);
}
</style>

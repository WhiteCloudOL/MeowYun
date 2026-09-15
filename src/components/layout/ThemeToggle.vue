<script setup lang="ts">
import IconGlyph from '@/components/ui/IconGlyph.vue'
import BasePopover from '@/components/ui/BasePopover.vue'
import { useTheme, type ThemePreference } from '@/composables/useTheme'
import { useMotion } from '@/composables/useMotion'
import type { SiteIcon } from '@/types/icon'
const { preference, applyThemePreference } = useTheme()
const { quiet, reduced, toggleQuiet } = useMotion()
const options: Array<{ value: ThemePreference; label: string; icon: SiteIcon }> = [
  { value: 'system', label: '跟随系统', icon: 'monitor' },
  { value: 'light', label: '浅色', icon: 'sun' },
  { value: 'dark', label: '深色', icon: 'moon' },
]
function selectTheme(value: ThemePreference, close: () => void) {
  applyThemePreference(value)
  close()
}
</script>
<template>
  <BasePopover label="外观与动态设置" icon-only>
    <template #trigger
      ><IconGlyph
        :name="preference === 'dark' ? 'moon' : preference === 'light' ? 'sun' : 'monitor'"
    /></template>
    <template #default="{ close }">
      <div role="group" aria-label="选择主题">
        <button
          v-for="option in options"
          :key="option.value"
          type="button"
          :aria-pressed="preference === option.value"
          @click="selectTheme(option.value, close)"
        >
          <IconGlyph :name="option.icon" />{{ option.label }}
        </button>
      </div>
      <div class="motion-preference">
        <button type="button" :aria-pressed="quiet" @click="toggleQuiet">
          <IconGlyph name="feather" />安静模式<span>{{ quiet ? '已开启' : '未开启' }}</span>
        </button>
        <p v-if="reduced">系统已要求减少动态效果。</p>
        <p v-else>阅读时自动停止装饰动画。</p>
      </div>
    </template>
  </BasePopover>
</template>
<style scoped>
.motion-preference {
  border-top: 1px solid var(--color-border-soft);
  margin-top: 0.4rem;
  padding-top: 0.4rem;
}
.motion-preference span,
.motion-preference p {
  color: var(--color-text-secondary);
  font-size: var(--text-xs);
}
.motion-preference p {
  max-width: 17rem;
  padding: 0.4rem 0.75rem;
}
</style>

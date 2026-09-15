<script setup lang="ts">
import IconGlyph from '@/components/ui/IconGlyph.vue'
import BasePopover from '@/components/ui/BasePopover.vue'
import { useTheme, type ThemePreference } from '@/composables/useTheme'
import { useMotion } from '@/composables/useMotion'
import { useAppearance } from '@/composables/useAppearance'
import type { SiteIcon } from '@/types/icon'
const { preference, applyThemePreference } = useTheme()
const {
  atmosphere,
  pointerFeedback,
  scenery,
  guide,
  setAtmosphere,
  setPointerFeedback,
  setScenery,
  setGuide,
} = useAppearance()
const atmospheres = [
  { value: 'cream' as const, label: '奶霜粉', colors: ['rose', 'blue', 'mint'] },
  { value: 'sky' as const, label: '晴空蓝', colors: ['blue', 'lilac', 'rose'] },
  { value: 'mint' as const, label: '薄荷云', colors: ['mint', 'blue', 'rose'] },
]
const { preference: motion, reduced, setMotion } = useMotion()
const motionOptions = [
  { value: 'full' as const, label: '灵动' },
  { value: 'gentle' as const, label: '轻柔' },
  { value: 'off' as const, label: '静止' },
]
const options: Array<{ value: ThemePreference; label: string; icon: SiteIcon }> = [
  { value: 'system', label: '跟随系统', icon: 'monitor' },
  { value: 'light', label: '浅色', icon: 'sun' },
  { value: 'dark', label: '深色', icon: 'moon' },
]
function resetAppearance() {
  applyThemePreference('system')
  setMotion('full')
  setAtmosphere('cream')
  setPointerFeedback(true)
  setScenery(true)
  setGuide(true)
}
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
      <div class="atmosphere-preference" role="group" aria-label="选择奶霜氛围">
        <p>氛围配色</p>
        <button
          v-for="option in atmospheres"
          :key="option.value"
          type="button"
          :aria-pressed="atmosphere === option.value"
          @click="setAtmosphere(option.value)"
        >
          <span class="atmosphere-swatches" aria-hidden="true"
            ><i
              v-for="color in option.colors"
              :key="color"
              :style="{ background: 'rgb(var(--tone-' + color + '))' }"
            ></i></span
          >{{ option.label }}
        </button>
      </div>
      <div class="motion-preference">
        <p>小屋装饰</p>
        <button type="button" role="switch" :aria-checked="scenery" @click="setScenery(!scenery)">
          <IconGlyph name="cloud" />云层与星光：{{ scenery ? '开' : '关' }}
        </button>
        <button type="button" role="switch" :aria-checked="guide" @click="setGuide(!guide)">
          <IconGlyph name="sparkles" />云团小向导：{{ guide ? '开' : '关' }}
        </button>
        <p>动效强度</p>
        <button
          v-for="option in motionOptions"
          :key="option.value"
          type="button"
          :aria-pressed="motion === option.value"
          @click="setMotion(option.value)"
        >
          <IconGlyph name="feather" />{{ option.label }}
        </button>
        <button
          type="button"
          role="switch"
          :aria-checked="pointerFeedback"
          @click="setPointerFeedback(!pointerFeedback)"
        >
          <IconGlyph :name="pointerFeedback ? 'sparkles' : 'feather'" />{{
            pointerFeedback ? '鼠标点击微光：开' : '鼠标点击微光：关'
          }}
        </button>
        <p v-if="reduced">系统已要求减少动态效果。</p>
        <p v-else>静止只停运动，保留造型与颜色。</p>
      </div>
      <button type="button" @click="resetAppearance">恢复默认外观</button>
    </template>
  </BasePopover>
</template>
<style scoped>
.atmosphere-preference {
  border-top: 1px solid var(--color-border-soft);
  margin-top: 0.4rem;
  padding-top: 0.4rem;
}
.atmosphere-preference > p {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  padding: 0.4rem 0.75rem;
}
.atmosphere-swatches {
  display: flex;
  gap: 3px;
}
.atmosphere-swatches i {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid var(--color-rim);
}
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

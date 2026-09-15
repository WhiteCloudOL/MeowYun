<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { RouterLink } from 'vue-router'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'quiet'
    to?: string
    href?: string
    target?: '_blank' | '_self'
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    variant: 'primary',
    to: undefined,
    href: undefined,
    target: undefined,
    disabled: false,
    type: 'button',
  },
)

const attrs = useAttrs()
// 禁用时不创建带 href 的节点，避免 RouterLink 先处理点击或中键仍打开目标。
const component = computed(() =>
  props.disabled ? 'button' : props.to ? RouterLink : props.href ? 'a' : 'button',
)
</script>

<template>
  <component
    :is="component"
    v-bind="attrs"
    class="base-button"
    :class="`base-button--${variant}`"
    :to="!disabled ? to : undefined"
    :href="!disabled ? href : undefined"
    :target="target"
    :rel="target === '_blank' ? 'noopener noreferrer' : undefined"
    :type="component === 'button' ? type : undefined"
    :disabled="component === 'button' ? disabled : undefined"
    :aria-disabled="disabled || undefined"
  >
    <slot />
  </component>
</template>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: var(--tap-size);
  padding: 0.65rem 1.2rem;
  border: 1px solid transparent;
  border-radius: var(--radius-round);
  font-size: var(--text-sm);
  font-weight: 600;
  line-height: 1.4;
  text-align: center;
  transition:
    transform var(--transition-press),
    background var(--transition-fast),
    box-shadow var(--transition-fast);
}
.base-button--primary {
  background: var(--color-primary);
  color: var(--color-on-primary);
  box-shadow: 0 3px 0 color-mix(in srgb, var(--color-link) 30%, transparent);
}
.base-button--secondary {
  background: var(--color-surface);
  border-color: var(--color-border);
}
.base-button--quiet {
  background: transparent;
  color: var(--color-link);
}
.base-button:not(:disabled):hover {
  background: var(--color-primary-soft);
  color: var(--color-text);
}
.base-button--primary:not(:disabled):hover {
  background: var(--color-primary-hover);
  color: var(--color-on-primary);
}
.base-button:not(:disabled):active {
  transform: translateY(2px);
  box-shadow: none;
}
.base-button[aria-disabled='true'] {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>

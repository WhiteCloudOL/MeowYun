<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { RouterLink } from 'vue-router'
import { useJellyPress } from '@/composables/useJellyPress'
const { releasing, release } = useJellyPress()

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
// RouterLink 自己生成 href；传入空 href 会覆盖链接语义，导致文本光标和 Tab 不可达。
const bindings = computed(() =>
  props.disabled
    ? { type: props.type, disabled: true }
    : props.to
      ? { to: props.to }
      : props.href
        ? { href: props.href }
        : { type: props.type },
)
// 禁用时不创建带 href 的节点，避免 RouterLink 先处理点击或中键仍打开目标。
const component = computed(() =>
  props.disabled ? 'button' : props.to ? RouterLink : props.href ? 'a' : 'button',
)
</script>

<template>
  <component
    :is="component"
    v-bind="{ ...attrs, ...bindings }"
    class="base-button soft-button"
    :class="['soft-button--' + variant, { 'is-releasing': releasing }]"
    :target="target"
    :rel="target === '_blank' ? 'noopener noreferrer' : undefined"
    :aria-disabled="disabled || undefined"
    @pointerup="!disabled && release()"
    @keyup.enter="!disabled && release()"
    @keyup.space="!disabled && release()"
  >
    <slot />
  </component>
</template>

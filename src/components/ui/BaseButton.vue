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
const component = computed(() => (props.to ? RouterLink : props.href ? 'a' : 'button'))

function preventDisabled(event: Event) {
  if (props.disabled) event.preventDefault()
}
</script>

<template>
  <component
    :is="component"
    v-bind="attrs"
    class="base-button"
    :class="`base-button--${variant}`"
    :to="to"
    :href="href"
    :target="target"
    :rel="target === '_blank' ? 'noopener noreferrer' : undefined"
    :type="component === 'button' ? type : undefined"
    :disabled="component === 'button' ? disabled : undefined"
    :aria-disabled="disabled || undefined"
    @click="preventDisabled"
  >
    <slot />
  </component>
</template>

<style scoped>
.base-button {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: 0.7rem 1.1rem;
  border: 1px solid transparent;
  border-radius: var(--radius-round);
  cursor: pointer;
  font-size: var(--text-sm);
  font-weight: 700;
  line-height: 1.2;
  transition:
    transform var(--transition-press),
    box-shadow var(--transition-fast),
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast);
}

.base-button--primary {
  background: linear-gradient(135deg, var(--color-primary), #d986c7);
  box-shadow: 0 0.5rem 1.2rem rgb(217 95 147 / 24%);
  color: #ffffff;
}

.base-button--secondary {
  border-color: var(--color-border);
  background: var(--color-surface-raised);
  color: var(--color-text);
}

.base-button--quiet {
  background: transparent;
  color: var(--color-text-secondary);
}

.base-button:active {
  transform: scale(0.97);
}

.base-button[aria-disabled='true'] {
  cursor: not-allowed;
  opacity: 0.5;
  pointer-events: none;
}

@media (hover: hover) {
  .base-button--primary:hover {
    box-shadow: 0 0.65rem 1.5rem rgb(217 95 147 / 32%);
    transform: translateY(-0.14rem) rotate(-0.5deg);
  }

  .base-button--secondary:hover,
  .base-button--quiet:hover {
    background: var(--color-primary-soft);
    color: var(--color-text);
  }
}
</style>

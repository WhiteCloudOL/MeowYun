<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { RouterLink } from 'vue-router'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import type { SiteIcon } from '@/types/icon'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    to?: string
    href?: string
    target?: '_blank' | '_self'
    icon?: SiteIcon
    tone?: 'pink' | 'blue' | 'mint' | 'yellow'
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    to: undefined,
    href: undefined,
    target: undefined,
    icon: 'sparkles',
    tone: 'pink',
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
    class="jelly-button spring-interaction inline-flex min-h-11 items-center justify-center rounded-full font-bold"
    :data-tone="tone"
    :to="to"
    :href="href"
    :target="target"
    :rel="target === '_blank' ? 'noopener noreferrer' : undefined"
    :type="component === 'button' ? type : undefined"
    :disabled="component === 'button' ? disabled : undefined"
    :aria-disabled="disabled || undefined"
    @click="preventDisabled"
  >
    <span class="jelly-button__icon" aria-hidden="true">
      <IconGlyph :name="icon" :size="17" />
    </span>
    <span><slot /></span>
  </component>
</template>

<style scoped>
.jelly-button {
  gap: 0.55rem;
  padding: 0.68rem 1.05rem 0.68rem 0.72rem;
  border: 1px solid rgb(255 255 255 / 62%);
  background: linear-gradient(135deg, #ff9fc6, #c7a7ed);
  box-shadow:
    inset 0 2px 3px rgb(255 255 255 / 48%),
    0 0.45rem 0 color-mix(in srgb, #d26198 52%, transparent),
    0 0.8rem 1.4rem rgb(104 65 96 / 18%);
  color: #ffffff;
  cursor: pointer;
  letter-spacing: 0.01em;
  transform-origin: center bottom;
  transition:
    transform 420ms var(--ease-spring-bold),
    box-shadow 420ms var(--ease-spring),
    filter 300ms var(--ease-spring);
}

.jelly-button[data-tone='blue'] {
  background: linear-gradient(135deg, #8fd4f2, #9eacf3);
  box-shadow:
    inset 0 2px 3px rgb(255 255 255 / 48%),
    0 0.45rem 0 rgb(91 143 194 / 46%),
    0 0.8rem 1.4rem rgb(65 87 122 / 18%);
}

.jelly-button[data-tone='mint'] {
  background: linear-gradient(135deg, #91e6c8, #83cfdd);
  box-shadow:
    inset 0 2px 3px rgb(255 255 255 / 48%),
    0 0.45rem 0 rgb(72 160 143 / 42%),
    0 0.8rem 1.4rem rgb(48 102 95 / 16%);
}

.jelly-button[data-tone='yellow'] {
  background: linear-gradient(135deg, #ffe796, #ffb9ba);
  box-shadow:
    inset 0 2px 3px rgb(255 255 255 / 55%),
    0 0.45rem 0 rgb(211 143 125 / 42%),
    0 0.8rem 1.4rem rgb(104 73 60 / 15%);
  color: #5d4758;
}

.jelly-button__icon {
  display: grid;
  width: 1.85rem;
  height: 1.85rem;
  place-items: center;
  border-radius: 50%;
  background: rgb(255 255 255 / 26%);
  transition: transform 420ms var(--ease-spring-bold);
}

.jelly-button:active {
  box-shadow:
    inset 0 2px 4px rgb(91 42 72 / 20%),
    0 0.15rem 0 color-mix(in srgb, #d26198 42%, transparent);
  transform: translateY(0.28rem) scaleX(0.93) scaleY(0.88);
}

.jelly-button[aria-disabled='true'] {
  cursor: not-allowed;
  filter: grayscale(0.25);
  opacity: 0.55;
  pointer-events: none;
}

@media (hover: hover) {
  .jelly-button:hover {
    filter: saturate(1.08) brightness(1.03);
    transform: translateY(-0.16rem) scale(1.025);
  }

  .jelly-button:hover .jelly-button__icon {
    transform: rotate(-10deg) scale(1.12);
  }
}

@media (prefers-reduced-motion: reduce) {
  .jelly-button,
  .jelly-button__icon {
    transition: none;
  }
}
</style>

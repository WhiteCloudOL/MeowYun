<script setup lang="ts">
import { ref, useId } from 'vue'
import IconGlyph from './IconGlyph.vue'

defineProps<{ label: string; name: string; placeholder: string }>()
const value = defineModel<string>({ required: true })
const emit = defineEmits<{
  input: [event: Event]
  compositionstart: [event: CompositionEvent]
  compositionend: [event: CompositionEvent]
  clear: []
}>()
const id = useId()
const input = ref<HTMLInputElement>()
function focus() {
  input.value?.focus()
}
function clear() {
  value.value = ''
  emit('clear')
  focus()
}
defineExpose({ input, focus })
</script>
<template>
  <div class="search-field">
    <IconGlyph name="search" /><label :for="id" class="sr-only">{{ label }}</label>
    <input
      :id="id"
      ref="input"
      v-model="value"
      type="search"
      :name="name"
      :placeholder="placeholder"
      autocomplete="off"
      @input="emit('input', $event)"
      @compositionstart="emit('compositionstart', $event)"
      @compositionend="emit('compositionend', $event)"
    />
    <button
      v-if="value"
      type="button"
      class="search-clear icon-button"
      aria-label="清空搜索框"
      @click="clear"
    >
      <IconGlyph name="x" :size="18" />
    </button>
  </div>
</template>
<style scoped>
.search-clear {
  flex-shrink: 0;
  border-color: transparent;
  background: transparent;
  color: var(--color-text-secondary);
}
.search-clear:hover {
  color: var(--color-link);
  background: var(--color-primary-soft);
}
</style>

<script setup lang="ts">
import { usePocket } from '@/composables/usePocket'
import IconGlyph from '@/components/ui/IconGlyph.vue'
defineProps<{ id: string; compact?: boolean }>()
const { isFavorite, toggleFavorite } = usePocket()
</script>
<template>
  <button
    type="button"
    class="save-button"
    :class="{ 'is-saved': isFavorite(id), compact }"
    :aria-pressed="isFavorite(id)"
    :aria-label="isFavorite(id) ? '移出口袋' : '收藏进口袋'"
    @click="toggleFavorite(id)"
  >
    <IconGlyph name="heart" :size="18" /><span v-if="!compact">{{
      isFavorite(id) ? '在口袋里' : '放进口袋'
    }}</span>
  </button>
</template>
<style scoped>
.save-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-height: 44px;
  min-width: 44px;
  padding: 0.45rem 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-round);
  background: var(--color-surface-glass);
  box-shadow: inset 0 2px 2px var(--color-rim);
  color: var(--color-link);
  font-size: var(--text-sm);
  transition:
    background 180ms,
    transform 180ms;
}
.save-button:hover {
  background: var(--color-primary-soft);
}
.save-button:active {
  transform: translateY(2px);
}
.save-button.is-saved {
  background: var(--color-primary-soft);
  border-color: var(--color-link);
}
.is-saved svg {
  fill: var(--color-primary);
  animation: pocket-drop 430ms var(--ease-spring);
}
.compact {
  padding: 0.45rem;
}
@keyframes pocket-drop {
  0% {
    transform: scale(0.8);
  }
  48% {
    transform: scale(1.18);
  }
  100% {
    transform: none;
  }
}
</style>

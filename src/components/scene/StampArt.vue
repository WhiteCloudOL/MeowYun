<script setup lang="ts">
import { stampCatalog, type StampId } from '@/utils/pocketData'
import { computed } from 'vue'
import { stampPaths } from '@/utils/stampPaths'
const props = defineProps<{ id: StampId; locked?: boolean }>()
const stamp = computed(() => stampCatalog.find((s) => s.id === props.id)!)
</script>
<template>
  <div class="stamp-art" :class="{ locked }">
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <circle
        cx="60"
        cy="60"
        r="53"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-dasharray="4 3"
      />
      <circle cx="60" cy="60" r="45" fill="none" stroke="currentColor" stroke-width="1.5" />
      <path
        :d="stampPaths[id]"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path d="M38 85h44" stroke="currentColor" stroke-width="2" /></svg
    ><span>{{ stamp.label }}</span>
  </div>
</template>
<style scoped>
.stamp-art {
  position: relative;
  width: 7rem;
  color: var(--color-link);
  transform: rotate(-8deg);
  text-align: center;
}
.stamp-art svg {
  width: 100%;
}
.stamp-art span {
  display: block;
  font-size: 11px;
  font-weight: 700;
  margin-top: -1.8rem;
  position: relative;
}
.stamp-art.locked {
  opacity: 0.35;
  filter: grayscale(1);
}
</style>

<script setup lang="ts">
import { ref, watch } from 'vue'
import IconGlyph from './IconGlyph.vue'
import type { SiteIcon } from '@/types/icon'
const props = withDefaults(
  defineProps<{
    src?: string
    alt: string
    icon?: SiteIcon
    loading?: 'lazy' | 'eager'
    fit?: 'cover' | 'contain'
    position?: string
  }>(),
  { icon: 'cloud', loading: 'lazy', fit: 'cover' },
)
const failed = ref(false)
watch(
  () => props.src,
  () => {
    failed.value = false
  },
)
</script>
<template>
  <span class="image-fallback" :class="{ 'image-fallback--empty': !src || failed }">
    <img
      v-if="src && !failed"
      :src="src"
      :alt="alt"
      :loading="loading"
      :style="{ objectFit: fit, objectPosition: position }"
      @error="failed = true"
    />
    <span v-else class="image-fallback__placeholder" role="img" :aria-label="alt"
      ><IconGlyph :name="icon" :size="36"
    /></span>
  </span>
</template>
<style scoped>
.image-fallback {
  display: block;
  min-width: 0;
  overflow: hidden;
}
.image-fallback img {
  width: 100%;
  height: 100%;
}
.image-fallback--empty {
  background: var(--color-accent-soft);
  color: var(--color-link);
}
.image-fallback__placeholder {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  min-height: 3rem;
}
</style>

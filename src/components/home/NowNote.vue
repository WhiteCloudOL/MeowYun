<script setup lang="ts">
import { siteConfig } from '@/config/site'
</script>
<template>
  <aside v-if="siteConfig.nowNote?.date && siteConfig.nowNote.text" class="now-note">
    <p class="eyebrow">
      近况 · <time :datetime="siteConfig.nowNote.date">{{ siteConfig.nowNote.date }}</time>
    </p>
    <p>{{ siteConfig.nowNote.text }}</p>
    <a v-if="siteConfig.nowNote.href" class="text-link" :href="siteConfig.nowNote.href">{{
      siteConfig.nowNote.linkLabel || '相关记录'
    }}</a>
  </aside>
</template>
<style scoped>
.now-note {
  padding: 1.5rem;
  border-left: 3px solid var(--color-primary);
  background: var(--color-surface);
  border-radius: 0 var(--radius-medium) var(--radius-medium) 0;
  margin-bottom: 2rem;
}
</style>

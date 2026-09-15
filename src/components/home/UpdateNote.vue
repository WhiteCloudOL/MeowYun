<script setup lang="ts">
import { siteConfig } from '@/config/site'
import { siteUpdates } from '@/config/updates'
const updates = (siteConfig.updates ?? siteUpdates).slice(0, 2)
</script>
<template>
  <aside v-if="updates.length" class="update-notes" aria-label="站点更新小记">
    <h2>手账更新</h2>
    <p v-for="item in updates" :key="item.date + item.text">
      <time :datetime="item.date">{{ item.date }}</time
      >{{ item.text
      }}<a v-if="'href' in item && item.href" class="text-link" :href="item.href">查看</a>
    </p>
  </aside>
</template>
<style scoped>
.update-notes {
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}
.update-notes h2 {
  font-size: var(--text-sm);
  margin-bottom: 0.5rem;
}
.update-notes time {
  font-family: var(--font-mono);
  margin-right: 0.75rem;
}
</style>

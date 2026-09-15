<script setup lang="ts">
import { computed } from 'vue'
import { siteConfig } from '@/config/site'
import EmptyState from '@/components/ui/EmptyState.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
const props = defineProps<{ destination: string; label: string; delaySeconds: number }>()
// 中转目标只来自启用的站点配置；不读取 query URL，不自动跳走，访客可立即选择继续或取消。
const destination = computed(() =>
  siteConfig.redirects.find((x) => x.enabled && x.to === props.destination),
)
const hostname = computed(() => {
  try {
    return new URL(destination.value?.to ?? '').hostname
  } catch {
    return ''
  }
})
const description = computed(
  () =>
    siteConfig.sections.navigation.items.find((x) => x.href === props.destination)?.description ??
    '即将访问配置中的外部站点。',
)
</script>
<template>
  <div class="page-shell page-content">
    <EmptyState
      icon="external-link"
      label="外部站点"
      :title="destination ? '前往' + label : '这个入口暂不可用'"
      :description="description"
      ><div class="redirect-actions">
        <p v-if="hostname" class="destination-host">{{ hostname }}</p>
        <p class="muted">页面会留在这里，直到你选择继续。</p>
        <div>
          <BaseButton v-if="destination" :href="destination.to">立即访问</BaseButton
          ><BaseButton to="/navigation" variant="secondary">取消，回到导航</BaseButton>
        </div>
      </div></EmptyState
    >
  </div>
</template>
<style scoped>
.redirect-actions {
  display: grid;
  gap: 1.5rem;
  min-width: 0;
}
.redirect-actions > div {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}
.destination-host {
  font-family: var(--font-mono);
  overflow-wrap: anywhere;
  padding: 0.75rem;
  background: var(--color-background-soft);
  border-radius: var(--radius-small);
}
.redirect-actions .muted {
  font-size: var(--text-sm);
}
</style>

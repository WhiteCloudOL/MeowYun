<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
const route = useRoute()
const visible = ref(false)
const panel = ref<HTMLElement>()
const editing = computed(() => route.name === 'postcard')
let previousFocus: HTMLElement | null = null
function failed() {
  previousFocus = document.activeElement as HTMLElement | null
  visible.value = true
}
function close() {
  visible.value = false
  previousFocus?.focus()
}
function reload() {
  // 编辑页不提供刷新捷径，保留当前画布与本地位图，用户可先回去导出。
  // 不清理任何本地存储，不自动刷新，避免旧分块缓存导致无限刷新或草稿丢失。
  if (!editing.value) window.location.reload()
}
onMounted(() => window.addEventListener('vite:preloadError', failed))
onBeforeUnmount(() => window.removeEventListener('vite:preloadError', failed))
</script>
<template>
  <aside v-if="visible" ref="panel" class="load-recovery" role="alert" aria-label="页面加载失败">
    <h2>这个页面暂时没能打开</h2>
    <p>可能是网络中断，或网站刚刚更新。当前页面仍然保留。</p>
    <p v-if="editing">明信片仍可继续编辑。请先返回画布导出 PNG；刷新会丢失尚未导出的编辑内容。</p>
    <div>
      <BaseButton v-if="!editing" @click="reload">重新加载当前页面</BaseButton>
      <BaseButton variant="secondary" @click="close">{{
        editing ? '返回画布，先导出' : '暂时留在这里'
      }}</BaseButton>
    </div>
  </aside>
</template>
<style scoped>
.load-recovery {
  position: fixed;
  z-index: var(--z-dialog);
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  width: min(32rem, calc(100% - 2rem));
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-large);
  background: var(--color-surface);
  box-shadow: var(--shadow-popover);
}
.load-recovery h2 {
  font-size: var(--text-lg);
}
.load-recovery p {
  margin-top: 0.7rem;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}
.load-recovery > div {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}
</style>

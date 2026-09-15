<script setup lang="ts">
import { usePocket } from '@/composables/usePocket'
import StampArt from '@/components/scene/StampArt.vue'
const { announcement, newStamp, warning } = usePocket()
</script>
<template>
  <div class="sr-only" role="status">{{ announcement }}</div>
  <Transition name="stamp-pop"
    ><aside v-if="newStamp" class="stamp-notice" role="status">
      <StampArt :id="newStamp" />
      <div>
        <strong>护照上，多了一枚印章</strong>
        <p>只记录在这个浏览器里。</p>
        <RouterLink to="/pocket" class="text-link">打开我的口袋 →</RouterLink>
      </div>
      <button
        type="button"
        class="icon-button"
        aria-label="关闭印章提示"
        @click="newStamp = undefined"
      >
        ×
      </button>
    </aside></Transition
  >
  <p v-if="warning" class="storage-warning" role="status">{{ warning }}</p>
</template>
<style scoped>
.stamp-notice {
  position: fixed;
  z-index: 55;
  right: 1.25rem;
  bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  width: min(27rem, calc(100% - 2rem));
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-jelly);
  background: var(--color-surface);
  box-shadow: var(--shadow-popover);
  font-size: var(--text-sm);
}
.stamp-notice :deep(.stamp-art) {
  flex-shrink: 0;
  width: 5rem;
}
.stamp-notice p {
  color: var(--color-text-muted);
  font-size: var(--text-xs);
}
.stamp-pop-enter-active {
  animation: stamp-arrive 450ms both;
}
.stamp-pop-leave-active {
  transition: opacity 160ms;
}
.stamp-pop-leave-to {
  opacity: 0;
}
.storage-warning {
  position: fixed;
  bottom: 0.5rem;
  left: 1rem;
  right: 1rem;
  z-index: 56;
  padding: 0.65rem 1rem;
  background: var(--color-surface);
  border: 2px solid var(--color-error);
  border-radius: 12px;
  font-size: var(--text-sm);
}
@keyframes stamp-arrive {
  0% {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  65% {
    opacity: 1;
    transform: scale(0.98);
  }
  100% {
    transform: none;
  }
}
</style>

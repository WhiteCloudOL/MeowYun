<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
</script>

<template>
  <div class="not-found page-shell">
    <BaseCard class="not-found__card" :hoverable="false">
      <p class="eyebrow">Error 404</p>
      <p class="not-found__number" aria-hidden="true">404</p>
      <h1>这片云里没有页面</h1>
      <p>地址可能写错了，或者页面已经搬到了别处。</p>
      <BaseButton to="/"><IconGlyph name="home" :size="16" /> 回到首页</BaseButton>
    </BaseCard>
  </div>
</template>

<style scoped>
.not-found {
  display: grid;
  min-height: calc(100vh - var(--header-height) - 8rem);
  place-items: center;
  padding-top: var(--space-8);
}

.not-found__card {
  display: grid;
  width: min(100%, 38rem);
  justify-items: center;
  gap: var(--space-4);
  text-align: center;
}

.not-found__number {
  background: var(--gradient-ribbon);
  background-clip: text;
  color: transparent;
  font-size: clamp(5rem, 18vw, 9rem);
  font-weight: 850;
  letter-spacing: -0.08em;
  line-height: 1;
}

.not-found h1 {
  font-size: var(--text-2xl);
  letter-spacing: -0.04em;
}

.not-found p:not(.eyebrow, .not-found__number) {
  color: var(--color-text-secondary);
}
</style>

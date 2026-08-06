<script setup lang="ts">
import HomeDashboard from '@/components/home/HomeDashboard.vue'
import ProfileHero from '@/components/home/ProfileHero.vue'
import QuickLinksGrid from '@/components/home/QuickLinksGrid.vue'
import RevealBlock from '@/components/ui/RevealBlock.vue'
</script>

<template>
  <div class="home-view page-shell">
    <ProfileHero />

    <div id="home-content" class="home-view__content">
      <RevealBlock><QuickLinksGrid /></RevealBlock>
      <RevealBlock><HomeDashboard /></RevealBlock>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  display: grid;
}

.home-view__content {
  display: grid;
  gap: clamp(var(--space-12), 8vw, 6rem);
  padding-block: var(--space-8) var(--space-16);
  scroll-margin-top: 6rem;
}
</style>

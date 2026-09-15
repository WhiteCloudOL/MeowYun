<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import QuickSearch from '@/components/layout/QuickSearch.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import PointerFeedback from '@/components/layout/PointerFeedback.vue'
import SkyBackdrop from '@/components/scene/SkyBackdrop.vue'
import PocketNotice from '@/components/layout/PocketNotice.vue'
import LoadRecovery from '@/components/layout/LoadRecovery.vue'
import { siteConfig } from '@/config/site'
import { useTheme } from '@/composables/useTheme'
useTheme()
const route = useRoute()
const isReading = computed(() => route.name === 'article')
function requestSearch() {
  document.dispatchEvent(new Event('meowyun:search'))
}
</script>
<template>
  <div class="app-layout" :class="{ 'reading-page': isReading }">
    <a class="skip-link" href="#main-content">跳到主要内容</a><SkyBackdrop /><AppHeader
      @search="requestSearch"
    />
    <main id="main-content" tabindex="-1">
      <RouterView v-slot="{ Component, route: currentRoute }"
        ><component
          :is="Component"
          :key="
            currentRoute.name === 'articles-tag'
              ? 'articles'
              : String(currentRoute.name) +
                (currentRoute.name === 'article' ? currentRoute.params.slug : '')
          "
      /></RouterView>
    </main>
    <AppFooter v-if="siteConfig.footer.enabled" /><QuickSearch /><PocketNotice /><LoadRecovery /><PointerFeedback />
  </div>
</template>
<style scoped>
.app-layout {
  position: relative;
  min-height: 100vh;
  isolation: isolate;
}
.reading-page {
  padding-bottom: calc(5rem + env(safe-area-inset-bottom, 0px));
}
#main-content {
  padding-top: var(--header-clearance);
  min-height: 70vh;
}
</style>

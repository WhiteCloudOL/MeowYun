<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import QuickSearch from '@/components/layout/QuickSearch.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import ImmersiveBackground from '@/components/layout/ImmersiveBackground.vue'
import { siteConfig } from '@/config/site'
import { useTheme } from '@/composables/useTheme'
const route = useRoute()
const { isDark } = useTheme()
const isHome = computed(() => route.name === 'home')
const isReading = computed(() => route.name === 'article')
const pageBackground = computed(() => ({
  ...siteConfig.appearance.globalBackground,
  ...(!isDark.value ? siteConfig.appearance.lightBackground : undefined),
  ...(isHome.value
    ? siteConfig.appearance.homeBackground
    : route.name === 'friends'
      ? siteConfig.appearance.friendsBackground
      : siteConfig.appearance.contentBackground),
  ...(isReading.value
    ? isDark.value
      ? siteConfig.appearance.readingBackground
      : siteConfig.appearance.lightReadingBackground
    : undefined),
}))
function requestSearch() {
  document.dispatchEvent(new Event('meowyun:search'))
}
</script>
<template>
  <div class="app-layout" :class="{ 'reading-page': isReading }">
    <a class="skip-link" href="#main-content">跳到主要内容</a
    ><ImmersiveBackground
      :config="pageBackground"
      :cinematic="isHome"
      :reading="isReading"
    /><AppHeader @search="requestSearch" />
    <main id="main-content" tabindex="-1">
      <RouterView v-slot="{ Component, route: currentRoute }"
        ><Transition name="page-fade" mode="out-in"
          ><component
            :is="Component"
            :key="
              currentRoute.name === 'articles-tag'
                ? 'articles'
                : String(currentRoute.name) +
                  (currentRoute.name === 'article' ? currentRoute.params.slug : '')
            " /></Transition
      ></RouterView>
    </main>
    <AppFooter v-if="siteConfig.footer.enabled" /><QuickSearch />
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

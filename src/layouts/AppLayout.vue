<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppFooter from '@/components/layout/AppFooter.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import ImmersiveBackground from '@/components/layout/ImmersiveBackground.vue'
import { siteConfig } from '@/config/site'
import type { PageBackground } from '@/config/schema'
import { useTheme } from '@/composables/useTheme'

const route = useRoute()
const { isDark } = useTheme()

const pageBackground = computed(() => {
  const globalBackground = siteConfig.appearance.globalBackground
  let pageOverride = siteConfig.appearance.contentBackground

  if (route.name === 'friends') pageOverride = siteConfig.appearance.friendsBackground
  if (route.name === 'home') pageOverride = siteConfig.appearance.homeBackground

  return {
    ...globalBackground,
    ...pageOverride,
    ...(!isDark.value ? siteConfig.appearance.lightBackground : undefined),
  } satisfies PageBackground
})

const pageBackgroundKey = computed(
  () => `${String(route.name ?? route.path)}-${isDark.value ? 'dark' : 'light'}`,
)

const appStyle = computed(() => ({
  '--site-accent': siteConfig.appearance.accent,
  '--site-glass-opacity': isDark.value
    ? siteConfig.appearance.glassOpacity
    : siteConfig.appearance.lightGlassOpacity,
}))
</script>

<template>
  <div class="app-layout" :style="appStyle">
    <a class="skip-link" href="#main-content">跳到主要内容</a>
    <Transition name="background-shift">
      <ImmersiveBackground :key="pageBackgroundKey" :config="pageBackground" />
    </Transition>
    <AppHeader />

    <main id="main-content">
      <RouterView v-slot="{ Component, route: currentRoute }">
        <Transition :name="String(currentRoute.meta.transition ?? 'page-fade')" mode="out-in">
          <component :is="Component" :key="currentRoute.path" />
        </Transition>
      </RouterView>
    </main>

    <AppFooter v-if="siteConfig.footer.enabled" />
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  color: var(--anime-text);
  isolation: isolate;
}

#main-content {
  position: relative;
  z-index: 1;
  min-height: 65vh;
  perspective: 80rem;
}
</style>

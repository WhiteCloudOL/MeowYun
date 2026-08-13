<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppFooter from '@/components/layout/AppFooter.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import ImmersiveBackground from '@/components/layout/ImmersiveBackground.vue'
import SakuraFall from '@/components/layout/SakuraFall.vue'
import { siteConfig } from '@/config/site'
import type { PageBackground } from '@/config/schema'
import { useTheme } from '@/composables/useTheme'

const route = useRoute()
const { isDark } = useTheme()
const isHome = computed(() => route.name === 'home')

const pageBackground = computed(() => {
  const globalBackground = siteConfig.appearance.globalBackground
  let pageOverride = siteConfig.appearance.contentBackground

  if (route.name === 'friends') pageOverride = siteConfig.appearance.friendsBackground
  if (route.name === 'home') pageOverride = siteConfig.appearance.homeBackground
  // 文章详情自动关闭装饰动画并压低背景，保证长文阅读时的对比度。
  if (route.name === 'article') pageOverride = siteConfig.appearance.readingBackground

  return {
    ...globalBackground,
    ...pageOverride,
    ...(!isDark.value ? siteConfig.appearance.lightBackground : undefined),
    ...(route.name === 'article'
      ? isDark.value
        ? siteConfig.appearance.readingBackground
        : siteConfig.appearance.lightReadingBackground
      : undefined),
  } satisfies PageBackground
})

const pageBackgroundKey = computed(
  () => `${String(route.name ?? route.path)}-${isDark.value ? 'dark' : 'light'}`,
)

const appStyle = computed(() => ({
  '--site-accent': siteConfig.appearance.accent,
  '--site-glass-opacity':
    route.name === 'article'
      ? isDark.value
        ? Math.max(siteConfig.appearance.glassOpacity, 0.72)
        : Math.max(siteConfig.appearance.lightGlassOpacity, 0.94)
      : isDark.value
        ? siteConfig.appearance.glassOpacity
        : siteConfig.appearance.lightGlassOpacity,
}))
</script>

<template>
  <div class="app-layout" :class="{ 'app-layout--home': isHome }" :style="appStyle">
    <a class="skip-link" href="#main-content">跳到主要内容</a>
    <Transition name="background-shift">
      <ImmersiveBackground
        :key="pageBackgroundKey"
        :config="pageBackground"
        :cinematic="isHome"
      />
    </Transition>
    <SakuraFall v-if="siteConfig.appearance.sakuraEffect" />
    <AppHeader />

    <main id="main-content">
      <RouterView v-slot="{ Component, route: currentRoute }">
        <Transition :name="String(currentRoute.meta.transition ?? 'page-fade')" mode="out-in">
          <component :is="Component" :key="currentRoute.path" />
        </Transition>
      </RouterView>
    </main>

    <AppFooter v-if="siteConfig.footer.enabled && !isHome" />
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

.app-layout--home,
.app-layout--home #main-content {
  height: 100dvh;
  min-height: 32rem;
  overflow: hidden;
}
</style>

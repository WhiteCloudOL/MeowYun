<script setup lang="ts">
import { vTooltip } from '@/utils/tooltip'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { siteConfig } from '@/config/site'
import ConfigIcon from '@/components/ui/ConfigIcon.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import BasePopover from '@/components/ui/BasePopover.vue'
import ImageFallback from '@/components/ui/ImageFallback.vue'
import ThemeToggle from './ThemeToggle.vue'
const emit = defineEmits<{ search: [] }>()
const route = useRoute()
const root = ref<HTMLElement>()
const menuButton = ref<HTMLButtonElement>()
const mobileOpen = ref(false)
const mobilePanelId = 'primary-navigation'
const navigation = siteConfig.navigation.filter((x) => x.enabled && x.to)
const contacts = computed(() => {
  const entries = siteConfig.navigation.filter((x) => x.enabled).flatMap((x) => x.children ?? [])
  const email = siteConfig.profile.socials.find((x) => x.enabled && x.href.startsWith('mailto:'))
  if (email && !entries.some((x) => x.href === email.href)) entries.push(email)
  return entries
})
function purpose(id: string) {
  return id === 'email'
    ? '发邮件'
    : id === 'github'
      ? '看项目'
      : id.includes('qq')
        ? '加入群聊'
        : '关注动态'
}
function active(to = '') {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}
function close(restore = false) {
  mobileOpen.value = false
  if (restore) menuButton.value?.focus()
}
function toggleMobile() {
  if (!mobileOpen.value)
    document.dispatchEvent(new CustomEvent('meowyun:popover', { detail: mobilePanelId }))
  mobileOpen.value = !mobileOpen.value
}
function otherPanel(event: Event) {
  if ((event as CustomEvent<string>).detail !== mobilePanelId) close()
}
function requestSearch() {
  document.dispatchEvent(new CustomEvent('meowyun:popover', { detail: 'quick-search' }))
  emit('search')
}
function keydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && mobileOpen.value) close(true)
}
function outside(e: PointerEvent) {
  if (!root.value?.contains(e.target as Node)) close()
}
function resize() {
  if (window.innerWidth > 760) close()
}
watch(
  () => route.fullPath,
  () => close(),
)
// 移动导航是展开区域而非模态对话框；保持原生 Tab，退出时只按需恢复触发器焦点。
onMounted(() => {
  document.addEventListener('keydown', keydown)
  document.addEventListener('pointerdown', outside)
  window.addEventListener('resize', resize)
  document.addEventListener('meowyun:popover', otherPanel)
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', keydown)
  document.removeEventListener('pointerdown', outside)
  window.removeEventListener('resize', resize)
  document.removeEventListener('meowyun:popover', otherPanel)
})
</script>
<template>
  <header ref="root" class="app-header">
    <div class="app-header__inner">
      <RouterLink class="app-header__brand" to="/" :aria-label="siteConfig.meta.name + ' · 首页'"
        ><ImageFallback
          src="/brand-mark.webp"
          alt=""
          loading="eager"
          class="app-header__mark"
          fit="contain"
        /><span>{{ siteConfig.meta.name }}</span></RouterLink
      >
      <nav
        id="primary-navigation"
        class="app-header__nav"
        :class="{ 'is-open': mobileOpen }"
        aria-label="主要导航"
      >
        <RouterLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to!"
          :aria-current="active(item.to) ? 'page' : undefined"
          ><IconGlyph :name="item.icon" :size="18" />{{ item.label }}</RouterLink
        >
      </nav>
      <div class="app-header__actions">
        <BasePopover v-if="contacts.length" label="联系作者"
          ><template #trigger
            ><IconGlyph name="mail" /><span class="contact-label">联系</span></template
          ><template #default="{ close: closeContact }"
            ><a
              v-for="item in contacts"
              :key="item.id"
              :href="item.href"
              :target="item.href.startsWith('mailto:') ? undefined : '_blank'"
              rel="noopener noreferrer"
              @click="closeContact()"
              ><ConfigIcon :name="item.icon" :provider="item.iconProvider" :size="18" /><span
                >{{ purpose(item.id) }}<small>{{ item.label }}</small></span
              ></a
            ></template
          ></BasePopover
        >
        <button
          type="button"
          class="icon-button"
          aria-label="站内快速查找"
          v-tooltip
          data-tooltip="站内快速查找 · Ctrl / ⌘ K"
          aria-keyshortcuts="Control+k Meta+k"
          @click="requestSearch"
        >
          <IconGlyph name="search" />
        </button>
        <ThemeToggle v-if="siteConfig.appearance.themeToggle" />
        <button
          ref="menuButton"
          class="icon-button mobile-toggle"
          type="button"
          :aria-label="mobileOpen ? '关闭导航' : '打开导航'"
          :aria-expanded="mobileOpen"
          aria-controls="primary-navigation"
          @click="toggleMobile"
        >
          <IconGlyph :name="mobileOpen ? 'x' : 'menu'" />
        </button>
      </div>
    </div>
  </header>
</template>
<style scoped>
.app-header {
  position: fixed;
  z-index: var(--z-header);
  top: calc(0.75rem + env(safe-area-inset-top, 0px));
  left: 0;
  right: 0;
  pointer-events: none;
}
.app-header__inner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: max-content;
  max-width: calc(100% - 1.5rem);
  margin-inline: auto;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-round);
  background: var(--color-surface);
  box-shadow:
    0 4px 0 var(--color-primary-soft),
    var(--shadow-card);
  pointer-events: auto;
}
.app-header__brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: var(--tap-size);
  min-width: var(--tap-size);
  font-weight: 700;
  font-size: var(--text-sm);
  white-space: nowrap;
}
.app-header__mark {
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
}
.app-header__nav,
.app-header__actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.app-header__nav a {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: var(--tap-size);
  padding: 0.5rem 0.8rem;
  border-radius: var(--radius-round);
  font-size: var(--text-sm);
}
.app-header__nav a[aria-current='page'],
.app-header__nav a:hover {
  background: var(--color-primary-soft);
  color: var(--color-link);
}
.app-header__actions small {
  display: block;
  color: var(--color-text-muted);
  font-size: var(--text-xs);
}
.mobile-toggle {
  display: none;
}
@media (max-width: 900px) {
  .app-header__brand > span:last-child {
    display: none;
  }
}
@media (max-width: 760px) {
  .app-header__inner {
    width: calc(100% - 1.5rem);
  }
  .app-header__brand > span:last-child {
    display: block;
  }
  .app-header__nav {
    display: none;
    position: absolute;
    top: calc(100% + 0.7rem);
    left: 0;
    right: 0;
    padding: 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-medium);
    background: var(--color-surface-raised);
    box-shadow: var(--shadow-popover);
  }
  .app-header__nav.is-open {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
  .mobile-toggle {
    display: inline-grid;
  }
  .contact-label {
    display: none;
  }
}
@media (max-width: 420px) {
  .app-header__brand > span:last-child {
    display: none;
  }
  .app-header__inner {
    gap: 0.25rem;
  }
}
</style>

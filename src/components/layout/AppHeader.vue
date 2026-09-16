<script setup lang="ts">
import { vTooltip } from '@/utils/tooltip'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { siteConfig } from '@/config/site'
import ConfigIcon from '@/components/ui/ConfigIcon.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import BasePopover from '@/components/ui/BasePopover.vue'
import CloudBrandMark from '@/components/ui/CloudBrandMark.vue'
import ThemeToggle from './ThemeToggle.vue'
const emit = defineEmits<{ search: [] }>()
const route = useRoute()
const root = ref<HTMLElement>()
const menuButton = ref<HTMLButtonElement>()
const mobileOpen = ref(false)
const mobilePanelId = 'primary-navigation'
const navigation = [
  { label: '首页', to: '/' },
  { label: '文章', to: '/articles' },
  { label: '作品', to: '/projects' },
  { label: '工坊', to: '/lab' },
  { label: '漫游', to: '/roam' },
]
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
  if (window.innerWidth > 900) close()
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
        ><span class="app-header__mark" aria-hidden="true"><CloudBrandMark /></span
        ><span>{{ siteConfig.meta.name }}</span></RouterLink
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
          >{{ item.label }}</RouterLink
        >
      </nav>
      <div class="app-header__actions">
        <div class="header-personal">
          <RouterLink
            to="/pocket"
            class="header-action"
            aria-label="我的收藏"
            v-tooltip
            data-tooltip="我的收藏"
            :aria-current="route.path === '/pocket' ? 'page' : undefined"
            ><IconGlyph name="heart" :size="18" /><span class="action-label">收藏</span></RouterLink
          >
          <BasePopover v-if="contacts.length" label="联系作者"
            ><template #trigger
              ><IconGlyph name="mail" :size="18" /><span class="action-label">联系</span></template
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
        </div>
        <div class="header-utilities">
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
    </div>
  </header>
</template>
<style scoped>
.header-utilities :deep(.icon-button) {
  border-color: transparent;
  background: transparent;
  box-shadow: none;
}
.header-utilities :deep(.icon-button:hover),
.header-utilities :deep(.icon-button[aria-expanded='true']) {
  background: var(--color-primary-soft);
}
.header-personal,
.header-utilities {
  display: flex;
  align-items: center;
  gap: 0.15rem;
}
.header-utilities {
  border-left: 1px solid var(--color-border);
  padding-left: 0.65rem;
  margin-left: 0.5rem;
}
.header-action {
  transform: none;
  rotate: none;
  transition:
    background 160ms ease,
    color 160ms ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  min-width: var(--tap-size);
  min-height: var(--tap-size);
  padding: 0.5rem;
  border-radius: var(--radius-round);
  font-size: var(--text-sm);
  white-space: nowrap;
}
.header-action:hover,
.header-action[aria-current='page'] {
  background: var(--color-primary-soft);
  color: var(--color-link);
}
.app-header {
  position: fixed;
  z-index: var(--z-header);
  top: calc(0.9rem + env(safe-area-inset-top, 0px));
  left: 0;
  right: 0;
  pointer-events: none;
}
.app-header__inner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: clamp(0.75rem, 2vw, 1.5rem);
  width: min(calc(100% - 2rem), calc(var(--page-max-width) + var(--page-padding) * 2));
  min-height: 5.25rem;
  margin-inline: auto;
  padding: 0.65rem clamp(0.8rem, 2vw, 1.45rem);
  border: 1px solid var(--color-rim);
  border-radius: 2.75rem;
  background: linear-gradient(
    100deg,
    rgb(var(--tone-rose) / 0.2),
    var(--color-surface-glass) 43%,
    rgb(var(--tone-blue) / 0.17) 74%,
    rgb(var(--tone-mint) / 0.2)
  );
  box-shadow:
    inset 0 1px 0 var(--color-rim),
    0 18px 42px -27px rgb(100 94 145 / 34%);
  backdrop-filter: blur(16px);
  pointer-events: auto;
}
.app-header__brand {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-height: var(--tap-size);
  min-width: var(--tap-size);
  font-weight: 700;
  font-size: var(--text-base);
  white-space: nowrap;
}
.app-header__mark {
  width: 2.75rem;
  height: 2.75rem;
  flex-shrink: 0;
}
.app-header__nav,
.app-header__actions {
  display: flex;
  align-items: center;
  gap: 0.15rem;
}
.app-header__nav {
  margin-left: auto;
}
.app-header__nav a {
  transform: none;
  rotate: none;
  animation: none;
  transition:
    background 160ms ease,
    color 160ms ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: var(--tap-size);
  padding: 0.55rem clamp(0.72rem, 1.15vw, 1rem);
  border-radius: var(--radius-round);
  font-size: var(--text-sm);
  white-space: nowrap;
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
.action-label {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.mobile-toggle {
  display: none;
}
@media (max-width: 900px) {
  .app-header__inner {
    width: calc(100% - 1.5rem);
    min-height: 4.5rem;
    padding-block: 0.45rem;
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
    border-radius: 1.75rem;
    background: linear-gradient(145deg, var(--color-surface-raised), var(--color-background-soft));
    box-shadow: var(--shadow-popover);
  }
  .app-header__nav.is-open {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
  .mobile-toggle {
    display: inline-grid;
  }
}
@media (max-width: 360px) {
  .header-personal,
  .header-utilities,
  .app-header__actions {
    gap: 0;
  }
  .header-utilities {
    border: 0;
    padding: 0;
    margin: 0;
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

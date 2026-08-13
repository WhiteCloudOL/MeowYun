<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { siteConfig } from '@/config/site'
import ConfigIcon from '@/components/ui/ConfigIcon.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import ThemeToggle from './ThemeToggle.vue'

const route = useRoute()
const headerRoot = ref<HTMLElement>()
const mobileNavOpen = ref(false)
const scrolled = ref(false)
let dropdownCloseTimer: ReturnType<typeof setTimeout> | undefined

function closeMobileNav() {
  mobileNavOpen.value = false
}

function handleDocumentKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeMobileNav()
}

function updateScrolledState() {
  scrolled.value = window.scrollY > 56
}

function supportsHoverNavigation() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

function openDropdown(event: MouseEvent) {
  if (!supportsHoverNavigation()) return
  const current = event.currentTarget
  if (!(current instanceof HTMLDetailsElement)) return

  if (dropdownCloseTimer) clearTimeout(dropdownCloseTimer)

  // 桌面悬停导航始终只保留一个菜单，避免联系菜单与主题菜单互相遮挡。
  headerRoot.value?.querySelectorAll('details[open]').forEach((details) => {
    if (details !== current) details.removeAttribute('open')
  })
  current.open = true
}

function closeDropdown(event: MouseEvent) {
  if (!supportsHoverNavigation()) return
  const current = event.currentTarget
  if (!(current instanceof HTMLDetailsElement)) return

  // 给指针跨越按钮与浮层之间的视觉间距留出缓冲，避免菜单在可点击前消失。
  if (dropdownCloseTimer) clearTimeout(dropdownCloseTimer)
  dropdownCloseTimer = setTimeout(() => {
    current.open = false
  }, 220)
}

function closeDesktopDropdowns() {
  if (!supportsHoverNavigation()) return
  if (dropdownCloseTimer) clearTimeout(dropdownCloseTimer)
  headerRoot.value?.querySelectorAll('.app-header__dropdown[open]').forEach((details) => {
    details.removeAttribute('open')
  })
}

function isNavActive(to?: string) {
  if (!to) return false
  if (to === '/') return route.path === '/'
  return route.path === to || route.path.startsWith(`${to}/`)
}

watch(
  () => route.path,
  () => closeMobileNav(),
)

onMounted(() => {
  document.addEventListener('keydown', handleDocumentKeydown)
  window.addEventListener('scroll', updateScrolledState, { passive: true })
  updateScrolledState()
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleDocumentKeydown)
  window.removeEventListener('scroll', updateScrolledState)
  if (dropdownCloseTimer) clearTimeout(dropdownCloseTimer)
})
</script>

<template>
  <header ref="headerRoot" class="app-header" :class="{ 'app-header--scrolled': scrolled }">
    <div class="page-shell app-header__inner">
      <RouterLink class="app-header__brand" to="/" aria-label="返回首页">
        <span class="app-header__mark" aria-hidden="true">
          <img src="/favicon.png" alt="" width="40" height="40" />
        </span>
        <span>{{ siteConfig.meta.name }}</span>
      </RouterLink>

      <nav
        id="primary-navigation"
        class="app-header__nav"
        :class="{ 'app-header__nav--open': mobileNavOpen }"
        aria-label="主要导航"
      >
        <template
          v-for="item in siteConfig.navigation.filter((entry) => entry.enabled)"
          :key="item.label"
        >
          <details
            v-if="item.children?.length"
            class="app-header__dropdown"
            @mouseenter="openDropdown"
            @mouseleave="closeDropdown"
          >
            <summary class="app-header__link app-header__summary">
              <IconGlyph :name="item.icon" :size="15" />
              {{ item.label }}
              <IconGlyph class="app-header__chevron" name="arrow-down" :size="13" />
            </summary>

            <div class="app-header__menu">
              <a
                v-for="child in item.children"
                :key="child.id"
                class="app-header__menu-item"
                :href="child.href"
                target="_blank"
                rel="noreferrer"
              >
                <span
                  class="app-header__menu-icon"
                  :style="{ '--menu-accent': child.color ?? 'var(--site-accent)' }"
                >
                  <ConfigIcon :name="child.icon" :provider="child.iconProvider" :size="17" />
                </span>
                <span>{{ child.label }}</span>
                <IconGlyph name="arrow-up-right" :size="13" />
              </a>
            </div>
          </details>

          <RouterLink
            v-else-if="item.to"
            :to="item.to"
            class="app-header__link"
            :class="{ 'app-header__link--active': isNavActive(item.to) }"
          >
            <IconGlyph :name="item.icon" :size="15" />
            {{ item.label }}
          </RouterLink>
        </template>
      </nav>

      <div class="app-header__actions" @mouseenter="closeDesktopDropdowns">
        <ThemeToggle v-if="siteConfig.appearance.themeToggle" />
        <button
          class="app-header__menu-toggle"
          type="button"
          :aria-expanded="mobileNavOpen"
          aria-controls="primary-navigation"
          :aria-label="mobileNavOpen ? '关闭导航菜单' : '打开导航菜单'"
          @click="mobileNavOpen = !mobileNavOpen"
        >
          <IconGlyph :name="mobileNavOpen ? 'x' : 'menu'" :size="20" />
        </button>
      </div>
    </div>
    <button
      v-if="mobileNavOpen"
      class="app-header__backdrop"
      type="button"
      aria-label="关闭导航菜单"
      @click="closeMobileNav"
    ></button>
  </header>
</template>

<style scoped>
.app-header {
  position: fixed;
  z-index: 20;
  top: 0.8rem;
  right: 0;
  left: 0;
  pointer-events: none;
}

.app-header__inner {
  display: grid;
  width: fit-content;
  max-width: calc(100% - 1.5rem);
  min-height: 4rem;
  grid-template-columns: auto auto auto;
  align-items: center;
  gap: clamp(0.35rem, 1.2vw, 0.8rem);
  padding: 0.38rem 0.55rem;
  border: 1px solid var(--anime-border-bright);
  border-radius: var(--radius-round);
  background: color-mix(in srgb, var(--anime-header) 84%, transparent);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 18%),
    0 0.75rem 2.4rem rgb(61 38 69 / 16%);
  pointer-events: auto;
  backdrop-filter: blur(1rem) saturate(135%);
  -webkit-backdrop-filter: blur(1rem) saturate(135%);
  transition:
    transform 460ms var(--ease-spring),
    background-color 320ms var(--ease-spring),
    box-shadow 320ms var(--ease-spring);
}

.app-header--scrolled .app-header__inner {
  background: color-mix(in srgb, var(--anime-popover) 94%, transparent);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 20%),
    0 1rem 2.8rem rgb(50 28 55 / 22%);
  transform: translateY(-0.2rem) scale(0.94);
}

.app-header__brand {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: var(--space-3);
  justify-self: start;
  font-size: var(--text-sm);
  font-family: var(--font-display);
  font-weight: 750;
  letter-spacing: -0.02em;
  color: var(--anime-text);
}

.app-header__mark {
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  overflow: hidden;
  place-items: center;
  flex: 0 0 2.5rem;
}

.app-header__mark img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0.35rem 0.55rem rgb(162 127 145 / 18%));
  transition: transform var(--transition-normal);
}

.app-header__nav {
  display: flex;
  align-items: center;
  gap: clamp(0.15rem, 0.8vw, 0.55rem);
}

.app-header__link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 2.75rem;
  padding: 0.5rem 0.72rem;
  border-radius: 0.75rem;
  color: var(--anime-muted);
  font-size: var(--text-sm);
  font-weight: 650;
  white-space: nowrap;
  transition:
    color var(--transition-fast),
    background-color var(--transition-fast),
    transform var(--transition-press);
}

.app-header__dropdown {
  position: relative;
}

.app-header__dropdown[open]::after {
  position: absolute;
  top: 100%;
  right: 0;
  left: 0;
  height: 0.9rem;
  content: '';
}

.app-header__summary {
  cursor: pointer;
  list-style: none;
}

.app-header__summary::-webkit-details-marker {
  display: none;
}

.app-header__chevron {
  transition: transform var(--transition-fast);
}

.app-header__dropdown[open] .app-header__summary {
  background: color-mix(in srgb, var(--site-accent) 11%, transparent);
  color: var(--anime-text);
}

.app-header__dropdown[open] .app-header__chevron {
  transform: rotate(180deg);
}

.app-header__menu {
  position: absolute;
  top: calc(100% + 0.85rem);
  right: 0;
  display: grid;
  width: 13rem;
  gap: 0.35rem;
  padding: 0.55rem;
  border: 1px solid rgb(255 255 255 / 16%);
  border-radius: 1.15rem;
  background: var(--anime-popover);
  box-shadow: 0 1.1rem 3rem rgb(3 7 24 / 34%);
  backdrop-filter: blur(1.25rem) saturate(145%);
  -webkit-backdrop-filter: blur(1.25rem) saturate(145%);
  transform-origin: top right;
  animation: menu-arrive 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.app-header__menu::before {
  position: absolute;
  top: -0.45rem;
  right: 1.25rem;
  width: 0.8rem;
  height: 0.8rem;
  border-top: 1px solid rgb(255 255 255 / 16%);
  border-left: 1px solid rgb(255 255 255 / 16%);
  background: var(--anime-popover);
  content: '';
  transform: rotate(45deg);
}

.app-header__menu-item {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.7rem;
  min-height: 2.9rem;
  padding: 0.45rem 0.6rem;
  border-radius: 0.85rem;
  color: var(--anime-muted);
  font-size: var(--text-sm);
  font-weight: 650;
  transition:
    color var(--transition-fast),
    background var(--transition-fast),
    transform var(--transition-fast);
}

.app-header__menu-icon {
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--menu-accent), transparent 68%);
  border-radius: 0.7rem;
  background: color-mix(in srgb, var(--menu-accent), transparent 86%);
  color: color-mix(in srgb, var(--menu-accent) 50%, var(--anime-text));
}

@keyframes menu-arrive {
  from {
    opacity: 0;
    transform: translateY(-0.35rem) scale(0.96);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.app-header__link--active {
  border-radius: 0.75rem;
  background: var(--tape-surface);
  box-shadow: none;
  color: var(--anime-text);
}

.app-header__link--active :deep(svg) {
  color: var(--anime-accent-soft);
  animation: nav-icon-hop 560ms var(--ease-spring-bold);
}

@keyframes nav-icon-hop {
  0% {
    transform: translateY(0) scale(1);
  }

  42% {
    transform: translateY(-0.32rem) rotate(-8deg) scale(1.12);
  }

  72% {
    transform: translateY(0.06rem) rotate(3deg) scale(0.98);
  }

  100% {
    transform: translateY(0) rotate(0) scale(1);
  }
}

.app-header :deep(.base-icon-button) {
  justify-self: end;
}

.app-header__actions {
  display: flex;
  align-items: center;
  justify-self: end;
  gap: var(--space-2);
}

.app-header__menu-toggle {
  display: none;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border: 1px solid var(--anime-border);
  border-radius: 50%;
  background: var(--anime-glass-strong);
  color: var(--anime-text);
  cursor: pointer;
}

.app-header__backdrop {
  position: fixed;
  z-index: -1;
  inset: 5rem 0 0;
  border: 0;
  background: rgb(3 7 24 / 38%);
  backdrop-filter: blur(0.2rem);
}

@media (hover: hover) {
  .app-header__link:hover {
    background: color-mix(in srgb, var(--site-accent) 9%, transparent);
    color: var(--anime-text);
    transform: translateY(-0.05rem);
  }

  .app-header__link--active:hover {
    background: color-mix(in srgb, var(--site-accent) 28%, var(--tape-surface));
    transform: translateY(-0.05rem);
  }

  .app-header__brand:hover .app-header__mark img {
    transform: rotate(-7deg) scale(1.08);
  }

  .app-header__menu-item:hover {
    background: rgb(255 255 255 / 8%);
    color: var(--anime-text);
    transform: translateX(0.15rem);
  }
}

@media (max-width: 48rem) {
  .app-header__inner {
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: var(--space-2);
  }

  .app-header__brand > span:last-child {
    display: none;
  }

  .app-header__nav {
    min-width: 0;
    justify-content: center;
    gap: 0.1rem;
  }

  .app-header__link {
    gap: 0.3rem;
    font-size: clamp(0.68rem, 2vw, 0.82rem);
  }
}

@media (max-width: 34rem) {
  .app-header {
    top: 0.6rem;
  }

  .app-header__inner {
    display: flex;
    min-height: 3.8rem;
  }

  .app-header__nav {
    position: fixed;
    z-index: 1;
    top: 4.9rem;
    right: var(--page-padding);
    left: var(--page-padding);
    display: grid;
    max-height: calc(100vh - 5.5rem);
    align-items: stretch;
    justify-content: stretch;
    gap: 0.25rem;
    padding: 0.55rem;
    overflow-y: auto;
    border: 1px solid var(--anime-border-bright);
    border-radius: 1.15rem;
    background: var(--anime-popover);
    box-shadow: var(--anime-shadow);
    opacity: 0;
    pointer-events: none;
    transform: translateY(-0.5rem) scale(0.98);
    transition:
      opacity var(--transition-fast),
      transform var(--transition-fast),
      visibility var(--transition-fast);
    visibility: hidden;
  }

  .app-header__nav--open {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0) scale(1);
    visibility: visible;
  }

  .app-header__mark {
    width: 2.15rem;
    height: 2.15rem;
  }

  .app-header__link {
    width: 100%;
    min-height: 2.75rem;
    justify-content: flex-start;
    gap: var(--space-3);
    padding: 0.55rem 0.75rem;
    border-radius: 0.75rem;
    font-size: var(--text-sm);
  }

  .app-header__link--active {
    background: color-mix(in srgb, var(--site-accent) 14%, transparent);
  }

  .app-header__menu .icon-glyph {
    display: block;
  }

  .app-header__summary {
    gap: var(--space-3);
  }

  .app-header__menu {
    position: static;
    width: 100%;
    margin-top: 0.25rem;
    border-color: var(--anime-border);
    background: var(--anime-inner);
    box-shadow: none;
    animation: none;
  }

  .app-header__menu::before {
    display: none;
  }

  .app-header__actions {
    margin-left: auto;
  }

  .app-header__menu-toggle {
    display: grid;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .app-header__inner {
    background: var(--color-surface-fallback);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .app-header__menu,
  .app-header__menu::before {
    background: var(--color-surface-fallback);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-header__inner,
  .app-header__menu {
    animation: none;
    transition: none;
  }

  .app-header__link--active :deep(svg) {
    animation: none;
  }
}

/* 实体手账导航：保持各路由一致，避免首页卡片与顶部玻璃胶囊产生材质冲突。 */
.app-header__inner,
.app-header--scrolled .app-header__inner {
  border: 3px solid #4a3b32;
  border-radius: 1.35rem;
  background: #fffdf9;
  box-shadow: 6px 7px 0 #ff9ebb;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.app-header--scrolled .app-header__inner {
  box-shadow: 5px 6px 0 #a7e9af;
  transform: translateY(-0.12rem) scale(0.96);
}

.app-header__brand {
  color: #4a3b32;
  font-family: ui-rounded, 'Hiragino Maru Gothic ProN', 'Microsoft YaHei UI', sans-serif;
  font-weight: 900;
}

.app-header__mark {
  border: 2px solid #4a3b32;
  border-radius: 50%;
  background: #ffffff;
}

.app-header__link {
  min-height: 2.65rem;
  border: 2px solid transparent;
  border-radius: 0.85rem;
  color: #79665b;
  font-family: ui-rounded, 'Hiragino Maru Gothic ProN', 'Microsoft YaHei UI', sans-serif;
  font-weight: 850;
  transition:
    box-shadow 300ms cubic-bezier(0.34, 1.56, 0.64, 1),
    color 220ms ease,
    transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.app-header__link--active,
.app-header__dropdown[open] .app-header__summary {
  border-color: #4a3b32;
  background: #ffb8cd;
  box-shadow: 0 4px 0 #4a3b32;
  color: #2b2d42;
}

.app-header__menu {
  top: calc(100% + 0.85rem);
  border: 3px solid #4a3b32;
  border-radius: 1.2rem;
  background: #fffdf9;
  box-shadow: 6px 7px 0 #a7e9af;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  animation: menu-arrive 360ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.app-header__menu::before {
  top: -0.55rem;
  border-top: 3px solid #4a3b32;
  border-left: 3px solid #4a3b32;
  background: #fffdf9;
}

.app-header__menu-item {
  border: 2px solid transparent;
  color: #6b584e;
  font-family: ui-rounded, 'Hiragino Maru Gothic ProN', 'Microsoft YaHei UI', sans-serif;
  font-weight: 850;
  transition:
    background-color 220ms ease,
    transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.app-header__menu-icon {
  border: 2px solid #4a3b32;
  background: color-mix(in srgb, var(--menu-accent) 58%, #ffffff);
  color: #4a3b32;
}

.app-header__menu-toggle {
  border: 3px solid #4a3b32;
  border-radius: 0.9rem;
  background: #fdfd96;
  box-shadow: 0 4px 0 #4a3b32;
  color: #2b2d42;
}

@media (hover: hover) {
  .app-header__link:hover {
    border-color: #4a3b32;
    background: #fff3b5;
    color: #2b2d42;
    transform: translateY(-0.2rem) rotate(-1deg);
  }

  .app-header__link--active:hover {
    background: #ffb8cd;
    box-shadow: 0 6px 0 #4a3b32;
    transform: translateY(-0.18rem) rotate(0);
  }

  .app-header__menu-item:hover {
    border-color: #4a3b32;
    background: #fff3b5;
    color: #2b2d42;
    transform: translateX(0.2rem) rotate(-0.5deg);
  }
}

.app-header__link:active,
.app-header__menu-toggle:active {
  box-shadow: none;
  transform: translateY(4px);
}

@media (max-width: 34rem) {
  .app-header__inner {
    max-width: calc(100% - 1.1rem);
    border-radius: 1.15rem;
    box-shadow: 4px 5px 0 #ff9ebb;
  }

  .app-header__nav {
    border: 3px solid #4a3b32;
    border-radius: 1.2rem;
    background: #fffdf9;
    box-shadow: 6px 7px 0 #a7e9af;
  }

  .app-header__menu {
    border: 2px dashed #4a3b32;
    background: #fff8d9;
    box-shadow: none;
  }
}
</style>

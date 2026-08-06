<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { siteConfig } from '@/config/site'
import ConfigIcon from '@/components/ui/ConfigIcon.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import ThemeToggle from './ThemeToggle.vue'

const route = useRoute()
const navElement = ref<HTMLElement>()
const indicatorStyle = ref({ width: '0px', transform: 'translateX(0)', opacity: '0' })
let navObserver: ResizeObserver | undefined

function isNavActive(to?: string) {
  if (!to) return false
  if (to === '/') return route.path === '/'
  return route.path === to || route.path.startsWith(`${to}/`)
}

function updateIndicator() {
  const nav = navElement.value
  if (!nav) return

  const activeLink = [...nav.querySelectorAll<HTMLElement>('[data-nav-to]')].find((link) =>
    isNavActive(link.dataset.navTo),
  )

  if (!activeLink) {
    indicatorStyle.value = { ...indicatorStyle.value, opacity: '0' }
    return
  }

  const navRect = nav.getBoundingClientRect()
  const linkRect = activeLink.getBoundingClientRect()
  indicatorStyle.value = {
    width: `${linkRect.width}px`,
    transform: `translateX(${linkRect.left - navRect.left + nav.scrollLeft}px)`,
    opacity: '1',
  }
}

watch(
  () => route.path,
  async () => {
    await nextTick()
    requestAnimationFrame(updateIndicator)
  },
)

onMounted(() => {
  navObserver = new ResizeObserver(updateIndicator)
  if (navElement.value) navObserver.observe(navElement.value)
  updateIndicator()
})

onBeforeUnmount(() => navObserver?.disconnect())
</script>

<template>
  <header class="app-header">
    <div class="page-shell app-header__inner">
      <RouterLink class="app-header__brand" to="/" aria-label="返回首页">
        <span class="app-header__mark" aria-hidden="true">
          <img src="/favicon.png" alt="" width="40" height="40" />
        </span>
        <span>{{ siteConfig.meta.name }}</span>
      </RouterLink>

      <nav ref="navElement" class="app-header__nav" aria-label="主要导航">
        <span class="app-header__indicator" :style="indicatorStyle" aria-hidden="true"></span>
        <template
          v-for="item in siteConfig.navigation.filter((entry) => entry.enabled)"
          :key="item.label"
        >
          <details v-if="item.children?.length" class="app-header__dropdown">
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
                  <ConfigIcon
                    :name="child.icon"
                    :provider="child.iconProvider"
                    :size="17"
                  />
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
            :data-nav-to="item.to"
          >
            <IconGlyph :name="item.icon" :size="15" />
            {{ item.label }}
          </RouterLink>
        </template>
      </nav>

      <ThemeToggle v-if="siteConfig.appearance.themeToggle" />
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  z-index: 20;
  top: 0;
  border-bottom: 1px solid rgb(255 255 255 / 8%);
  background: var(--anime-header);
  backdrop-filter: blur(1.25rem) saturate(135%);
  -webkit-backdrop-filter: blur(1.25rem) saturate(135%);
}

.app-header__inner {
  display: grid;
  min-height: 5rem;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--space-6);
}

.app-header__brand {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: var(--space-3);
  justify-self: start;
  font-size: var(--text-sm);
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
}

.app-header__nav {
  position: relative;
  display: flex;
  align-items: center;
  gap: clamp(0.8rem, 2vw, 2rem);
}

.app-header__indicator {
  position: absolute;
  bottom: 0.05rem;
  left: 0;
  height: 0.13rem;
  border-radius: var(--radius-round);
  background: linear-gradient(90deg, #a8bbff, #f0b4d8);
  box-shadow: 0 0 0.75rem rgb(172 190 255 / 72%);
  pointer-events: none;
  transition:
    width 440ms cubic-bezier(0.22, 1.15, 0.36, 1),
    transform 520ms cubic-bezier(0.22, 1.15, 0.36, 1),
    opacity 160ms ease;
}

.app-header__link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding-block: var(--space-2);
  color: var(--anime-muted);
  font-size: var(--text-sm);
  font-weight: 650;
  white-space: nowrap;
}

.app-header__dropdown {
  position: relative;
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
  color: var(--menu-accent);
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
  color: var(--anime-text);
}

.app-header :deep(.base-icon-button) {
  justify-self: end;
}

@media (hover: hover) {
  .app-header__link:hover {
    color: var(--anime-text);
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
    gap: var(--space-3);
  }

  .app-header__brand > span:last-child {
    display: none;
  }

  .app-header__nav {
    min-width: 0;
    justify-content: center;
    gap: clamp(0.45rem, 2vw, 1.2rem);
  }

  .app-header__link {
    gap: 0.3rem;
    font-size: clamp(0.68rem, 2vw, 0.82rem);
  }
}

@media (max-width: 34rem) {
  .app-header__inner {
    display: flex;
    min-height: 4.35rem;
  }

  .app-header__nav {
    flex: 1;
    justify-content: flex-end;
  }

  .app-header__mark {
    width: 2.15rem;
    height: 2.15rem;
  }

  .app-header__nav .icon-glyph:not(.app-header__chevron) {
    display: none;
  }

  .app-header__menu .icon-glyph {
    display: block;
  }

  .app-header__summary {
    gap: 0.15rem;
  }

  .app-header__menu {
    position: fixed;
    top: 4.1rem;
    right: var(--page-padding);
  }

  .app-header__menu::before {
    display: none;
  }

  .app-header :deep(.base-icon-button) {
    display: none;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .app-header {
    background: rgb(9 14 36 / 92%);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .app-header__menu,
  .app-header__menu::before {
    background: rgb(9 14 36 / 97%);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-header__menu {
    animation: none;
  }

  .app-header__indicator {
    transition-duration: 0.01ms;
  }
}
</style>

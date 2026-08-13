<script setup lang="ts">
import { reactive } from 'vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import type { FriendLinkItem } from '@/config/schema'
import { siteConfig } from '@/config/site'

const friends = siteConfig.friendsPage.items.filter((item) => item.enabled)
const failedIcons = reactive(new Set<string>())

function friendIcon(friend: FriendLinkItem) {
  if (friend.avatar) return friend.avatar
  if (!siteConfig.friendsPage.autoFavicon) return undefined

  try {
    const url = new URL(friend.href)
    const service = siteConfig.friendsPage.faviconService?.trim()

    if (service) {
      return service
        .replaceAll('{domain}', encodeURIComponent(url.hostname))
        .replaceAll('{origin}', encodeURIComponent(url.origin))
        .replaceAll('{url}', encodeURIComponent(url.href))
    }

    return new URL('/favicon.ico', url.origin).href
  } catch {
    return undefined
  }
}
</script>

<template>
  <div class="friends-view page-shell">
    <header class="friends-view__hero">
      <span class="friends-view__icon"><IconGlyph name="users" :size="30" /></span>
      <p class="friends-view__eyebrow">{{ siteConfig.friendsPage.subtitle }}</p>
      <h1>{{ siteConfig.friendsPage.title }}</h1>
      <p>{{ siteConfig.friendsPage.description }}</p>
    </header>

    <section class="friends-view__panel" aria-label="友链列表与申请方式">
      <div v-if="friends.length" class="friends-grid">
        <a
          v-for="friend in friends"
          :key="friend.id"
          :href="friend.href"
          class="friend-card"
          target="_blank"
          rel="noopener noreferrer"
          :style="{ '--friend-color': friend.color ?? 'var(--site-accent)' }"
        >
          <img
            v-if="friendIcon(friend) && !failedIcons.has(friend.id)"
            :src="friendIcon(friend)"
            :alt="`${friend.name} 的站点图标`"
            loading="lazy"
            @error="failedIcons.add(friend.id)"
          />
          <span v-else class="friend-card__fallback" aria-hidden="true">{{ friend.name.slice(0, 1) }}</span>
          <span class="friend-card__copy">
            <strong>{{ friend.name }}</strong>
            <small>{{ friend.description }}</small>
          </span>
          <IconGlyph name="arrow-up-right" :size="17" />
        </a>
      </div>

      <div v-else class="friends-view__empty">
        <IconGlyph name="cloud" :size="28" />
        <p>友链花园正在等待第一位访客。</p>
      </div>

      <div class="friends-view__apply">
        <span><IconGlyph name="message-circle" :size="19" /></span>
        <div>
          <h2>交换友链</h2>
          <p>{{ siteConfig.friendsPage.applicationText }}</p>
          <a
            v-if="siteConfig.friendsPage.applicationEmail"
            class="friends-view__email"
            :href="`mailto:${siteConfig.friendsPage.applicationEmail}`"
          >
            <IconGlyph name="mail" :size="14" />
            {{ siteConfig.friendsPage.applicationEmail }}
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.friends-view {
  display: grid;
  gap: clamp(var(--space-10), 8vw, 6rem);
  padding-top: clamp(var(--space-10), 8vw, 6rem);
}

.friends-view__hero {
  position: relative;
  display: grid;
  justify-items: center;
  gap: var(--space-3);
  color: var(--anime-text);
  text-align: center;
  text-shadow: 0 0.2rem 1.4rem rgb(1 5 18 / 55%);
}

.friends-view__hero::before,
.friends-view__hero::after {
  position: absolute;
  color: color-mix(in srgb, var(--site-accent) 68%, var(--anime-text));
  content: '✿';
  font-size: clamp(1rem, 2vw, 1.4rem);
  opacity: 0.72;
}

.friends-view__hero::before {
  top: 18%;
  left: clamp(3%, 14vw, 18%);
  transform: rotate(-14deg);
}

.friends-view__hero::after {
  right: clamp(3%, 14vw, 18%);
  bottom: 12%;
  transform: rotate(12deg) scale(0.75);
}

.friends-view__icon {
  display: grid;
  width: 4.5rem;
  height: 4.5rem;
  margin-bottom: var(--space-3);
  place-items: center;
  border: 1px solid var(--anime-border-bright);
  border-style: dashed;
  border-radius: 50%;
  background: color-mix(in srgb, var(--site-accent) 16%, var(--paper-surface));
  box-shadow: 0.3rem 0.35rem 0 color-mix(in srgb, var(--site-accent) 18%, transparent);
  backdrop-filter: blur(1rem);
  transform: rotate(-5deg);
}

.friends-view__eyebrow {
  color: var(--anime-accent-soft);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.friends-view h1 {
  position: relative;
  z-index: 0;
  font-size: clamp(3rem, 7vw, 6rem);
  font-weight: 850;
  letter-spacing: -0.075em;
  line-height: 1;
}

.friends-view h1::after {
  position: absolute;
  z-index: -1;
  right: 4%;
  bottom: 0.04em;
  left: 4%;
  height: 0.22em;
  border-radius: 50%;
  background: linear-gradient(90deg, transparent, rgb(255 133 184 / 62%), transparent);
  content: '';
  transform: rotate(-1deg);
}

.friends-view__hero > p:last-child {
  color: var(--anime-text-soft);
}

.friends-view__panel {
  display: grid;
  gap: var(--space-10);
}

.friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  gap: var(--space-4);
}

.friend-card {
  position: relative;
  display: grid;
  min-height: 6.5rem;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  padding: 1.15rem 1rem;
  border: 1px dashed color-mix(in srgb, var(--friend-color) 36%, var(--paper-edge));
  border-radius: 0.75rem 1.2rem 0.65rem 1rem;
  background: color-mix(in srgb, var(--friend-color) 8%, var(--paper-surface-alt));
  box-shadow: 0.25rem 0.3rem 0 color-mix(in srgb, var(--friend-color) 12%, transparent);
  transition:
    transform var(--transition-press),
    background-color var(--transition-fast),
    border-color var(--transition-fast);
}

.friend-card:nth-child(odd) {
  transform: rotate(-0.45deg);
}

.friend-card:nth-child(even) {
  transform: rotate(0.4deg);
}

.friend-card::before {
  position: absolute;
  top: -0.45rem;
  left: 1.2rem;
  width: 2.8rem;
  height: 0.8rem;
  background: color-mix(in srgb, var(--friend-color) 42%, transparent);
  clip-path: polygon(5% 10%, 96% 0, 100% 88%, 0 100%);
  content: '';
  opacity: 0.58;
  transform: rotate(-2deg);
}

.friend-card img,
.friend-card__fallback {
  width: 3rem;
  height: 3rem;
  padding: 0.18rem;
  border: 1px dashed color-mix(in srgb, var(--friend-color) 58%, var(--anime-text));
  border-radius: 0.55rem;
  background: var(--paper-surface);
  transform: rotate(-3deg);
}

.friend-card img {
  object-fit: cover;
}

.friend-card__fallback {
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--friend-color) 20%, transparent);
  color: color-mix(in srgb, var(--friend-color) 50%, var(--anime-text));
  font-weight: 800;
}

.friend-card__copy {
  display: grid;
  min-width: 0;
}

.friend-card strong {
  font-size: var(--text-sm);
}

.friend-card small {
  overflow: hidden;
  color: var(--anime-muted);
  font-size: var(--text-xs);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.friends-view__apply {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-5);
  border: 1px dashed var(--paper-edge);
  border-radius: 0.75rem 1rem 0.65rem 0.95rem;
  background:
    repeating-linear-gradient(180deg, transparent 0, transparent 1.8rem, var(--paper-line) 1.8rem, var(--paper-line) calc(1.8rem + 1px)),
    color-mix(in srgb, var(--site-accent) 6%, var(--paper-surface));
  box-shadow: var(--paper-shadow);
  transform: rotate(-0.22deg);
}

.friends-view__apply > span {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  flex: none;
  place-items: center;
  border-radius: var(--radius-small);
  background: rgb(222 230 255 / 10%);
  color: var(--anime-accent-soft);
}

.friends-view__apply h2 {
  font-size: var(--text-base);
}

.friends-view__apply p,
.friends-view__empty {
  color: var(--anime-muted);
  font-size: var(--text-sm);
}

.friends-view__email {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.45rem;
  color: var(--anime-text-soft);
  font-size: var(--text-sm);
  font-weight: 700;
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, var(--site-accent), transparent 45%);
  text-underline-offset: 0.25rem;
}

.friends-view__empty {
  display: grid;
  min-height: 12rem;
  place-items: center;
  align-content: center;
  gap: var(--space-3);
}

@media (hover: hover) {
  .friend-card:hover {
    border-color: var(--anime-border-bright);
    background: color-mix(in srgb, var(--friend-color) 13%, var(--paper-surface-alt));
    transform: translateY(-0.25rem) rotate(-1deg);
  }
}

@media (max-width: 52rem) {
  .friends-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 34rem) {
  .friends-grid {
    grid-template-columns: 1fr;
  }
}
</style>

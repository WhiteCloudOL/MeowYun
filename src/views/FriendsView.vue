<script setup lang="ts">
import { reactive } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
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

    <BaseCard class="friends-view__panel" :hoverable="false">
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
    </BaseCard>
  </div>
</template>

<style scoped>
.friends-view {
  display: grid;
  gap: clamp(var(--space-10), 8vw, 6rem);
  padding-top: clamp(var(--space-10), 8vw, 6rem);
}

.friends-view__hero {
  display: grid;
  justify-items: center;
  gap: var(--space-3);
  color: var(--anime-text);
  text-align: center;
  text-shadow: 0 0.2rem 1.4rem rgb(1 5 18 / 55%);
}

.friends-view__icon {
  display: grid;
  width: 4.5rem;
  height: 4.5rem;
  margin-bottom: var(--space-3);
  place-items: center;
  border: 1px solid var(--anime-border-bright);
  border-radius: 1.4rem;
  background: var(--anime-glass);
  box-shadow: var(--anime-shadow), inset 0 1px 0 rgb(255 255 255 / 10%);
  backdrop-filter: blur(1rem);
}

.friends-view__eyebrow {
  color: #e0e6ff;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.friends-view h1 {
  font-size: clamp(3rem, 7vw, 6rem);
  font-weight: 850;
  letter-spacing: -0.075em;
  line-height: 1;
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4);
}

.friend-card {
  display: grid;
  min-height: 6.5rem;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 1px solid var(--anime-border);
  border-radius: var(--radius-medium);
  background: var(--anime-inner);
  transition:
    transform var(--transition-press),
    background-color var(--transition-fast),
    border-color var(--transition-fast);
}

.friend-card img,
.friend-card__fallback {
  width: 3rem;
  height: 3rem;
  border: 2px solid color-mix(in srgb, var(--friend-color) 65%, white);
  border-radius: 50%;
}

.friend-card img {
  object-fit: cover;
}

.friend-card__fallback {
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--friend-color) 20%, transparent);
  color: #ffffff;
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
  padding-top: var(--space-8);
  border-top: 1px solid var(--anime-border);
}

.friends-view__apply > span {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  flex: none;
  place-items: center;
  border-radius: var(--radius-small);
  background: rgb(222 230 255 / 10%);
  color: #cad5ff;
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
    background: rgb(22 31 69 / 50%);
    transform: translateY(-0.2rem);
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

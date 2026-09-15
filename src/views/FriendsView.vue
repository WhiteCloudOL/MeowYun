<script setup lang="ts">
import { siteConfig } from '@/config/site'
import type { FriendLinkItem } from '@/config/schema'
import { isRealFriend } from '@/utils/friends'
import { useClipboard } from '@/composables/useClipboard'
import ImageFallback from '@/components/ui/ImageFallback.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
const friends = siteConfig.friendsPage.enabled
  ? siteConfig.friendsPage.items.filter(isRealFriend)
  : []
const { message, manualText, copy } = useClipboard()
const info = [
  '名称：' + siteConfig.meta.name,
  '地址：' + siteConfig.meta.siteUrl,
  '简介：' + siteConfig.meta.description,
  '头像：' + new URL(siteConfig.profile.avatar, siteConfig.meta.siteUrl).href,
].join('\n')
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
  <div class="friends-view page-shell page-content">
    <header class="page-heading paper">
      <IconGlyph name="users" :size="32" />
      <h1>{{ siteConfig.friendsPage.title }}</h1>
      <p>{{ siteConfig.friendsPage.description }}</p>
    </header>
    <div v-if="friends.length" class="friends-grid">
      <a
        v-for="friend in friends"
        :key="friend.id"
        :href="friend.href"
        target="_blank"
        rel="noopener noreferrer"
        class="friend-card"
        ><ImageFallback
          :src="friendIcon(friend)"
          :alt="friend.name + ' 的站点图标'"
          class="friend-avatar" />
        <div>
          <h2>{{ friend.name }}</h2>
          <p>{{ friend.description }}</p>
        </div>
        <IconGlyph name="arrow-up-right" :size="18"
      /></a>
    </div>
    <section v-else class="garden-empty" aria-label="暂无公开友链">
      <IconGlyph name="cloud" :size="40" />
      <h2>给下一位朋友，留一个位置</h2>
      <p>这里还没有公开的真实友链。<br />如果你也有认真打理的小站，欢迎来交换地址。</p>
    </section>
    <section class="friend-apply paper" aria-labelledby="exchange-title">
      <div>
        <h2 id="exchange-title">交换友链</h2>
        <p>{{ siteConfig.friendsPage.applicationText }}</p>
        <a
          v-if="siteConfig.friendsPage.applicationEmail"
          class="text-link"
          :href="'mailto:' + siteConfig.friendsPage.applicationEmail"
          ><IconGlyph name="mail" :size="17" />{{ siteConfig.friendsPage.applicationEmail }}</a
        >
      </div>
      <div>
        <BaseButton variant="secondary" @click="copy(info)"
          ><IconGlyph name="link" :size="17" />复制本站友链信息</BaseButton
        >
        <p class="copy-status" role="status">{{ message }}</p>
        <textarea
          v-if="manualText"
          :value="manualText"
          readonly
          aria-label="手动复制友链信息"
          @focus="($event.target as HTMLTextAreaElement).select()"
        ></textarea>
      </div>
    </section>
  </div>
</template>
<style scoped>
.friends-view {
  max-width: 62rem;
}
.friends-view .page-heading {
  max-width: none;
  text-align: center;
}
.friends-view .page-heading > svg {
  margin: 0 auto 1rem;
  color: var(--color-link);
}
.friends-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
}
.friend-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: center;
  padding: 1.5rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-medium);
  transition: transform var(--transition-normal);
}
.friend-avatar {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: var(--radius-medium);
}
.friend-card h2 {
  font-size: var(--text-lg);
}
.friend-card p {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-top: 0.5rem;
}
.garden-empty {
  display: grid;
  justify-items: center;
  gap: 1.25rem;
  text-align: center;
  padding: clamp(2rem, 6vw, 4rem);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-large);
  background: var(--color-secondary-soft);
}
.garden-empty > svg {
  color: var(--color-success);
}
.garden-empty h2 {
  font-size: var(--text-xl);
}
.garden-empty p {
  color: var(--color-text-secondary);
}
.friend-apply {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 2rem;
  align-items: center;
  margin-top: 2rem;
}
.friend-apply h2 {
  font-size: var(--text-lg);
  margin-bottom: 0.75rem;
}
.friend-apply p {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}
.friend-apply textarea {
  width: 100%;
  min-height: 8rem;
  background: var(--color-background);
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-small);
}
.copy-status {
  margin-top: 0.75rem;
  min-height: 1.5em;
}
@media (hover: hover) {
  .friend-card:hover {
    transform: translateY(-3px);
  }
}
@media (max-width: 760px) {
  .friends-grid,
  .friend-apply {
    grid-template-columns: 1fr;
  }
}
</style>

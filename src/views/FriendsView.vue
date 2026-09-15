<script setup lang="ts">
import { siteConfig } from '@/config/site'
import type { FriendLinkItem } from '@/config/schema'
import { isRealFriend } from '@/utils/friends'
import CloudBanner from '@/components/ui/CloudBanner.vue'
import { usePocket } from '@/composables/usePocket'
import { onMounted } from 'vue'
import ImageFallback from '@/components/ui/ImageFallback.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import SoftIllustration from '@/components/ui/SoftIllustration.vue'

const friends = siteConfig.friendsPage.enabled
  ? siteConfig.friendsPage.items.filter(isRealFriend)
  : []
onMounted(() => usePocket().earn('garden-visit'))
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
    <header class="page-heading">
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
        class="friend-card jelly-link"
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
      <SoftIllustration kind="garden" tone="mint" class="garden-seed" />
      <h2>给下一位朋友，留一个位置</h2>
      <p>这里还没有公开的真实友链。<br />如果你也有认真打理的小站，欢迎来交换地址。</p>
    </section>
    <CloudBanner class="garden-envelope"
      ><div>
        <h2>给花园寄一个地址</h2>
        <p>交换友链、复制本站信息，都在云间邮局里。</p>
      </div>
      <RouterLink to="/postoffice?purpose=friend" class="cottage-button"
        >打开交换友链信纸 ↗</RouterLink
      ></CloudBanner
    >
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
.friends-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2rem;
}
.friend-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: center;
}
.friend-avatar {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: var(--radius-medium);
}
.friend-card h2,
.garden-envelope h2 {
  font-size: var(--text-xl);
}
.friend-card p,
.garden-envelope p {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0.5rem 0;
}
.garden-empty {
  display: grid;
  justify-items: center;
  gap: 0.75rem;
  text-align: center;
  padding: 2.5rem 1.5rem;
  border: 1px solid var(--color-rim);
  border-radius: var(--radius-jelly);
  background: linear-gradient(150deg, rgb(var(--tone-mint) / 0.23), var(--color-surface-glass));
  box-shadow: var(--shadow-card);
}
.garden-empty h2 {
  font-size: var(--text-xl);
}
.garden-empty p {
  color: var(--color-text-secondary);
}
.garden-seed {
  width: min(15rem, 70%);
}
.garden-envelope {
  margin-top: 2rem;
}
@media (max-width: 760px) {
  .friends-grid {
    grid-template-columns: 1fr;
  }
}
</style>

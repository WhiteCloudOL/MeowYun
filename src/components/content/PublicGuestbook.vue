<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, type Component } from 'vue'
import { siteConfig } from '@/config/site'
import { useTheme } from '@/composables/useTheme'
import BaseButton from '@/components/ui/BaseButton.vue'
const config = siteConfig.guestbook
const configured = computed(
  () =>
    config?.enabled === true &&
    /^[\w.-]+\/[\w.-]+$/.test(config.repo) &&
    [config.repoId, config.categoryId].every((id) => /^[\w=-]{1,160}$/.test(id)) &&
    config.category.trim().length > 0 &&
    config.category.length <= 100,
)
const { theme } = useTheme()
const widget = shallowRef<Component>()
const host = ref<HTMLElement>()
const busy = ref(false)
const message = ref('')
let alive = true
async function load() {
  if (!configured.value || busy.value) return
  busy.value = true
  message.value = ''
  try {
    const module = await import('@giscus/vue')
    if (alive) widget.value = module.default
  } catch {
    message.value = '留言组件未能加载，可以重试或前往 GitHub 讨论区。'
  } finally {
    busy.value = false
  }
}
// 只有真实公开配置且访客主动加载才请求外部 iframe；不向留言组件传递邮件草稿。
// 错误消息同时核验来源与具体 iframe；不显示未经信任的外部文本或注入 HTML。
function receive(event: MessageEvent) {
  const frame = host.value?.querySelector('giscus-widget')?.shadowRoot?.querySelector('iframe')
  if (event.origin !== 'https://giscus.app' || !frame || event.source !== frame.contentWindow)
    return
  if (
    event.data &&
    typeof event.data === 'object' &&
    typeof event.data.giscus?.error === 'string'
  ) {
    message.value = '公共留言暂时不可用，请稍后重试或前往 GitHub 讨论区。'
  }
}
onMounted(() => window.addEventListener('message', receive))
onBeforeUnmount(() => {
  alive = false
  window.removeEventListener('message', receive)
})
</script>
<template>
  <section ref="host" class="public-guestbook" aria-labelledby="guestbook-title">
    <h2 id="guestbook-title">公共留言</h2>
    <p v-if="!configured">暂未接入公共留言服务。这里的信件不会发布到网站，也不会自动送达站长。</p>
    <template v-else>
      <p>
        留言公开保存在 GitHub Discussions。加载会连接 giscus，发表评论需要 GitHub
        账号授权；与上方私人信纸独立。
      </p>
      <BaseButton v-if="!widget" :disabled="busy" @click="load">{{
        busy ? '正在加载…' : '加载公共留言'
      }}</BaseButton>
      <component
        :is="widget"
        v-if="widget"
        :repo="config!.repo"
        :repo-id="config!.repoId"
        :category="config!.category"
        :category-id="config!.categoryId"
        mapping="specific"
        term="云间邮局"
        strict="1"
        reactions-enabled="1"
        emit-metadata="0"
        input-position="top"
        lang="zh-CN"
        :theme="theme === 'dark' ? 'dark_dimmed' : 'light'"
        loading="lazy"
      />
      <p role="status">{{ message }}</p>
      <a
        class="text-link"
        :href="'https://github.com/' + config!.repo + '/discussions'"
        target="_blank"
        rel="noopener noreferrer"
        >前往 GitHub 讨论区 ↗</a
      >
    </template>
  </section>
</template>
<style scoped>
.public-guestbook {
  margin-top: 2rem;
  padding: 1.5rem;
  border-radius: var(--radius-jelly);
  background: var(--color-surface-glass);
  border: 1px solid var(--color-rim);
}
.public-guestbook h2 {
  font-size: var(--text-xl);
  margin-bottom: 0.75rem;
}
.public-guestbook p {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  margin: 0.75rem 0;
}
.public-guestbook .text-link {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}
</style>

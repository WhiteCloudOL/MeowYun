<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { siteConfig } from '@/config/site'
import { useClipboard } from '@/composables/useClipboard'
import BaseButton from '@/components/ui/BaseButton.vue'
import CloudBanner from '@/components/ui/CloudBanner.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import PublicGuestbook from '@/components/content/PublicGuestbook.vue'
const route = useRoute(),
  key = 'meowyun-letter-draft-v1'
const purposes = [
  { id: 'hello', label: '打个招呼' },
  { id: 'project', label: '项目交流' },
  { id: 'friend', label: '交换友链' },
] as const
const purpose = ref(
  purposes.some((p) => p.id === route.query.purpose) ? String(route.query.purpose) : 'hello',
)
const sender = ref(''),
  body = ref(''),
  status = ref(''),
  opened = ref(false)
const { copy, message, manualText } = useClipboard()
const mailHref = siteConfig.profile.socials.find(
  (s) => s.enabled && s.href.startsWith('mailto:'),
)?.href
const email = mailHref?.slice(7).split('?')[0] ?? ''
const title = computed(
  () =>
    (purposes.find((p) => p.id === purpose.value)?.label ?? '打个招呼') +
    ' · 致 ' +
    siteConfig.profile.name,
)
const letter = computed(
  () => body.value.trim() + (sender.value.trim() ? '\n\n来自：' + sender.value.trim() : ''),
)
const fullLetter = computed(() => title.value + '\n\n' + letter.value)
const mailto = computed(
  () =>
    'mailto:' +
    email +
    '?subject=' +
    encodeURIComponent(title.value) +
    '&body=' +
    encodeURIComponent(letter.value),
)
const siteInfo = computed(() =>
  [
    '名称：' + siteConfig.meta.name,
    '地址：' + siteConfig.meta.siteUrl,
    '介绍：' + siteConfig.meta.description,
  ].join('\n'),
)
let blocked = false
// 私人草稿仅存当前标签页 sessionStorage；限制长度，不进入路由 query、索引或服务器。
try {
  const raw = sessionStorage.getItem(key)
  if (raw) {
    const d = JSON.parse(raw)
    if (
      !d ||
      d.version !== 1 ||
      typeof d.body !== 'string' ||
      d.body.length > 2000 ||
      typeof d.sender !== 'string' ||
      d.sender.length > 60 ||
      !purposes.some((p) => p.id === d.purpose)
    )
      throw Error()
    body.value = d.body
    sender.value = d.sender
    purpose.value = d.purpose
    opened.value = true
  }
} catch {
  blocked = true
  status.value = '暂存草稿无法读取，原记录已保留。当前编辑仅在本页保留。'
}
function save() {
  if (blocked) return
  try {
    sessionStorage.setItem(
      key,
      JSON.stringify({
        version: 1,
        purpose: purpose.value,
        sender: sender.value,
        body: body.value,
      }),
    )
  } catch {
    status.value = '浏览器未能暂存草稿，离开前请复制内容。'
  }
}
watch([purpose, sender, body], save)
function clearDraft() {
  body.value = ''
  sender.value = ''
  blocked = false
  save()
  status.value = '当前草稿已清空。'
}
function openMail(event: MouseEvent) {
  if (!email || !body.value.trim()) {
    event.preventDefault()
    status.value = '请先填写信件正文。'
    return
  }
  status.value = '已请求打开邮件客户端，请在客户端确认收件人并发送。'
}
onBeforeUnmount(save)
</script>
<template>
  <div class="postoffice-view page-shell page-content">
    <header class="page-heading">
      <span class="material-label">云间邮局</span>
      <h1>有些话，写下来慢慢说。</h1>
      <p>打个招呼、聊聊项目，或交换一个认真打理的小站。</p>
    </header>
    <CloudBanner v-if="!opened" class="letter-invitation"
      ><IconGlyph name="mail" :size="36" />
      <h2>这里有一张空白信纸</h2>
      <p>写给 {{ siteConfig.profile.name }}。内容只留在你的浏览器标签页。</p>
      <BaseButton @click="opened = true">展开信纸 <IconGlyph name="arrow-right" /></BaseButton
    ></CloudBanner>
    <div v-else class="letter-layout">
      <section class="paper letter-editor">
        <h2>想聊点什么？</h2>
        <div class="letter-purposes">
          <button
            v-for="option in purposes"
            :key="option.id"
            class="chip"
            :aria-pressed="purpose === option.id"
            @click="purpose = option.id"
          >
            {{ option.label }}
          </button>
        </div>
        <label class="field-label"
          >你的称呼（可选）<input
            v-model="sender"
            class="milk-input"
            maxlength="60"
            autocomplete="off" /></label
        ><label class="field-label"
          >信件正文<textarea
            v-model="body"
            class="milk-input"
            maxlength="2000"
            rows="8"
            :placeholder="
              purpose === 'friend' ? '写下站点名称、地址、简介，以及想说的话。' : '写几句想说的话……'
            "
          />
        </label>
        <p class="letter-count">{{ body.length }} / 2000</p>
        <div class="letter-actions">
          <BaseButton :disabled="!body.trim()" @click="copy(fullLetter)">复制整封信</BaseButton
          ><a
            v-if="email"
            class="cottage-button cottage-button--blue"
            :href="mailto"
            @click="openMail"
            >打开邮件客户端 ↗</a
          >
        </div>
        <p class="muted">打开客户端不代表邮件已发送；请在客户端确认后发送。</p>
        <button class="text-link" type="button" @click="clearDraft">清空草稿</button>
      </section>
      <aside class="letter-preview paper">
        <span class="material-label">信件预览</span>
        <h2>{{ title }}</h2>
        <p class="letter-body">{{ letter || '写下的文字会在这里显示。' }}</p>
        <p class="muted">
          {{ email ? '收件人：' + email : '站长尚未配置公开邮箱，仍可编辑和复制信件。' }}
        </p>
        <p class="draft-boundary">
          刷新会恢复当前标签页的草稿；关闭标签页可能移除暂存。重要内容请复制保存。
        </p>
      </aside>
    </div>
    <p role="status" class="letter-status">{{ status }} {{ message }}</p>
    <textarea
      v-if="manualText"
      class="milk-input"
      aria-label="手动复制内容"
      readonly
      :value="manualText"
    />
    <section class="postoffice-info">
      <div>
        <h2>交换本站信息</h2>
        <p>公开的名称、地址与介绍，可直接带走。</p>
        <button class="chip" @click="copy(siteInfo)">复制本站信息</button
        ><button v-if="email" class="chip" @click="copy(email)">复制邮箱地址</button>
      </div>
    </section>
    <PublicGuestbook />
  </div>
</template>
<style scoped>
.postoffice-view {
  max-width: 68rem;
}
.letter-invitation {
  max-width: 48rem;
}
.letter-invitation h2 {
  font-size: var(--text-xl);
  margin: 1rem 0;
}
.letter-invitation p {
  margin: 1rem 0 1.5rem;
  color: var(--color-text-secondary);
}
.letter-invitation :deep(.cloud-banner__content) > svg {
  color: var(--color-link);
}
.letter-layout {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 2rem;
  align-items: start;
}
.letter-layout h2,
.postoffice-info h2 {
  font-size: var(--text-xl);
  margin-bottom: 1rem;
}
.letter-purposes,
.letter-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1.5rem;
}
.letter-editor .field-label {
  margin-bottom: 1rem;
}
.letter-count {
  font-size: var(--text-xs);
  text-align: right;
  margin-top: -0.7rem;
  margin-bottom: 1.5rem;
  color: var(--color-text-secondary);
}
.letter-editor > .muted {
  font-size: var(--text-sm);
}
.letter-preview {
  background: linear-gradient(150deg, rgb(var(--tone-blue) / 0.2), var(--color-surface-glass));
  border-radius: var(--radius-jelly);
}
.letter-body {
  white-space: pre-wrap;
  min-height: 10rem;
  padding: 1rem 0 2rem;
}
.letter-preview > .muted,
.draft-boundary {
  font-size: var(--text-sm);
  overflow-wrap: anywhere;
}
.draft-boundary {
  margin-top: 1.5rem;
  color: var(--color-text-secondary);
}
.letter-status {
  margin: 1.5rem 0;
  min-height: 1.75em;
  font-size: var(--text-sm);
}
.postoffice-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
}
.postoffice-info p {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
}
.postoffice-info .chip {
  margin: 0 0.5rem 0.5rem 0;
}
@media (max-width: 750px) {
  .letter-layout,
  .postoffice-info {
    grid-template-columns: 1fr;
  }
  .letter-invitation {
    padding: 2.5rem;
  }
}
</style>

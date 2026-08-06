<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'

const props = defineProps<{
  destination: string
  label: string
  delaySeconds: number
}>()

const remainingSeconds = ref(Math.max(0, Math.ceil(props.delaySeconds)))
let redirectTimer: ReturnType<typeof setInterval> | undefined

function redirectNow() {
  if (redirectTimer) clearInterval(redirectTimer)
  window.location.replace(props.destination)
}

onMounted(() => {
  if (remainingSeconds.value === 0) {
    redirectNow()
    return
  }

  redirectTimer = setInterval(() => {
    remainingSeconds.value -= 1
    if (remainingSeconds.value <= 0) redirectNow()
  }, 1000)
})

onBeforeUnmount(() => {
  if (redirectTimer) clearInterval(redirectTimer)
})
</script>

<template>
  <main class="redirect-view page-shell" aria-live="polite">
    <IconGlyph name="external-link" :size="28" />
    <p class="eyebrow">REDIRECTING</p>
    <h1>
      <span>正在前往</span>
      <strong>{{ label }}</strong>
    </h1>
    <p>将在 {{ remainingSeconds }} 秒后自动跳转，也可以立即继续。</p>
    <BaseButton @click="redirectNow">立即访问</BaseButton>
  </main>
</template>

<style scoped>
.redirect-view {
  display: grid;
  min-height: 70vh;
  align-content: center;
  justify-items: center;
  gap: var(--space-4);
  text-align: center;
}

.redirect-view > svg {
  color: var(--anime-accent-soft);
}

.redirect-view h1 {
  display: grid;
  max-width: 15ch;
  font-size: clamp(2rem, 7vw, 4rem);
  letter-spacing: -0.055em;
  text-wrap: balance;
}

.redirect-view h1 strong {
  font: inherit;
}

.redirect-view > p:not(.eyebrow) {
  max-width: 32rem;
  color: var(--anime-text-soft);
  line-height: 1.75;
}
</style>

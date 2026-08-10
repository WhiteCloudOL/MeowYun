<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    text: string
    enabled?: boolean
    speed?: number
  }>(),
  {
    enabled: true,
    speed: 58,
  },
)

const displayed = ref(props.enabled ? '' : props.text)
const finished = ref(!props.enabled)
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  // 减少动态效果时直接展示全文，避免逐字动画妨碍阅读或产生闪烁。
  if (!props.enabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    displayed.value = props.text
    finished.value = true
    return
  }

  // Array.from 按 Unicode 码点拆分，避免常见中文和 Emoji 被 UTF-16 拆成乱码。
  const characters = Array.from(props.text)
  let index = 0

  timer = setInterval(() => {
    displayed.value += characters[index] ?? ''
    index += 1

    if (index >= characters.length) {
      finished.value = true
      if (timer) clearInterval(timer)
    }
  }, props.speed)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <span class="typewriter" :class="{ 'typewriter--finished': finished }" :aria-label="text">
    <span aria-hidden="true">{{ displayed }}</span>
    <span class="typewriter__cursor" aria-hidden="true"></span>
  </span>
</template>

<style scoped>
.typewriter__cursor {
  display: inline-block;
  width: 0.1rem;
  height: 1.1em;
  margin-left: 0.25rem;
  background: var(--site-accent);
  vertical-align: -0.15em;
  animation: cursor-blink 900ms steps(2, jump-none) infinite;
}

.typewriter--finished .typewriter__cursor {
  animation-duration: 1.2s;
}

@keyframes cursor-blink {
  50% {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .typewriter__cursor {
    display: none;
  }
}
</style>

import { onBeforeUnmount, ref } from 'vue'
export function useClipboard() {
  const message = ref('')
  const manualText = ref('')
  let timer: ReturnType<typeof setTimeout> | undefined
  let alive = true
  let request = 0
  async function copy(text: string) {
    const current = ++request
    if (timer) clearTimeout(timer)
    manualText.value = ''
    try {
      await navigator.clipboard.writeText(text)
      if (!alive || current !== request) return
      message.value = '已复制'
    } catch {
      if (!alive || current !== request) return
      manualText.value = text
      message.value = '无法自动复制，请选择下方内容手动复制。'
    }
    if (!manualText.value)
      timer = setTimeout(() => {
        message.value = ''
      }, 4000)
  }
  // 定时反馈属于组件生命周期；失败文本保持可选中，直到下一次复制或面板关闭。
  onBeforeUnmount(() => {
    alive = false
    if (timer) clearTimeout(timer)
  })
  return { message, manualText, copy }
}

import { onBeforeUnmount, ref } from 'vue'
export function useClipboard() {
  const message = ref('')
  const manualText = ref('')
  let timer: ReturnType<typeof setTimeout> | undefined
  async function copy(text: string) {
    if (timer) clearTimeout(timer)
    manualText.value = ''
    try {
      await navigator.clipboard.writeText(text)
      message.value = '已复制'
    } catch {
      manualText.value = text
      message.value = '无法自动复制，请选择下方内容手动复制。'
    }
    timer = setTimeout(() => {
      message.value = ''
    }, 4000)
  }
  // 定时反馈属于组件生命周期；失败文本保持可选中，直到下一次复制或面板关闭。
  onBeforeUnmount(() => {
    if (timer) clearTimeout(timer)
  })
  return { message, manualText, copy }
}

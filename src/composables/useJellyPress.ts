import { onBeforeUnmount, ref } from 'vue'
import { useMotion } from './useMotion'

export function useJellyPress() {
  const releasing = ref(false)
  const { quietEffective } = useMotion()
  let timer: ReturnType<typeof setTimeout> | undefined
  let frame: number | undefined
  function release() {
    if (timer) clearTimeout(timer)
    if (frame !== undefined) cancelAnimationFrame(frame)
    releasing.value = false
    if (quietEffective.value) return
    // 只管理皮肤的有界释放状态；真实 click 不等待动画。快速操作重新开始，卸载清理。
    frame = requestAnimationFrame(() => {
      releasing.value = true
      timer = setTimeout(() => {
        releasing.value = false
      }, 450)
    })
  }
  onBeforeUnmount(() => {
    if (timer) clearTimeout(timer)
    if (frame !== undefined) cancelAnimationFrame(frame)
  })
  return { releasing, release }
}

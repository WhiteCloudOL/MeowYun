import { onBeforeUnmount, onMounted, ref, type CSSProperties, type Ref } from 'vue'

interface SpringRevealOptions {
  rootMargin?: string
  threshold?: number
  staggerMs?: number
}

/**
 * 为一组手账元素提供一次性视口入场和稳定的交错变量。
 * 观察器在首次显示后立即释放；减少动态效果时直接呈现最终状态。
 */
export function useSpringAnimation(
  root: Ref<HTMLElement | undefined>,
  options: SpringRevealOptions = {},
) {
  const visible = ref(false)
  const reducedMotion = ref(false)
  let observer: IntersectionObserver | undefined

  const staggerMs = options.staggerMs ?? 80

  function itemStyle(index: number, tilt = 0): CSSProperties {
    return {
      '--spring-delay': `${index * staggerMs}ms`,
      '--spring-tilt': `${tilt}deg`,
    } as CSSProperties
  }

  onMounted(() => {
    reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion.value) {
      visible.value = true
      return
    }

    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        visible.value = true
        observer?.disconnect()
      },
      {
        rootMargin: options.rootMargin ?? '0px 0px -8% 0px',
        threshold: options.threshold ?? 0.12,
      },
    )

    if (root.value) observer.observe(root.value)
  })

  onBeforeUnmount(() => observer?.disconnect())

  return { itemStyle, reducedMotion, visible }
}

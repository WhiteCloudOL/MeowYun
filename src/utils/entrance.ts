import type { ObjectDirective } from 'vue'
const observers = new WeakMap<
  HTMLElement,
  { observer?: IntersectionObserver; timer?: ReturnType<typeof setTimeout> }
>()
// 默认内容可见。入场只在第一次进入视口短暂添加类，结束即移除；筛选不会重新播放整页动画。
export const vEntrance: ObjectDirective<HTMLElement> = {
  mounted(el) {
    if (!('IntersectionObserver' in window) || document.documentElement.dataset.motion === 'off')
      return
    const state: { observer?: IntersectionObserver; timer?: ReturnType<typeof setTimeout> } = {}
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        observer.disconnect()
        if (document.documentElement.dataset.motion === 'off') return
        el.classList.add('is-entering')
        state.timer = setTimeout(() => el.classList.remove('is-entering'), 800)
      },
      { threshold: 0.06 },
    )
    state.observer = observer
    observers.set(el, state)
    observer.observe(el)
  },
  unmounted(el) {
    const state = observers.get(el)
    state?.observer?.disconnect()
    if (state?.timer) clearTimeout(state.timer)
    observers.delete(el)
  },
}

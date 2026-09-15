import type { ObjectDirective } from 'vue'

const cleanups = new WeakMap<HTMLElement, () => void>()
let serial = 0

// 委托给整个热力图，避免为每一天注册全局监听；提示只使用 textContent，不解释 HTML。
export const vTooltip: ObjectDirective<HTMLElement> = {
  mounted(root) {
    const tip = document.createElement('div')
    tip.id = 'site-tooltip-' + ++serial
    tip.className = 'site-tooltip'
    tip.role = 'tooltip'
    tip.hidden = true
    document.body.append(tip)
    let active: HTMLElement | null = null
    let previousDescription: string | null = null
    let timer: ReturnType<typeof setTimeout> | undefined
    function hide() {
      if (timer) clearTimeout(timer)
      tip.hidden = true
      if (active) {
        if (previousDescription === null) active.removeAttribute('aria-describedby')
        else active.setAttribute('aria-describedby', previousDescription)
      }
      active = null
    }
    function show(event: Event) {
      const target =
        event.target instanceof Element ? event.target.closest<HTMLElement>('[data-tooltip]') : null
      if (!target || !root.contains(target)) return
      if (timer) clearTimeout(timer)
      if (active === target && !tip.hidden) return
      hide()
      active = target
      previousDescription = target.getAttribute('aria-describedby')
      target.setAttribute(
        'aria-describedby',
        [previousDescription, tip.id].filter(Boolean).join(' '),
      )
      tip.textContent = target.dataset.tooltip ?? ''
      tip.hidden = false
      const rect = target.getBoundingClientRect()
      const bounds = tip.getBoundingClientRect()
      tip.style.left =
        Math.max(
          8,
          Math.min(innerWidth - bounds.width - 8, rect.left + (rect.width - bounds.width) / 2),
        ) + 'px'
      tip.style.top =
        (rect.bottom + bounds.height + 12 < innerHeight
          ? rect.bottom + 8
          : Math.max(8, rect.top - bounds.height - 8)) + 'px'
    }
    function leave() {
      timer = setTimeout(hide, 150)
    }
    function keep() {
      if (timer) clearTimeout(timer)
    }
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape') hide()
    }
    root.addEventListener('pointerover', show)
    root.addEventListener('focusin', show)
    root.addEventListener('pointerleave', leave)
    root.addEventListener('focusout', leave)
    tip.addEventListener('pointerenter', keep)
    tip.addEventListener('pointerleave', leave)
    document.addEventListener('keydown', escape)
    window.addEventListener('scroll', hide, true)
    window.addEventListener('resize', hide)
    cleanups.set(root, () => {
      hide()
      tip.remove()
      root.removeEventListener('pointerover', show)
      root.removeEventListener('focusin', show)
      root.removeEventListener('pointerleave', leave)
      root.removeEventListener('focusout', leave)
      document.removeEventListener('keydown', escape)
      window.removeEventListener('scroll', hide, true)
      window.removeEventListener('resize', hide)
    })
  },
  beforeUnmount(root) {
    cleanups.get(root)?.()
    cleanups.delete(root)
  },
}

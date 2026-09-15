import { nextTick } from 'vue'
import type { Router, RouteLocationNormalized } from 'vue-router'

export function setupViewTransitions(router: Router) {
  let active: ViewTransition | undefined
  let finish: (() => void) | undefined
  let visualKey: string | undefined
  const marked = new Set<HTMLElement>()
  function clearVisuals() {
    for (const element of marked) element.style.removeProperty('view-transition-name')
    marked.clear()
    visualKey = undefined
  }
  function keyFor(route: RouteLocationNormalized) {
    return route.name === 'article' || route.name === 'project'
      ? String(route.name) + '-' + String(route.params.slug)
      : undefined
  }
  function markVisual(key: string | undefined) {
    if (!key) return false
    const visual = [...document.querySelectorAll<HTMLElement>('[data-transition-key]')].find(
      (e) => {
        const box = e.getBoundingClientRect()
        return e.dataset.transitionKey === key && box.bottom > 0 && box.top < innerHeight
      },
    )
    if (!visual) return false
    visual.style.viewTransitionName = 'content-art'
    marked.add(visual)
    return true
  }
  // 路由解析后只捕获当前可见的封面/插画，正文和整张卡不共享变形。
  // 每次快速导航先释放旧截图与等待；不支持或要求 reduce 时照常立即跳转。
  const before = router.beforeResolve((to, from) => {
    active?.skipTransition()
    finish?.()
    finish = undefined
    clearVisuals()
    if (
      !from.matched.length ||
      to.path === from.path ||
      !document.startViewTransition ||
      document.visibilityState === 'hidden' ||
      document.documentElement.dataset.quiet === 'true' ||
      matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return
    const candidate = keyFor(to) ?? keyFor(from)
    if (markVisual(candidate)) visualKey = candidate
    return new Promise<void>((resolve) => {
      const transition = document.startViewTransition(async () => {
        resolve()
        await new Promise<void>((done) => {
          finish = done
        })
      })
      active = transition
      void transition.ready.catch(() => {})
      void transition.finished
        .finally(() => {
          if (active === transition) {
            clearVisuals()
            active = undefined
          }
        })
        .catch(() => {})
    })
  })
  const after = router.afterEach(async (to, from) => {
    await nextTick()
    // 新 DOM 的同一真实内容接住封面。不同内容不硬凑共享关系。
    markVisual(visualKey)
    finish?.()
    finish = undefined
    const archiveFilter = [to.name, from.name].every(
      (name) => name === 'articles' || name === 'articles-tag',
    )
    if (to.path !== from.path && !archiveFilter) {
      const heading = document.querySelector<HTMLElement>('#main-content h1')
      heading?.setAttribute('tabindex', '-1')
      heading?.focus({ preventScroll: true })
    }
  })
  const error = router.onError(() => {
    finish?.()
    finish = undefined
    active?.skipTransition()
    clearVisuals()
  })
  if (import.meta.hot)
    import.meta.hot.dispose(() => {
      before()
      after()
      error()
      finish?.()
      active?.skipTransition()
      clearVisuals()
    })
}

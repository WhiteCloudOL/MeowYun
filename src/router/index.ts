import { createRouter, createWebHistory } from 'vue-router'
import { setupViewTransitions } from '@/utils/viewTransitions'
import { siteConfig } from '@/config/site'
import { updateSeo } from '@/utils/seo'
import { archiveSeo, indexSeo, redirectSeo } from '@/utils/routeSeo'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  async scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    const quiet =
      document.documentElement.dataset.quiet === 'true' ||
      matchMedia('(prefers-reduced-motion: reduce)').matches
    if (to.hash) {
      // 等待短转场挂载目标；读取共享 scroll-margin，避免 Router 的默认零偏移盖住标题。
      let id: string
      try {
        id = decodeURIComponent(to.hash.slice(1))
      } catch {
        return false
      }
      for (let attempt = 0; attempt < 20; attempt++) {
        const target = document.getElementById(id)
        if (target)
          return {
            el: target,
            top: parseFloat(getComputedStyle(target).scrollMarginTop) || 0,
            behavior: quiet ? 'auto' : 'smooth',
          }
        await new Promise((resolve) => setTimeout(resolve, 20))
      }
      return false
    }
    // 轻量过滤保持视口；浏览历史恢复交给 Router 的 savedPosition。
    if (
      to.path === from.path ||
      (String(to.name).startsWith('articles') && String(from.name).startsWith('articles'))
    )
      return false
    return { top: 0 }
  },
  routes: [
    {
      path: '/lab/palette',
      name: 'palette',
      component: () => import('@/views/PaletteView.vue'),
      meta: {
        title: '配色调制器 · ' + siteConfig.meta.name,
        description: '调制、微调、预览和保存配色，导出 CSS 变量。',
      },
    },
    {
      path: '/lab/focus',
      name: 'focus',
      component: () => import('@/views/FocusView.vue'),
      meta: {
        title: '云端专注角 · ' + siteConfig.meta.name,
        description: '可以暂停、恢复和校正剩余时间的本地专注工具。',
      },
    },
    {
      path: '/postoffice',
      name: 'postoffice',
      component: () => import('@/views/PostofficeView.vue'),
      meta: { title: '云间邮局 · ' + siteConfig.meta.name, noIndex: true },
    },

    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
      meta: {
        title: '小屋主人 · ' + siteConfig.meta.name,
        description: siteConfig.sections.about.description,
      },
    },
    {
      path: '/moments',
      name: 'moments',
      component: () => import('@/views/MomentsView.vue'),
      meta: {
        title: '云间小记 · ' + siteConfig.meta.name,
        description: '文章发布和站点更新的真实记录。',
      },
    },
    {
      path: '/roam',
      name: 'roam',
      component: () => import('@/views/RoamView.vue'),
      meta: {
        title: '漫游 · ' + siteConfig.meta.name,
        description: '小屋里的星图、花园、邮局与漫游口袋。',
      },
    },
    {
      path: '/projects',
      name: 'projects',
      component: () => import('@/views/ProjectsView.vue'),
      meta: {
        title: '作品陈列室 · ' + siteConfig.meta.name,
        description: '真实开源作品与工具的陈列室。',
      },
    },
    {
      path: '/projects/:slug',
      name: 'project',
      component: () => import('@/views/ProjectView.vue'),
    },
    {
      path: '/lab',
      name: 'lab',
      component: () => import('@/views/LabView.vue'),
      meta: {
        title: '创意工坊 · ' + siteConfig.meta.name,
        description: '在浏览器里制作明信片、调色与专注。',
      },
    },
    {
      path: '/lab/postcard',
      name: 'postcard',
      component: () => import('@/views/PostcardView.vue'),
      meta: { title: '明信片工坊 · ' + siteConfig.meta.name, noIndex: true },
    },
    {
      path: '/pocket',
      name: 'pocket',
      component: () => import('@/views/PocketView.vue'),
      meta: { title: '我的口袋 · ' + siteConfig.meta.name, noIndex: true },
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: {
        title: siteConfig.meta.title,
        description: siteConfig.meta.description,
        transition: 'page-material',
      },
    },
    {
      path: '/articles',
      name: 'articles',
      component: () => import('@/views/ArticlesView.vue'),
      meta: {
        ...archiveSeo(siteConfig.meta.name),
        transition: 'page-rise',
      },
    },
    {
      path: '/articles/tags/:tag',
      name: 'articles-tag',
      component: () => import('@/views/ArticlesView.vue'),
      meta: {
        title: `文章标签 · ${siteConfig.meta.name}`,
        description: '按标签浏览 QQ 机器人、Minecraft、开源工具与部署运维文章。',
        transition: 'page-rise',
      },
    },
    {
      path: '/navigation',
      name: 'navigation',
      component: () => import('@/views/NavigationView.vue'),
      meta: {
        ...indexSeo(siteConfig.meta.name, 'navigation'),
        transition: 'page-rise',
      },
    },
    {
      path: '/friends',
      name: 'friends',
      component: () => import('@/views/FriendsView.vue'),
      meta: {
        ...indexSeo(siteConfig.meta.name, 'friends'),
        transition: 'page-material',
      },
    },
    {
      path: '/articles/:slug',
      name: 'article',
      component: () => import('@/views/ArticleView.vue'),
      meta: { transition: 'page-detail' },
    },
    ...siteConfig.redirects
      .filter((item) => item.enabled)
      .map((item) => ({
        path: item.path,
        name: `redirect-${item.id}`,
        component: () => import('@/views/ExternalRedirectView.vue'),
        props: {
          destination: item.to,
          label: item.label,
          delaySeconds: item.delaySeconds,
        },
        meta: {
          ...redirectSeo(siteConfig.meta.name),
          transition: 'page-fade',
        },
      })),
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: {
        title: `页面未找到 · ${siteConfig.meta.name}`,
        description: '请求的页面不存在或已经移动。',
        noIndex: true,
        transition: 'page-fade',
      },
    },
  ],
})

router.afterEach((to) => {
  // 文章需要发布日期、标签等完整 Meta，由 ArticleView 在内容解析完成后独立更新。
  if (to.name === 'article' || to.name === 'project') return

  if (String(to.name).startsWith('articles')) {
    updateSeo({
      ...archiveSeo(
        siteConfig.meta.name,
        typeof to.params.tag === 'string' ? to.params.tag : undefined,
      ),
      path: to.path,
      noIndex: typeof to.query.q === 'string' && !!to.query.q.trim(),
    })
    return
  }

  updateSeo({
    title: typeof to.meta.title === 'string' ? to.meta.title : siteConfig.meta.title,
    description:
      typeof to.meta.description === 'string' ? to.meta.description : siteConfig.meta.description,
    path: to.fullPath,
    noIndex: to.meta.noIndex === true,
  })
})

setupViewTransitions(router)
export default router

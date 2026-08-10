import { createRouter, createWebHistory } from 'vue-router'
import { siteConfig } from '@/config/site'
import { updateSeo } from '@/utils/seo'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: (to) => (to.hash ? { el: to.hash, behavior: 'smooth' } : { top: 0 }),
  routes: [
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
        title: `文章 · ${siteConfig.meta.name}`,
        description: 'QQ 机器人、Minecraft 服务端、开源工具与部署运维笔记。',
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
        title: `导航 · ${siteConfig.meta.name}`,
        description: '清蒸云鸭的文档、服务状态、开源项目与常用入口。',
        transition: 'page-rise',
      },
    },
    {
      path: '/friends',
      name: 'friends',
      component: () => import('@/views/FriendsView.vue'),
      meta: {
        title: `友链 · ${siteConfig.meta.name}`,
        description: '清蒸云鸭的友链花园与友链交换方式。',
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
          title: `正在跳转 · ${siteConfig.meta.name}`,
          description: `正在前往${item.label}。`,
          noIndex: true,
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
  if (to.name === 'article') return

  updateSeo({
    title: typeof to.meta.title === 'string' ? to.meta.title : siteConfig.meta.title,
    description:
      typeof to.meta.description === 'string' ? to.meta.description : siteConfig.meta.description,
    path: to.fullPath,
    noIndex: to.meta.noIndex === true,
  })
})

export default router

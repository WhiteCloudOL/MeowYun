export const articleDescription = 'QQ 机器人、Minecraft 服务端、开源工具与部署运维笔记。'

export function archiveSeo(siteName: string, tag?: string) {
  return {
    title: tag ? `#${tag} · ${siteName}` : `文章与笔记 · ${siteName}`,
    description: tag ? `浏览与 ${tag} 相关的技术文章、实践记录与开发笔记。` : articleDescription,
  }
}

export function indexSeo(siteName: string, page: 'navigation' | 'friends') {
  return page === 'navigation'
    ? {
        title: `导航 · ${siteName}`,
        description: `${siteName}的文档、服务状态、开源项目与常用入口。`,
      }
    : { title: `友链 · ${siteName}`, description: `${siteName}的友链花园与友链交换方式。` }
}

export function redirectSeo(siteName: string) {
  return {
    title: `前往外部站点 · ${siteName}`,
    description: '确认目的地后访问外部页面。',
    noIndex: true,
  }
}

// 只登记已有真实页面；尚未完成的工具不能生成空入口或进入 Sitemap。
export const extraPages = [
  {
    path: '/lab/palette',
    title: '配色调制器',
    description: '调制、微调、预览和保存配色，导出 CSS 变量。',
  },
  {
    path: '/lab/focus',
    title: '云端专注角',
    description: '可以暂停、恢复和校正剩余时间的本地专注工具。',
  },
  {
    path: '/postoffice',
    title: '云间邮局',
    description: '本地信件编辑、复制与邮件客户端入口。',
    noIndex: true,
  },

  { path: '/projects', title: '作品陈列室', description: '开源作品与工具的用途、技术和相关资料。' },
  { path: '/about', title: '关于我', description: '个人介绍、技术方向和公开联系方式。' },
  { path: '/moments', title: '云间小记', description: '文章发布和站点更新的真实记录。' },
  { path: '/roam', title: '漫游', description: '导航、友链、关于与收藏的入口。' },
  { path: '/lab', title: '创意工坊', description: '在浏览器里制作可以带走的小东西。' },
  {
    path: '/lab/postcard',
    title: '明信片工坊',
    description: '本地明信片编辑与 PNG 导出。',
    noIndex: true,
  },
  {
    path: '/pocket',
    title: '我的口袋',
    description: '保存在当前浏览器的收藏和阅读记录。',
    noIndex: true,
  },
]

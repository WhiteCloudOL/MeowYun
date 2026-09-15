import type { SiteConfig } from './schema'
/** 本次已实际完成的站点改动；作者可用 siteConfig.updates 替换，空数组可隐藏。 */
export const siteUpdates: NonNullable<SiteConfig['updates']> = [
  { date: '2026-09-15', text: '手账改为自然翻阅，新增站内快速查找、安静模式与手机文章目录。' },
]

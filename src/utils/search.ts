import { articles, type Article } from '@/content/articles'
import { siteConfig } from '@/config/site'

export function normalizeSearch(value: string): string {
  return value.normalize('NFKC').toLocaleLowerCase('zh-CN').trim()
}
export function matchesSearch(text: string, query: string): boolean {
  const normalized = normalizeSearch(text)
  return normalizeSearch(query)
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => normalized.includes(word))
}
export function searchArticles(query: string, tag?: string): Article[] {
  return articles.filter(
    (article) =>
      (!tag || article.tags.includes(tag)) &&
      matchesSearch(article.searchText + ' ' + article.tags.join(' '), query),
  )
}
export interface SearchEntry {
  id: string
  group: '文章' | '项目' | '站点'
  title: string
  description: string
  href: string
  text: string
}
// 所有搜索共享当前本地资料，渲染时只用文本绑定，不将检索命中作为 HTML 插入。
export const searchEntries: SearchEntry[] = [
  ...articles.map((a) => ({
    id: 'article-' + a.slug,
    group: '文章' as const,
    title: a.title,
    description: a.description,
    href: '/articles/' + a.slug,
    text: a.searchText + ' ' + a.tags.join(' '),
  })),
  ...(siteConfig.sections.projects.enabled
    ? siteConfig.sections.projects.items
        .filter((x) => x.enabled)
        .map((p) => ({
          id: 'project-' + p.id,
          group: '项目' as const,
          title: p.title,
          description: p.description,
          href: '/navigation#project-' + p.id,
          text: p.title + ' ' + p.description + ' ' + p.technologies.join(' '),
        }))
    : []),
  ...(siteConfig.sections.navigation.enabled
    ? siteConfig.sections.navigation.items
        .filter((x) => x.enabled)
        .map((p) => ({
          id: 'site-' + p.id,
          group: '站点' as const,
          title: p.title,
          description: p.description,
          href: p.href,
          text: p.title + ' ' + p.description,
        }))
    : []),
]
export function quickSearch(query: string): SearchEntry[] {
  return searchEntries.filter((entry) => matchesSearch(entry.text, query))
}

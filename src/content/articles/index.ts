import type { ArticleHeadingLevel } from '@/config/schema'
import { isSiteIcon, type SiteIcon } from '@/types/icon'
import { resolveImage } from './assets'
import { parseArticleSource } from '@/utils/articleMetadata'

export interface Article {
  slug: string
  title: string
  description: string
  publishedAt: string
  updatedAt?: string
  displayDate: string
  displayUpdatedAt?: string
  tags: string[]
  featured: boolean
  icon?: SiteIcon
  cover?: string
  sourceUrl?: string
  sourceLabel?: string
  body: string
  searchText: string
}

export interface ArticleHeading {
  level: ArticleHeadingLevel
  text: string
  id: string
}

const articleFiles = import.meta.glob('./*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

function formatDate(date: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function plainText(markdownSource: string) {
  return markdownSource
    .replace(/^```[^\n]*$/gm, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~|\-[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export const articles: Article[] = Object.entries(articleFiles)
  .map(([path, source]) => {
    const { attributes, tags, body } = parseArticleSource(source, path)
    const slug = path.split('/').at(-1)?.replace(/\.md$/, '') ?? ''
    const publishedAt = attributes.date!
    const updatedAt = attributes.updated || undefined
    const firstImage = body.match(/!\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/)?.[1]
    const icon = attributes.icon && isSiteIcon(attributes.icon) ? attributes.icon : undefined
    const title = attributes.title ?? slug

    return {
      slug,
      title,
      description: attributes.description ?? '',
      publishedAt,
      updatedAt,
      displayDate: formatDate(publishedAt),
      displayUpdatedAt: updatedAt ? formatDate(updatedAt) : undefined,
      tags,
      featured: attributes.featured === 'true',
      icon,
      cover: resolveImage(attributes.cover) ?? resolveImage(firstImage),
      sourceUrl: attributes.sourceUrl,
      sourceLabel: attributes.sourceLabel,
      body,
      searchText: `${title} ${attributes.description ?? ''} ${plainText(body)}`.toLocaleLowerCase(
        'zh-CN',
      ),
    }
  })
  .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))

export function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug)
}

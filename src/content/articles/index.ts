import type { ArticleHeadingLevel } from '@/config/schema'
import { isSiteIcon, type SiteIcon } from '@/types/icon'

export type ArticleBlock =
  | { type: 'heading'; level: ArticleHeadingLevel; text: string; id: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'quote'; text: string }
  | { type: 'code'; language: string; content: string }
  | { type: 'image'; src: string; alt: string }

export interface Article {
  slug: string
  title: string
  description: string
  publishedAt: string
  displayDate: string
  tags: string[]
  featured: boolean
  readingMinutes: number
  icon?: SiteIcon
  cover?: string
  sourceUrl?: string
  sourceLabel?: string
  headings: ArticleHeading[]
  blocks: ArticleBlock[]
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

const articleAssets = import.meta.glob('../../assets/images/articles/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

function resolveImage(source = '') {
  const value = source.trim().replace(/^['"]|['"]$/g, '')

  if (!value) return undefined
  if (/^(?:https?:|data:|\/)/.test(value)) return value

  const filename = value.split('/').at(-1)
  const asset = Object.entries(articleAssets).find(([path]) => path.endsWith(`/${filename}`))
  return asset?.[1] ?? value
}

function parseFrontmatter(source: string) {
  const match = source.replaceAll('\r\n', '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  const attributes: Record<string, string> = {}

  for (const line of (match?.[1] ?? '').split('\n')) {
    const separator = line.indexOf(':')

    if (separator === -1) continue

    attributes[line.slice(0, separator).trim()] = line.slice(separator + 1).trim()
  }

  return { attributes, body: match?.[2] ?? source }
}

function parseTags(value = '') {
  return value
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function isBlockStart(line: string) {
  return /^(#{1,4} |-|> |```|!\[)/.test(line)
}

function parseBlocks(markdown: string): ArticleBlock[] {
  const lines = markdown.replaceAll('\r\n', '\n').split('\n')
  const blocks: ArticleBlock[] = []
  const headingIds = new Map<string, number>()
  let index = 0

  function createHeadingId(text: string) {
    const base =
      text
        .normalize('NFKC')
        .toLocaleLowerCase('zh-CN')
        .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
        .replace(/^-|-$/g, '') || 'section'
    const count = headingIds.get(base) ?? 0
    headingIds.set(base, count + 1)
    return count === 0 ? `heading-${base}` : `heading-${base}-${count + 1}`
  }

  while (index < lines.length) {
    const line = (lines[index] ?? '').trim()

    if (!line) {
      index += 1
      continue
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/)

    if (heading) {
      const text = heading[2] ?? ''
      blocks.push({
        type: 'heading',
        level: heading[1]?.length as ArticleHeadingLevel,
        text,
        id: createHeadingId(text),
      })
      index += 1
      continue
    }

    if (line.startsWith('> ')) {
      const quoteLines: string[] = []

      while ((lines[index] ?? '').trim().startsWith('> ')) {
        quoteLines.push((lines[index] ?? '').trim().slice(2))
        index += 1
      }

      blocks.push({ type: 'quote', text: quoteLines.join(' ') })
      continue
    }

    if (line.startsWith('- ')) {
      const items: string[] = []

      while ((lines[index] ?? '').trim().startsWith('- ')) {
        items.push((lines[index] ?? '').trim().slice(2))
        index += 1
      }

      blocks.push({ type: 'list', items })
      continue
    }

    if (line.startsWith('```')) {
      const language = line.slice(3).trim()
      const code: string[] = []
      index += 1

      while (index < lines.length && !(lines[index] ?? '').trim().startsWith('```')) {
        code.push(lines[index] ?? '')
        index += 1
      }

      index += 1
      blocks.push({ type: 'code', language, content: code.join('\n') })
      continue
    }

    const image = line.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)$/)

    if (image) {
      const src = resolveImage(image[2])
      if (src) blocks.push({ type: 'image', src, alt: image[1] ?? '' })
      index += 1
      continue
    }

    const paragraph: string[] = [line]
    index += 1

    while (index < lines.length) {
      const nextLine = (lines[index] ?? '').trim()
      if (!nextLine || isBlockStart(nextLine)) break
      paragraph.push(nextLine)
      index += 1
    }

    blocks.push({ type: 'paragraph', text: paragraph.join(' ') })
  }

  return blocks
}

function estimateReadingMinutes(body: string) {
  const latinWords = body.match(/[a-zA-Z0-9]+/g)?.length ?? 0
  const cjkCharacters = body.match(/[\u3400-\u9fff]/g)?.length ?? 0

  return Math.max(1, Math.ceil((latinWords + cjkCharacters) / 300))
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

export const articles: Article[] = Object.entries(articleFiles)
  .map(([path, source]) => {
    const { attributes, body } = parseFrontmatter(source)
    const slug = path.split('/').at(-1)?.replace(/\.md$/, '') ?? ''
    const publishedAt = attributes.date ?? new Date().toISOString().slice(0, 10)
    const firstImage = body.match(/!\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/)?.[1]
    const icon = attributes.icon && isSiteIcon(attributes.icon) ? attributes.icon : undefined
    const title = attributes.title ?? slug
    const blocks = parseBlocks(body)
    const headings: ArticleHeading[] = [
      { level: 1, text: title, id: 'article-title' },
      ...blocks.flatMap((block) =>
        block.type === 'heading'
          ? [{ level: block.level, text: block.text, id: block.id }]
          : [],
      ),
    ]

    return {
      slug,
      title,
      description: attributes.description ?? '',
      publishedAt,
      displayDate: formatDate(publishedAt),
      tags: parseTags(attributes.tags),
      featured: attributes.featured === 'true',
      readingMinutes: estimateReadingMinutes(body),
      icon,
      cover: resolveImage(attributes.cover) ?? resolveImage(firstImage),
      sourceUrl: attributes.sourceUrl,
      sourceLabel: attributes.sourceLabel,
      headings,
      blocks,
    }
  })
  .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))

export function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug)
}

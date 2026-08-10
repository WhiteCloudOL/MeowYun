import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import powershell from 'highlight.js/lib/languages/powershell'
import python from 'highlight.js/lib/languages/python'
import rust from 'highlight.js/lib/languages/rust'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'
import MarkdownIt from 'markdown-it'
import type { Token } from 'markdown-it'
import taskLists from 'markdown-it-task-lists'
import type { ArticleHeadingLevel } from '@/config/schema'
import { isSiteIcon, type SiteIcon } from '@/types/icon'

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
  readingMinutes: number
  icon?: SiteIcon
  cover?: string
  sourceUrl?: string
  sourceLabel?: string
  headings: ArticleHeading[]
  contentHtml: string
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

const articleAssets = import.meta.glob('../../assets/images/articles/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

// 只注册站内技术文章常用的语言，避免引入 Highlight.js 的完整语言集合。
const highlightLanguages = {
  bash,
  css,
  dockerfile,
  javascript,
  json,
  powershell,
  python,
  rust,
  typescript,
  xml,
  yaml,
}

for (const [name, grammar] of Object.entries(highlightLanguages)) {
  hljs.registerLanguage(name, grammar)
}

hljs.registerAliases(['sh', 'shell'], { languageName: 'bash' })
hljs.registerAliases(['js'], { languageName: 'javascript' })
hljs.registerAliases(['ts'], { languageName: 'typescript' })
hljs.registerAliases(['html', 'vue'], { languageName: 'xml' })
hljs.registerAliases(['yml'], { languageName: 'yaml' })

const markdown = new MarkdownIt({
  // 文章来自仓库，但仍禁用原始 HTML，避免日后接入外部内容时扩大攻击面。
  html: false,
  linkify: true,
  typographer: true,
  breaks: false,
})

markdown.use(taskLists, { enabled: false, label: true, labelAfter: true })

markdown.renderer.rules.fence = (tokens, index) => {
  const token = tokens[index]
  if (!token) return ''

  const language = token.info.trim().split(/\s+/)[0]?.toLocaleLowerCase() ?? ''
  const canHighlight = language && hljs.getLanguage(language)
  const highlighted = canHighlight
    ? hljs.highlight(token.content, { language, ignoreIllegals: true }).value
    : markdown.utils.escapeHtml(token.content)
  const languageLabel = markdown.utils.escapeHtml(language || 'text')

  return `<div class="markdown-code">
    <div class="markdown-code__toolbar">
      <span>${languageLabel}</span>
      <button type="button" class="markdown-code__copy" data-code-copy aria-label="复制代码">复制</button>
    </div>
    <pre><code class="hljs${language ? ` language-${languageLabel}` : ''}">${highlighted}</code></pre>
  </div>`
}

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

function createHeadingId(text: string, ids: Map<string, number>) {
  const base =
    text
      .normalize('NFKC')
      .toLocaleLowerCase('zh-CN')
      .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
      .replace(/^-|-$/g, '') || 'section'
  const count = ids.get(base) ?? 0
  ids.set(base, count + 1)
  return count === 0 ? `heading-${base}` : `heading-${base}-${count + 1}`
}

function prepareTokens(tokens: Token[]) {
  const headings: ArticleHeading[] = []
  const headingIds = new Map<string, number>()

  const visit = (items: Token[]) => {
    for (let index = 0; index < items.length; index += 1) {
      const token = items[index]
      if (!token) continue

      if (token.type === 'heading_open') {
        const inline = items[index + 1]
        const level = Number(token.tag.slice(1)) as ArticleHeadingLevel
        const text = inline?.type === 'inline' ? inline.content : ''
        const id = createHeadingId(text, headingIds)
        token.attrSet('id', id)
        headings.push({ level, text, id })
      }

      // 本地相对图片通过 Vite 资源图谱解析；远程地址和站点根路径保持原样。
      if (token.type === 'image') {
        const source = token.attrGet('src')
        const resolved = resolveImage(String(source ?? ''))
        if (resolved) token.attrSet('src', resolved)
        token.attrSet('loading', 'lazy')
      }

      if (token.type === 'link_open') {
        const href = String(token.attrGet('href') ?? '')
        if (/^https?:\/\//.test(href)) {
          token.attrSet('target', '_blank')
          token.attrSet('rel', 'noopener noreferrer')
        }
      }

      if (token.children) visit(token.children)
    }
  }

  visit(tokens)
  return headings
}

function renderMarkdown(body: string) {
  const tokens = markdown.parse(body, {})
  const headings = prepareTokens(tokens)

  return {
    headings,
    html: markdown.renderer.render(tokens, markdown.options, {}),
  }
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

function plainText(markdownSource: string) {
  return markdownSource
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~|\-[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export const articles: Article[] = Object.entries(articleFiles)
  .map(([path, source]) => {
    const { attributes, body } = parseFrontmatter(source)
    const slug = path.split('/').at(-1)?.replace(/\.md$/, '') ?? ''
    const publishedAt = attributes.date ?? new Date().toISOString().slice(0, 10)
    const updatedAt = attributes.updated || undefined
    const firstImage = body.match(/!\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/)?.[1]
    const icon = attributes.icon && isSiteIcon(attributes.icon) ? attributes.icon : undefined
    const title = attributes.title ?? slug
    const rendered = renderMarkdown(body)

    return {
      slug,
      title,
      description: attributes.description ?? '',
      publishedAt,
      updatedAt,
      displayDate: formatDate(publishedAt),
      displayUpdatedAt: updatedAt ? formatDate(updatedAt) : undefined,
      tags: parseTags(attributes.tags),
      featured: attributes.featured === 'true',
      readingMinutes: estimateReadingMinutes(body),
      icon,
      cover: resolveImage(attributes.cover) ?? resolveImage(firstImage),
      sourceUrl: attributes.sourceUrl,
      sourceLabel: attributes.sourceLabel,
      headings: [
        { level: 1 as ArticleHeadingLevel, text: title, id: 'article-title' },
        ...rendered.headings,
      ],
      contentHtml: rendered.html,
      searchText: `${title} ${attributes.description ?? ''} ${plainText(body)}`.toLocaleLowerCase(
        'zh-CN',
      ),
    }
  })
  .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))

export function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug)
}

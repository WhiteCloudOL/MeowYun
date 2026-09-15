import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import c from 'highlight.js/lib/languages/c'
import cmake from 'highlight.js/lib/languages/cmake'
import cpp from 'highlight.js/lib/languages/cpp'
import css from 'highlight.js/lib/languages/css'
import csharp from 'highlight.js/lib/languages/csharp'
import dart from 'highlight.js/lib/languages/dart'
import diff from 'highlight.js/lib/languages/diff'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import dos from 'highlight.js/lib/languages/dos'
import go from 'highlight.js/lib/languages/go'
import graphql from 'highlight.js/lib/languages/graphql'
import http from 'highlight.js/lib/languages/http'
import ini from 'highlight.js/lib/languages/ini'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import kotlin from 'highlight.js/lib/languages/kotlin'
import less from 'highlight.js/lib/languages/less'
import lua from 'highlight.js/lib/languages/lua'
import makefile from 'highlight.js/lib/languages/makefile'
import markdownLanguage from 'highlight.js/lib/languages/markdown'
import nginx from 'highlight.js/lib/languages/nginx'
import objectivec from 'highlight.js/lib/languages/objectivec'
import perl from 'highlight.js/lib/languages/perl'
import php from 'highlight.js/lib/languages/php'
import plaintext from 'highlight.js/lib/languages/plaintext'
import powershell from 'highlight.js/lib/languages/powershell'
import properties from 'highlight.js/lib/languages/properties'
import protobuf from 'highlight.js/lib/languages/protobuf'
import python from 'highlight.js/lib/languages/python'
import rLanguage from 'highlight.js/lib/languages/r'
import ruby from 'highlight.js/lib/languages/ruby'
import rust from 'highlight.js/lib/languages/rust'
import scala from 'highlight.js/lib/languages/scala'
import scss from 'highlight.js/lib/languages/scss'
import sql from 'highlight.js/lib/languages/sql'
import swift from 'highlight.js/lib/languages/swift'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'
import MarkdownIt from 'markdown-it'
import type { Token } from 'markdown-it'
import taskLists from 'markdown-it-task-lists'
import type { ArticleHeadingLevel } from '@/config/schema'

import type { ArticleHeading } from './index'
import { resolveImage } from './assets'

// 按需注册主流语言与常见配置格式，兼顾覆盖范围和文章页包体积。
const highlightLanguages = {
  bash,
  c,
  cmake,
  cpp,
  css,
  csharp,
  dart,
  diff,
  dockerfile,
  dos,
  go,
  graphql,
  http,
  ini,
  java,
  javascript,
  json,
  kotlin,
  less,
  lua,
  makefile,
  markdown: markdownLanguage,
  nginx,
  objectivec,
  perl,
  php,
  plaintext,
  powershell,
  properties,
  protobuf,
  python,
  r: rLanguage,
  ruby,
  rust,
  scala,
  scss,
  sql,
  swift,
  typescript,
  xml,
  yaml,
}

for (const [name, grammar] of Object.entries(highlightLanguages)) {
  hljs.registerLanguage(name, grammar)
}

hljs.registerAliases(['sh', 'shell'], { languageName: 'bash' })
hljs.registerAliases(['bat', 'batch', 'cmd'], { languageName: 'dos' })
hljs.registerAliases(['c++', 'hpp'], { languageName: 'cpp' })
hljs.registerAliases(['cs', 'dotnet'], { languageName: 'csharp' })
hljs.registerAliases(['js'], { languageName: 'javascript' })
hljs.registerAliases(['kt', 'kts'], { languageName: 'kotlin' })
hljs.registerAliases(['md'], { languageName: 'markdown' })
hljs.registerAliases(['objc'], { languageName: 'objectivec' })
hljs.registerAliases(['ps1'], { languageName: 'powershell' })
hljs.registerAliases(['rb'], { languageName: 'ruby' })
hljs.registerAliases(['toml'], { languageName: 'ini' })
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

export function renderMarkdown(body: string) {
  const tokens = markdown.parse(body, {})
  const headings = prepareTokens(tokens)

  return {
    headings,
    html: markdown.renderer.render(tokens, markdown.options, {}),
  }
}

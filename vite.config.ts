import { fileURLToPath, URL } from 'node:url'
import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import vueDevTools from 'vite-plugin-vue-devtools'

const projectPath = (path: string) => fileURLToPath(new URL(path, import.meta.url))

function readSiteUrl() {
  const sources = ['./src/config/site.ts', './src/config/site.example.ts']

  for (const source of sources) {
    try {
      const config = readFileSync(projectPath(source), 'utf8')
      const siteUrl = config.match(/siteUrl:\s*['"]([^'"]+)['"]/)?.[1]
      if (siteUrl) return siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`
    } catch {
      // The example config remains available before the private site config is created.
    }
  }

  return 'https://example.com/'
}

function readRedirectPaths() {
  const sources = ['./src/config/site.ts', './src/config/site.example.ts']

  for (const source of sources) {
    try {
      const config = readFileSync(projectPath(source), 'utf8')
      const redirects = config.match(/redirects:\s*\[([\s\S]*?)\r?\n\s*\],\r?\n\s*profile:/)?.[1]
      if (!redirects) continue

      return [...redirects.matchAll(/path:\s*['"]([^'"]+)['"][\s\S]*?enabled:\s*true/g)].map(
        (match) => match[1],
      )
    } catch {
      // The example config remains available before the private site config is created.
    }
  }

  return []
}

interface ArticleMetadata {
  slug: string
  title: string
  description: string
  date: string
  updated?: string
  tags: string[]
}

interface RouteSeo {
  path: string
  title: string
  description: string
  type?: 'website' | 'article'
  publishedAt?: string
  updatedAt?: string
  tags?: string[]
  noIndex?: boolean
}

function readSiteString(key: string, fallback: string) {
  const sources = ['./src/config/site.ts', './src/config/site.example.ts']

  for (const source of sources) {
    try {
      const config = readFileSync(projectPath(source), 'utf8')
      const value = config.match(new RegExp(`${key}:\\s*['"]([^'"]+)['"]`))?.[1]
      if (value) return value
    } catch {
      // 本地配置缺失时继续读取可提交的示例配置。
    }
  }

  return fallback
}

function readArticleMetadata(): ArticleMetadata[] {
  const articleDirectory = projectPath('./src/content/articles')

  return readdirSync(articleDirectory)
    .filter((filename) => filename.endsWith('.md'))
    .map((filename) => {
      const source = readFileSync(join(articleDirectory, filename), 'utf8')
      const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? ''
      const value = (key: string) =>
        frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]?.trim() ?? ''

      return {
        slug: filename.replace(/\.md$/, ''),
        title: value('title') || filename.replace(/\.md$/, ''),
        description: value('description'),
        date: value('date') || new Date().toISOString().slice(0, 10),
        updated: value('updated') || undefined,
        tags: value('tags')
          .replace(/^\[|\]$/g, '')
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      }
    })
    .sort((left, right) => right.date.localeCompare(left.date))
}

function replaceMeta(html: string, attribute: 'name' | 'property', key: string, content: string) {
  const tag = `<meta ${attribute}="${key}" content="${escapeXml(content)}" />`
  const pattern = new RegExp(`<meta\\s+${attribute}="${key}"[\\s\\S]*?>`, 'i')
  return pattern.test(html)
    ? html.replace(pattern, tag)
    : html.replace('</head>', `    ${tag}\n  </head>`)
}

function renderRouteHtml(baseHtml: string, seo: RouteSeo) {
  const siteUrl = readSiteUrl()
  const siteName = readSiteString('name', 'MeowYunCN')
  const imageUrl = new URL(readSiteString('ogImage', '/og-card.webp'), siteUrl).toString()
  const pageUrl = new URL(seo.path.replace(/^\//, ''), siteUrl).toString()
  const canonical = `<link rel="canonical" href="${escapeXml(pageUrl)}" />`
  let html = baseHtml
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeXml(seo.title)}</title>`)
    .replace(/<link rel="canonical"[^>]*>/i, canonical)

  const metadata: Array<['name' | 'property', string, string]> = [
    ['name', 'description', seo.description],
    ['name', 'robots', seo.noIndex ? 'noindex, nofollow' : 'index, follow'],
    ['property', 'og:type', seo.type ?? 'website'],
    ['property', 'og:site_name', siteName],
    ['property', 'og:title', seo.title],
    ['property', 'og:description', seo.description],
    ['property', 'og:url', pageUrl],
    ['property', 'og:image', imageUrl],
    ['name', 'twitter:title', seo.title],
    ['name', 'twitter:description', seo.description],
    ['name', 'twitter:image', imageUrl],
  ]

  for (const [attribute, key, content] of metadata)
    html = replaceMeta(html, attribute, key, content)

  if (seo.type === 'article') {
    const articleMeta = [
      seo.publishedAt
        ? `<meta property="article:published_time" content="${escapeXml(seo.publishedAt)}" />`
        : '',
      seo.updatedAt
        ? `<meta property="article:modified_time" content="${escapeXml(seo.updatedAt)}" />`
        : '',
      ...(seo.tags ?? []).map(
        (tag) => `<meta property="article:tag" content="${escapeXml(tag)}" />`,
      ),
    ]
      .filter(Boolean)
      .join('\n    ')
    const structuredData = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: seo.title,
      description: seo.description,
      url: pageUrl,
      image: imageUrl,
      datePublished: seo.publishedAt,
      dateModified: seo.updatedAt ?? seo.publishedAt,
      keywords: seo.tags,
      inLanguage: 'zh-CN',
      author: { '@type': 'Person', name: siteName, url: siteUrl },
    }).replaceAll('</', '<\\/')

    html = html.replace(
      '</head>',
      `    ${articleMeta}\n    <script id="site-structured-data" type="application/ld+json">${structuredData}</script>\n  </head>`,
    )
  }

  return html
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function renderRssFeed() {
  const siteUrl = readSiteUrl()
  const siteName = readSiteString('name', 'MeowYunCN')
  const description = readSiteString('description', '个人主页与技术文章')
  const items = readArticleMetadata()
    .map((article) => {
      const articleUrl = new URL(`articles/${article.slug}`, siteUrl).toString()
      const categories = article.tags
        .map((tag) => `      <category>${escapeXml(tag)}</category>`)
        .join('\n')

      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(articleUrl)}</link>
      <guid isPermaLink="true">${escapeXml(articleUrl)}</guid>
      <description>${escapeXml(article.description)}</description>
      <pubDate>${new Date(`${article.date}T00:00:00Z`).toUTCString()}</pubDate>
${categories}
    </item>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(description)}</description>
    <language>zh-CN</language>
    <atom:link href="${escapeXml(new URL('rss.xml', siteUrl).toString())}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`
}

function seoFilesPlugin(): Plugin {
  return {
    name: 'meowyun-seo-files',
    configureServer(server) {
      // 开发环境也提供真实 RSS，避免页面上的订阅入口只能在生产构建后验证。
      server.middlewares.use('/rss.xml', (_request, response) => {
        response.statusCode = 200
        response.setHeader('Content-Type', 'application/rss+xml; charset=utf-8')
        response.end(renderRssFeed())
      })
    },
    closeBundle() {
      const siteUrl = readSiteUrl()
      const outputDirectory = projectPath('./dist')
      const today = new Date().toISOString().slice(0, 10)
      const articleMetadata = readArticleMetadata()
      const staticPages = [
        { path: '', priority: '1.0', changefreq: 'weekly', lastmod: today },
        { path: 'articles', priority: '0.9', changefreq: 'weekly', lastmod: today },
        { path: 'navigation', priority: '0.8', changefreq: 'monthly', lastmod: today },
        { path: 'friends', priority: '0.7', changefreq: 'monthly', lastmod: today },
      ]
      const articlePages = articleMetadata.map((article) => ({
        path: `articles/${article.slug}`,
        priority: '0.8',
        changefreq: 'monthly',
        lastmod: article.date,
      }))
      const tagPages = [...new Set(articleMetadata.flatMap((article) => article.tags))].map(
        (tag) => ({
          path: `articles/tags/${tag}`,
          priority: '0.6',
          changefreq: 'weekly',
          lastmod: today,
        }),
      )
      const entries = [...staticPages, ...articlePages, ...tagPages]
        .map(
          (page) => `  <url>
    <loc>${escapeXml(new URL(page.path, siteUrl).toString())}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
        )
        .join('\n')
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`
      const robots = `User-agent: *
Allow: /

Sitemap: ${new URL('sitemap.xml', siteUrl)}
`

      mkdirSync(outputDirectory, { recursive: true })
      writeFileSync(join(outputDirectory, 'sitemap.xml'), sitemap)
      writeFileSync(join(outputDirectory, 'robots.txt'), robots)
      writeFileSync(join(outputDirectory, 'rss.xml'), renderRssFeed())
    },
  }
}

function deploymentFilesPlugin(): Plugin {
  return {
    name: 'meowyun-deployment-files',
    apply: 'build',
    closeBundle() {
      const outputDirectory = projectPath('./dist')
      const entryFile = join(outputDirectory, 'index.html')
      const baseHtml = readFileSync(entryFile, 'utf8')
      const articleMetadata = readArticleMetadata()
      const siteName = readSiteString('name', 'MeowYunCN')
      const routes: RouteSeo[] = [
        {
          path: '/articles',
          title: `文章 · ${siteName}`,
          description: 'QQ 机器人、Minecraft 服务端、开源工具与部署运维笔记。',
        },
        {
          path: '/navigation',
          title: `导航 · ${siteName}`,
          description: `${siteName}的文档、服务状态、开源项目与常用入口。`,
        },
        {
          path: '/friends',
          title: `友链 · ${siteName}`,
          description: `${siteName}的友链花园与友链交换方式。`,
        },
        ...articleMetadata.map((article) => ({
          path: `/articles/${article.slug}`,
          title: `${article.title} · ${siteName}`,
          description: article.description,
          type: 'article' as const,
          publishedAt: article.date,
          updatedAt: article.updated,
          tags: article.tags,
        })),
        ...[...new Set(articleMetadata.flatMap((article) => article.tags))].map((tag) => ({
          path: `/articles/tags/${tag}`,
          title: `#${tag} 文章 · ${siteName}`,
          description: `浏览与 ${tag} 相关的技术文章、实践记录与开发笔记。`,
          tags: [tag],
        })),
        ...readRedirectPaths().map((path) => ({
          path,
          title: `正在跳转 · ${siteName}`,
          description: '正在前往外部页面。',
          noIndex: true,
        })),
      ]

      copyFileSync(projectPath('./edgeone.json'), join(outputDirectory, 'edgeone.json'))
      writeFileSync(
        join(outputDirectory, '404.html'),
        renderRouteHtml(baseHtml, {
          path: '/404',
          title: `页面未找到 · ${siteName}`,
          description: '请求的页面不存在或已经移动。',
          noIndex: true,
        }),
      )

      // 为每个可直达路由生成带独立 Meta 的入口，同时仍由 Vue 接管后续交互。
      for (const route of routes) {
        const routeDirectory = join(outputDirectory, ...route.path.split('/').filter(Boolean))
        mkdirSync(routeDirectory, { recursive: true })
        writeFileSync(join(routeDirectory, 'index.html'), renderRouteHtml(baseHtml, route))
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), vue(), vueDevTools(), seoFilesPlugin(), deploymentFilesPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})

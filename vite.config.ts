import { fileURLToPath, URL } from 'node:url'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, resolve } from 'node:path'

import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import { readPublicSiteConfig } from './build/siteConfig.ts'
import { parseArticleSource } from './src/utils/articleMetadata.ts'
import { archiveSeo, indexSeo, redirectSeo } from './src/utils/routeSeo.ts'

const projectPath = (path: string) => fileURLToPath(new URL(path, import.meta.url))

function readSiteUrl() {
  return readConfig().siteUrl
}

function readConfig() {
  // 私有配置仅在不存在时回退模板；语法或字段错误不能被吞掉后生成错误域名。
  const path = projectPath(
    existsSync(projectPath('./src/config/site.ts'))
      ? './src/config/site.ts'
      : './src/config/site.example.ts',
  )
  return readPublicSiteConfig(readFileSync(path, 'utf8'))
}

function readRedirectPaths() {
  return readConfig().redirects
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
  return readConfig().text(key, fallback)
}

function readArticleMetadata(): ArticleMetadata[] {
  const articleDirectory = projectPath('./src/content/articles')

  return readdirSync(articleDirectory)
    .filter((filename) => filename.endsWith('.md'))
    .map((filename) => {
      const source = readFileSync(join(articleDirectory, filename), 'utf8')
      const { attributes, tags } = parseArticleSource(source, filename)
      const value = (key: string) => attributes[key] ?? ''

      return {
        slug: filename.replace(/\.md$/, ''),
        title: value('title') || filename.replace(/\.md$/, ''),
        description: value('description'),
        date: value('date'),
        updated: value('updated') || undefined,
        tags,
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
    .replace(/<script\b[^>]*id="site-structured-data"[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<meta\s+property="article:[^"]+"[^>]*>/gi, '')
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeXml(seo.title)}</title>`)
    .replace(/<link rel="canonical"[^>]*>/i, canonical)

  const metadata: Array<['name' | 'property', string, string]> = [
    ['name', 'description', seo.description],
    ['name', 'keywords', seo.tags?.join(',') ?? readSiteString('keywords', '')],
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
  let outputDirectory = projectPath('./dist')
  let building = false
  return {
    name: 'meowyun-seo-files',
    configResolved(config) {
      outputDirectory = resolve(config.root, config.build.outDir)
      building = config.command === 'build'
    },
    configureServer(server) {
      // 开发环境也提供真实 RSS，避免页面上的订阅入口只能在生产构建后验证。
      server.middlewares.use('/rss.xml', (_request, response) => {
        response.statusCode = 200
        response.setHeader('Content-Type', 'application/rss+xml; charset=utf-8')
        response.end(renderRssFeed())
      })
    },
    closeBundle() {
      if (!building) return
      const siteUrl = readSiteUrl()
      const articleMetadata = readArticleMetadata()
      const staticPages = [
        { path: '', priority: '1.0', changefreq: 'weekly', lastmod: '' },
        { path: 'articles', priority: '0.9', changefreq: 'weekly', lastmod: '' },
        { path: 'navigation', priority: '0.8', changefreq: 'monthly', lastmod: '' },
        { path: 'friends', priority: '0.7', changefreq: 'monthly', lastmod: '' },
      ]
      const articlePages = articleMetadata.map((article) => ({
        path: `articles/${article.slug}`,
        priority: '0.8',
        changefreq: 'monthly',
        lastmod: article.updated ?? article.date,
      }))
      const tagPages = [...new Set(articleMetadata.flatMap((article) => article.tags))].map(
        (tag) => ({
          path: `articles/tags/${tag}`,
          priority: '0.6',
          changefreq: 'weekly',
          lastmod: '',
        }),
      )
      const entries = [...staticPages, ...articlePages, ...tagPages]
        .map(
          (page) => `  <url>
    <loc>${escapeXml(new URL(page.path, siteUrl).toString())}</loc>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
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
  let outputDirectory = projectPath('./dist')
  let building = false
  return {
    name: 'meowyun-deployment-files',
    configResolved(config) {
      outputDirectory = resolve(config.root, config.build.outDir)
      building = config.command === 'build'
    },
    transformIndexHtml(html) {
      return renderRouteHtml(html, {
        path: '/',
        title: readSiteString('title', '个人主页'),
        description: readSiteString('description', ''),
      })
    },
    closeBundle() {
      if (!building) return
      const entryFile = join(outputDirectory, 'index.html')
      const baseHtml = readFileSync(entryFile, 'utf8')
      const articleMetadata = readArticleMetadata()
      const siteName = readSiteString('name', 'MeowYunCN')
      const routes: RouteSeo[] = [
        {
          path: '/articles',
          ...archiveSeo(siteName),
        },
        {
          path: '/navigation',
          ...indexSeo(siteName, 'navigation'),
        },
        {
          path: '/friends',
          ...indexSeo(siteName, 'friends'),
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
          ...archiveSeo(siteName, tag),
          tags: [tag],
        })),
        ...readRedirectPaths().map((path) => ({
          path,
          ...redirectSeo(siteName),
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
        // clean URL 托管/preview 会优先尝试同名 .html；同时保留目录入口供带斜杠直达。
        const cleanEntry = join(outputDirectory, route.path.slice(1) + '.html')
        mkdirSync(dirname(cleanEntry), { recursive: true })
        writeFileSync(cleanEntry, renderRouteHtml(baseHtml, route))
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

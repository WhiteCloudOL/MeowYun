import { fileURLToPath, URL } from 'node:url'
import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
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
  tags: string[]
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
        tags: value('tags')
          .replace(/^\[|\]$/g, '')
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      }
    })
    .sort((left, right) => right.date.localeCompare(left.date))
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
      const articleMetadata = readArticleMetadata()
      const articleRoutes = articleMetadata.map((article) => `/articles/${article.slug}`)
      const tagRoutes = [...new Set(articleMetadata.flatMap((article) => article.tags))].map(
        (tag) => `/articles/tags/${tag}`,
      )
      const routes = [
        '/articles',
        '/navigation',
        '/friends',
        ...articleRoutes,
        ...tagRoutes,
        ...readRedirectPaths(),
      ]

      copyFileSync(projectPath('./edgeone.json'), join(outputDirectory, 'edgeone.json'))
      copyFileSync(entryFile, join(outputDirectory, '404.html'))

      for (const route of new Set(routes)) {
        const routeDirectory = join(outputDirectory, ...route.split('/').filter(Boolean))
        mkdirSync(routeDirectory, { recursive: true })
        copyFileSync(entryFile, join(routeDirectory, 'index.html'))
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), seoFilesPlugin(), deploymentFilesPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})

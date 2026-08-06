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
      const redirects = config.match(
        /redirects:\s*\[([\s\S]*?)\r?\n\s*\],\r?\n\s*profile:/,
      )?.[1]
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

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function seoFilesPlugin(): Plugin {
  return {
    name: 'meowyun-seo-files',
    apply: 'build',
    closeBundle() {
      const siteUrl = readSiteUrl()
      const outputDirectory = projectPath('./dist')
      const articleDirectory = projectPath('./src/content/articles')
      const today = new Date().toISOString().slice(0, 10)
      const staticPages = [
        { path: '', priority: '1.0', changefreq: 'weekly', lastmod: today },
        { path: 'articles', priority: '0.9', changefreq: 'weekly', lastmod: today },
        { path: 'navigation', priority: '0.8', changefreq: 'monthly', lastmod: today },
        { path: 'friends', priority: '0.7', changefreq: 'monthly', lastmod: today },
      ]
      const articlePages = readdirSync(articleDirectory)
        .filter((filename) => filename.endsWith('.md'))
        .map((filename) => {
          const source = readFileSync(join(articleDirectory, filename), 'utf8')
          const publishedAt = source.match(/^date:\s*(\d{4}-\d{2}-\d{2})$/m)?.[1] ?? today

          return {
            path: `articles/${filename.replace(/\.md$/, '')}`,
            priority: '0.8',
            changefreq: 'monthly',
            lastmod: publishedAt,
          }
        })
      const entries = [...staticPages, ...articlePages]
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
      const articleDirectory = projectPath('./src/content/articles')
      const articleRoutes = readdirSync(articleDirectory)
        .filter((filename) => filename.endsWith('.md'))
        .map((filename) => `/articles/${filename.replace(/\.md$/, '')}`)
      const routes = [
        '/articles',
        '/navigation',
        '/friends',
        ...articleRoutes,
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
  plugins: [
    vue(),
    vueDevTools(),
    seoFilesPlugin(),
    deploymentFilesPlugin(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})

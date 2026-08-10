import { siteConfig } from '@/config/site'

export interface SeoOptions {
  title?: string
  description?: string
  path?: string
  type?: 'website' | 'article'
  image?: string
  publishedAt?: string
  updatedAt?: string
  tags?: string[]
  noIndex?: boolean
}

function setMeta(attribute: 'name' | 'property', key: string, content?: string) {
  const selector = `meta[${attribute}="${key}"]`
  let element = document.head.querySelector<HTMLMetaElement>(selector)

  if (!content) {
    element?.remove()
    return
  }

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.append(element)
  }

  element.content = content
}

function setCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')

  if (!element) {
    element = document.createElement('link')
    element.rel = 'canonical'
    document.head.append(element)
  }

  element.href = href
}

function absoluteUrl(value: string) {
  try {
    return new URL(value, siteConfig.meta.siteUrl).toString()
  } catch {
    return value
  }
}

function updateStructuredData(pageUrl: string, options: SeoOptions, imageUrl: string) {
  const id = 'site-structured-data'
  let script = document.head.querySelector<HTMLScriptElement>(`#${id}`)

  if (!script) {
    script = document.createElement('script')
    script.id = id
    script.type = 'application/ld+json'
    document.head.append(script)
  }

  const graph: Array<Record<string, unknown>> = [
    {
      '@type': 'WebSite',
      '@id': `${siteConfig.meta.siteUrl}#website`,
      url: siteConfig.meta.siteUrl,
      name: siteConfig.meta.name,
      description: siteConfig.meta.description,
      inLanguage: 'zh-CN',
    },
    {
      '@type': 'Person',
      '@id': `${siteConfig.meta.siteUrl}#person`,
      name: siteConfig.profile.name,
      url: siteConfig.meta.siteUrl,
      image: absoluteUrl(siteConfig.profile.avatar),
      sameAs: siteConfig.profile.socials
        .filter((item) => item.enabled && /^https?:/.test(item.href))
        .map((item) => item.href),
    },
  ]

  if (options.type === 'article') {
    graph.push({
      '@type': 'BlogPosting',
      '@id': `${pageUrl}#article`,
      headline: options.title,
      description: options.description,
      url: pageUrl,
      image: imageUrl,
      datePublished: options.publishedAt,
      dateModified: options.updatedAt ?? options.publishedAt,
      keywords: options.tags,
      inLanguage: 'zh-CN',
      author: { '@id': `${siteConfig.meta.siteUrl}#person` },
      publisher: { '@id': `${siteConfig.meta.siteUrl}#person` },
      isPartOf: { '@id': `${siteConfig.meta.siteUrl}#website` },
    })
  }

  script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
}

export function updateSeo(options: SeoOptions = {}) {
  const title = options.title ?? siteConfig.meta.title
  const description = options.description ?? siteConfig.meta.description
  const pageUrl = absoluteUrl(options.path ?? window.location.pathname)
  const imageUrl = absoluteUrl(options.image ?? siteConfig.meta.ogImage)
  const robots = options.noIndex ? 'noindex, nofollow' : 'index, follow'

  document.title = title
  document.documentElement.lang = 'zh-CN'
  setCanonical(pageUrl)
  setMeta('name', 'description', description)
  setMeta('name', 'keywords', options.tags?.join(',') ?? siteConfig.meta.keywords)
  setMeta('name', 'robots', robots)
  setMeta('property', 'og:locale', 'zh_CN')
  setMeta('property', 'og:type', options.type ?? 'website')
  setMeta('property', 'og:site_name', siteConfig.meta.name)
  setMeta('property', 'og:title', title)
  setMeta('property', 'og:description', description)
  setMeta('property', 'og:url', pageUrl)
  setMeta('property', 'og:image', imageUrl)
  setMeta('property', 'article:published_time', options.publishedAt)
  setMeta('property', 'article:modified_time', options.updatedAt)
  setMeta('property', 'article:section', options.tags?.[0])
  setMeta('name', 'twitter:card', 'summary_large_image')
  setMeta('name', 'twitter:title', title)
  setMeta('name', 'twitter:description', description)
  setMeta('name', 'twitter:image', imageUrl)
  updateStructuredData(pageUrl, options, imageUrl)
}

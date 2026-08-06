import { siteConfig } from '@/config/site'

interface SeoOptions {
  title?: string
  description?: string
  path?: string
  type?: 'website' | 'article'
  noIndex?: boolean
}

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)

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

function updateStructuredData(pageUrl: string) {
  const id = 'site-structured-data'
  let script = document.head.querySelector<HTMLScriptElement>(`#${id}`)

  if (!script) {
    script = document.createElement('script')
    script.id = id
    script.type = 'application/ld+json'
    document.head.append(script)
  }

  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
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
        url: pageUrl,
        image: absoluteUrl(siteConfig.profile.avatar),
        sameAs: siteConfig.profile.socials
          .filter((item) => item.enabled && /^https?:/.test(item.href))
          .map((item) => item.href),
      },
    ],
  })
}

export function updateSeo(options: SeoOptions = {}) {
  const title = options.title ?? siteConfig.meta.title
  const description = options.description ?? siteConfig.meta.description
  const pageUrl = absoluteUrl(options.path ?? window.location.pathname)
  const imageUrl = absoluteUrl(siteConfig.meta.ogImage)
  const robots = options.noIndex ? 'noindex, nofollow' : 'index, follow'

  document.title = title
  document.documentElement.lang = 'zh-CN'
  setCanonical(pageUrl)
  setMeta('name', 'description', description)
  setMeta('name', 'keywords', siteConfig.meta.keywords)
  setMeta('name', 'robots', robots)
  setMeta('property', 'og:locale', 'zh_CN')
  setMeta('property', 'og:type', options.type ?? 'website')
  setMeta('property', 'og:site_name', siteConfig.meta.name)
  setMeta('property', 'og:title', title)
  setMeta('property', 'og:description', description)
  setMeta('property', 'og:url', pageUrl)
  setMeta('property', 'og:image', imageUrl)
  setMeta('name', 'twitter:card', 'summary_large_image')
  setMeta('name', 'twitter:title', title)
  setMeta('name', 'twitter:description', description)
  setMeta('name', 'twitter:image', imageUrl)
  updateStructuredData(pageUrl)
}

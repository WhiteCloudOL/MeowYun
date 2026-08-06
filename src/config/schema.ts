import type { SiteIcon } from '@/types/icon'

export type BackgroundEffect = 'none' | 'stars' | 'petals' | 'snow'
export type IconProvider = 'lucide' | 'fontawesome'
export type FontAwesomeBrandIcon = 'bilibili' | 'github' | 'qq'
export type ConfigIconName = SiteIcon | FontAwesomeBrandIcon
export type ArticleHeadingLevel = 1 | 2 | 3 | 4

export interface NavigationItem {
  label: string
  to?: string
  icon: SiteIcon
  enabled: boolean
  children?: Array<{
    id: string
    label: string
    href: string
    icon: ConfigIconName
    iconProvider?: IconProvider
    color?: string
  }>
}

export interface SocialItem {
  id: string
  label: string
  href: string
  icon: ConfigIconName
  iconProvider?: IconProvider
  color: string
  enabled: boolean
}

export interface LinkCardItem {
  id: string
  title: string
  description: string
  href: string
  icon: ConfigIconName
  iconProvider?: IconProvider
  image?: string
  accent?: string
  enabled: boolean
}

export interface ProjectItem extends LinkCardItem {
  technologies: string[]
}

export interface SkillItem {
  label: string
  icon: ConfigIconName
  iconProvider?: IconProvider
  color?: string
  enabled: boolean
}

export interface FriendLinkItem {
  id: string
  name: string
  description: string
  href: string
  avatar?: string
  color?: string
  enabled: boolean
}

export interface PageBackground {
  image: string
  mobileImage?: string
  position: string
  overlay: number
  blur: number
  imageOpacity: number
  grayscale: number
  saturation: number
  brightness: number
  tintColor: string
  tintOpacity: number
  effect: BackgroundEffect
  twinkles: boolean
  autoPan: boolean
}

export interface SiteConfig {
  meta: {
    name: string
    title: string
    description: string
    keywords: string
    siteUrl: string
    ogImage: string
  }
  appearance: {
    accent: string
    glassOpacity: number
    lightGlassOpacity: number
    globalBackground: PageBackground
    lightBackground?: Partial<PageBackground>
    homeBackground?: Partial<PageBackground>
    friendsBackground?: Partial<PageBackground>
    contentBackground?: Partial<PageBackground>
    themeToggle: boolean
  }
  navigation: NavigationItem[]
  redirects: Array<{
    id: string
    path: `/${string}`
    to: string
    label: string
    delaySeconds: number
    enabled: boolean
  }>
  profile: {
    enabled: boolean
    name: string
    handle: string
    avatar: string
    avatarAlt: string
    greeting: string
    tagline: string
    description: string
    location: string
    quotes: string[]
    quoteInterval: number
    typingEffect: boolean
    socials: SocialItem[]
  }
  sections: {
    quickLinks: {
      enabled: boolean
      title: string
      items: LinkCardItem[]
    }
    navigation: {
      enabled: boolean
      title: string
      items: LinkCardItem[]
    }
    about: {
      enabled: boolean
      title: string
      description: string
      facts: Array<{ label: string; value: string; icon: SiteIcon }>
    }
    contributions: {
      enabled: boolean
      title: string
      username: string
      apiUrl?: string
      profileUrl: string
      description: string
    }
    projects: {
      enabled: boolean
      title: string
      items: ProjectItem[]
    }
    skills: {
      enabled: boolean
      title: string
      items: SkillItem[]
    }
    articles: {
      enabled: boolean
      title: string
      limit: number
      toc: {
        enabled: boolean
        title: string
        minLevel: ArticleHeadingLevel
        maxLevel: ArticleHeadingLevel
      }
      covers: Array<{
        slug: string
        image: string
        position?: string
      }>
    }
  }
  friendsPage: {
    enabled: boolean
    autoFavicon: boolean
    faviconService?: string
    title: string
    subtitle: string
    description: string
    applicationText: string
    applicationEmail?: string
    items: FriendLinkItem[]
  }
  footer: {
    enabled: boolean
    text: string
    imageDisclaimer?: string
    icp?: {
      number: string
      href: string
    }
    publicSecurity?: {
      number: string
      href: string
      iconUrl: string
    }
  }
}

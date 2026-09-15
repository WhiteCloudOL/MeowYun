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
  /** 只填写已经核实的信息；缺省不推断维护状态或作者推荐。 */
  audience?: string
  status?: string
  updatedAt?: string
  note?: string
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

/** 当前布局读取图片、位置、透明度、饱和度、亮度与 effect；其余字段保留旧版类型兼容。 */
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

export type HomeSceneBackgrounds = Partial<
  Record<'hero' | 'showcase' | 'status', Partial<PageBackground>>
>

export interface SiteConfig {
  /** 日期与近况由作者维护；不填写时首页隐藏。 */
  nowNote?: { date: string; text: string; href?: string; linkLabel?: string }
  updates?: Array<{ date: string; text: string; href?: string }>
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
    /** @deprecated 三场景已改为自然文档流，当前首页使用 homeBackground。 */
    homeSceneBackgrounds?: HomeSceneBackgrounds
    friendsBackground?: Partial<PageBackground>
    contentBackground?: Partial<PageBackground>
    readingBackground?: Partial<PageBackground>
    lightReadingBackground?: Partial<PageBackground>
    /** @deprecated 当前布局不挂载樱花粒子；以背景 effect:none 与安静模式控制装饰。 */
    sakuraEffect?: boolean
    themeToggle: boolean
  }
  navigation: NavigationItem[]
  redirects: Array<{
    id: string
    path: `/${string}`
    to: string
    label: string
    /** @deprecated 仅保留兼容；外链页由用户确认，不再自动倒计时。 */
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
    /** 当前首页只显示第一句，不进行轮换。 */
    quotes: string[]
    /** @deprecated 保留旧组件兼容，当前首页不轮换签名。 */
    quoteInterval: number
    /** @deprecated 当前首页完整显示文字，不使用打字动画。 */
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
      /** @deprecated 精简档案不渲染字段表；必要资料可写入 description。 */
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
      /** 首页展示 2–3 篇；输入会被限制在该范围内。 */
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

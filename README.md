# MeowYunCN

[![CI](https://github.com/WhiteCloudOL/MeowYun/actions/workflows/ci.yml/badge.svg)](https://github.com/WhiteCloudOL/MeowYun/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-a9b8ff.svg)](LICENSE)

一个基于 Vue 3、TypeScript 与 Vite 的可配置二次元个人主页。包含沉浸式背景、图标化首页、GitHub 提交历史、文章、导航、友链、联系菜单与备案页脚，并支持响应式布局、主题切换和减少动态效果。

![MeowYun 首页预览](.github/assets/meowyun-home.webp)

## 首次配置

实际资料使用 `src/config/site.ts`，该文件已加入 `.gitignore`，不会被 Git 提交。首次拉取项目后先复制模板：

```powershell
Copy-Item src/config/site.example.ts src/config/site.ts
```

之后只需编辑 `site.ts`，无需修改组件。可配置内容包括：

- 站点标题、头像、简介、位置和社交链接
- 主页、文章、导航、友链和联系下拉菜单
- Bilibili、GitHub、QQ群等联系方式
- 快捷入口、独立站点导航、项目、技能和 GitHub 提交历史
- 各模块显隐、首页/友链/内容页背景、遮罩、模糊和粒子效果
- 友链资料、图片资源声明、工信部备案和公安备案
- 规范域名、Open Graph 分享图和 SEO 文案

背景和头像图片建议放在 `src/assets/images`，在 `site.ts` 顶部导入后使用。发布前请把示例链接，尤其是 QQ 群链接，替换为自己的地址。

### 全站背景

`appearance.globalBackground` 是所有页面继承的基础底图，`homeBackground`、`friendsBackground` 和 `contentBackground` 只填写需要覆盖的字段：

- `image` / `mobileImage`：桌面和移动端图片
- `position`：背景焦点位置
- `imageOpacity`：图片透明度，范围 `0`～`1`
- `overlay`：深色可读性遮罩，范围 `0`～`1`
- `blur`：模糊像素值
- `grayscale`：灰度，`0` 为原色、`1` 为全灰
- `saturation` / `brightness`：饱和度和亮度，`1` 为原始值
- `tintColor` / `tintOpacity`：主题染色颜色与强度
- `effect`：`stars`、`petals`、`snow` 或 `none`
- `twinkles`：是否叠加低密度的小星光闪烁；它与 `effect` 相互独立，可按页面覆盖
- `autoPan`：是否启用缓慢背景呼吸移动

浅色模式可以在 `lightBackground` 中继续覆盖这些字段；`lightGlassOpacity` 单独控制浅色卡片不透明度。站点默认使用深色模式，不读取系统主题；用户手动切换后会保存选择。

个人签名使用 `profile.quotes` 数组，`quoteInterval` 控制轮换间隔（毫秒）。存在多条签名且未开启“减少动态效果”时，每次轮换会重新播放打字动画。

### 图标来源

界面功能图标统一使用 Lucide；Bilibili、GitHub、QQ 等平台品牌图标使用 Font Awesome Free Brands。config 中每个可配置图标默认使用 Lucide，也可以显式选择 Font Awesome：

```ts
{
  label: 'Bilibili',
  icon: 'bilibili',
  iconProvider: 'fontawesome',
}
```

当前 Font Awesome config 名称支持 `bilibili`、`github`、`qq`。增加品牌时，需要在 `src/config/schema.ts` 的 `FontAwesomeBrandIcon` 中加入名称，并在 `src/components/ui/ConfigIcon.vue` 中从 `@fortawesome/free-brands-svg-icons` 单独导入和映射；不要导入整套图标，以保留 Tree Shaking。

### 友链图标

友链图标按以下顺序选择：

1. 友链条目的 `avatar` 自定义图片。
2. `autoFavicon: true` 时自动读取友站根目录的 `/favicon.ico`。
3. 图片加载失败时显示站点名称首字。

如果需要使用 favicon 服务，可配置 URL 模板，例如 `faviconService: 'https://example.com/icon?domain={domain}'`。支持 `{domain}`、`{origin}` 和 `{url}` 三个占位符，发送给外部服务前会自动编码；留空则不经过第三方服务。

友链申请区的说明和邮箱分别由 `applicationText`、`applicationEmail` 控制；邮箱会自动渲染为可点击的 `mailto:` 链接。

## 新增文章

文章统一放在 `src/content/articles`。新增 `.md` 文件后，文章列表与详情路由会自动生成：

```md
---
title: 文章标题
description: 用于列表展示的简短说明
date: 2026-08-06
tags: [Vue, 随笔]
featured: false
icon: code
cover: example.webp
sourceUrl: https://docs.example.com/article
sourceLabel: 查看完整文档
---

![正文图片说明](example.webp)

这里开始写正文。
```

文章列表缩略标识的选择顺序为：

1. 头部 `icon`，值使用项目支持的 Lucide 图标名。
2. 头部 `cover`。
3. 正文第一张 Markdown 图片。
4. `site.ts` 中对应 slug 的封面兜底。
5. 统一文章图标。

文章图片统一放在 `src/assets/images/articles`，可以在 Markdown 中直接填写文件名；也支持远程地址和站点根路径。目前正文支持二、三级标题、段落、无序列表、引用、围栏代码块和图片；内容通过本地结构化解析，不使用 `v-html`。

大图建议先转换为 WebP 再引入。原图作为本地素材源保留并通过 `.gitignore` 排除，开源仓库与页面配置只引用压缩版本；示例头像由 `neko-cute.png` 缩放转换为约 76 KB 的 `neko-cute.webp`。

`sourceUrl` 和 `sourceLabel` 都是可选字段。填写后，文章详情底部会显示同风格的外部文档入口，适合在站内保留简要导读、把完整步骤交给独立文档站。

文章目录由 `sections.articles.toc` 控制。`enabled` 控制显隐，`title` 修改目录标题，`minLevel` / `maxLevel` 支持 `1`～`4`；默认显示 1～2 级标题。文章标题会作为一级标题加入目录，Markdown 正文支持 `#` 到 `####`，标题锚点会自动生成并处理重名。

## 导航页

导航页使用 `sections.navigation.items`，不再复用首页快捷入口。本人站点、状态页、个人 API 和第三方推广链接都可以独立配置标题、说明、图标、颜色、显隐和 URL。第三方或非商业入口建议直接在 `description` 中明确标注，避免让访客误解归属与服务承诺。

外部短链使用顶层 `redirects` 数组配置。例如 `path: '/ry'` 与 `to: 'https://www.rainyun.com/qzyy_'` 会生成 `/ry` 跳转路由。`delaySeconds` 控制自动跳转倒计时，用户也可以随时点击按钮继续。跳转页默认 `noindex` 且不会进入 Sitemap；新增条目不需要修改 Router 代码。

## SEO

`meta.siteUrl` 是网站的规范根地址，`meta.ogImage` 是社交平台分享图。路由切换时会同步更新标题、描述、canonical、Open Graph、Twitter Card 和 robots 信息，并注入 `WebSite` 与 `Person` JSON-LD。

生产构建会读取 `meta.siteUrl` 与 `src/content/articles`，自动在 `dist` 中生成最新的 `sitemap.xml` 和 `robots.txt`，新增文章无需手动维护 Sitemap。仓库中的 `public/sitemap.xml` 与 `public/robots.txt` 是静态部署和开发预览的基础版本；修改正式域名后运行一次 `npm run build` 即可得到匹配 config 的部署文件。

## EdgeOne 部署

项目使用 Vue Router History 模式。仓库根目录的 `edgeone.json` 将没有对应静态文件的页面请求重写到 `/index.html`，因此 `/`、`/articles`、`/articles/:slug`、`/navigation`、`/friends`、配置生成的 `/docs`、`/status`、`/ry` 等全部页面都可以直接访问或刷新，同时保留浏览器中的原始 URL。未知路径也会先加载应用，再由 Vue Router 显示站内 404 页面。

通过 EdgeOne Pages 从 Git 仓库构建时保留根目录的 `edgeone.json`。如果使用直接上传，请上传完整的 `dist` 目录；生产构建会自动把同一份配置复制到 `dist/edgeone.json`，无需维护两份规则。

如果使用“EdgeOne CDN 站点加速 + 独立源站”，CDN 不会解析 `edgeone.json`。源站应配置 History 回退，例如 Nginx/OpenResty 使用 `try_files $uri $uri/ /index.html;`。作为静态源站兼容层，生产构建还会为文章、导航、友链、所有 Markdown 文章详情和启用的 config 短链生成对应目录的 `index.html`，并生成 `404.html`；新增文章或短链后只需重新构建，不需要修改生成逻辑。

部署后可分别用 `curl -I https://你的域名/navigation`、`curl -I https://你的域名/articles/文章-slug` 和 `curl -I https://你的域名/docs` 检查，正常都应返回承载应用的 HTML，而不是源站 `404`。清理 CDN 缓存不能代替源站回退或重新上传完整产物。

## GitHub 提交历史

在 `site.ts` 的 `sections.contributions` 中填写 GitHub 用户名、个人主页和 `apiUrl`。`apiUrl` 支持 `{username}` 占位符；公开数据加载后由站点自行绘制雾蓝、淡紫、浅粉色贡献矩阵，不嵌入风格不可控的远程图片。接口失败时会显示稳定的同风格示例矩阵，避免版面坍塌。

## 本地开发

```sh
npm install
npm run dev
```

## 质量检查

```sh
npm run type-check
npm run lint
npm run build
```

GitHub Actions 会在推送到 `main`、面向 `main` 的 Pull Request 和手动触发时自动执行同等检查。CI 使用 `site.example.ts` 生成临时配置，成功后上传保留 7 天的 `dist` 构建产物；README 预览图仅保存在 `.github/assets`，构建会检查它没有进入 `dist`。

项目未引入 UI 框架、状态管理或大型动画库。功能图标使用 `lucide-vue-next`，品牌图标使用 Font Awesome Free Brands，其余视觉与交互由原生 CSS 和 Vue 实现。

## 开源许可

项目代码采用 [MIT License](LICENSE)。图片资源的权利仍归各自作者所有，使用和再分发前请同时阅读页面底部的图片资源声明。

## Favicon

二次元猫云徽记位于 `public/favicon.png`，浏览器使用多尺寸 `favicon.ico` 与 `favicon-32x32.png`，iOS 使用 `apple-touch-icon.png`。替换徽记时应同时重新导出这些尺寸，并保持小尺寸下轮廓清晰。

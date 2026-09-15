# MeowYunCN

[![CI](https://github.com/WhiteCloudOL/MeowYun/actions/workflows/ci.yml/badge.svg)](https://github.com/WhiteCloudOL/MeowYun/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-a9b8ff.svg)](LICENSE)

一个以“云上小屋”为主题、可阅读、探索、收藏和制作小东西的个人创作空间，基于 Vue 3、TypeScript 和 Vite 构建。

![MeowYunCN 首页预览](.github/assets/meowyun-home.webp)

## 功能

- 奶霜马卡龙、云朵底景与彩色果冻背板；原头像和真实品牌内容保留
- 文章归档、中文输入法搜索、标签叠加、列表切换、阅读设置、稍后读与上次浏览位置
- 独立作品索引和详情、真实技术关联文章、旧导航项目锚点兼容
- 本地口袋：收藏、六枚操作印章、配色、阅读与专注记录，支持校验后导入/导出
- 随机发现真实文章、作品和站点；轮内尽量不重复
- 明信片工坊：三种原创模板、贴纸、印章、本地图片、图层调整、撤销/重做、1200×800 PNG
- 配色调制器：色锁、HEX/HSL 微调、可读性提示、样张预览、CSS 导出与保存
- 专注工具：自定义专注/休息时长、暂停继续、绝对截止时间校正、重载与本地记录
- 漫游、星图/列表导航、真实更新小记、关于、友链和可编辑信纸邮局
- 三套氛围、明暗/系统主题、三档动效、背景/云团向导与全局点击微光开关
- giscus 可选接入边界；默认未启用，真实配置与访客主动加载后才请求公共服务
- 安全 Markdown、多语言代码高亮、目录、RSS、静态路由 Meta、Sitemap 和 404

## 技术栈

- Vue 3、Vue Router、TypeScript、Vite；现有 Tailwind 4 仅映射语义 Token
- MarkdownIt、Highlight.js
- Lucide、Font Awesome Brands
- ESLint、Oxlint、Prettier、vue-tsc

## 环境要求

- Node.js `^22.18.0` 或 `>=24.12.0`
- npm

## 快速开始

```sh
git clone https://github.com/WhiteCloudOL/MeowYun.git
cd MeowYun
npm install
```

创建本地站点配置：

```powershell
Copy-Item src/config/site.example.ts src/config/site.ts
```

macOS / Linux：

```sh
cp src/config/site.example.ts src/config/site.ts
```

启动开发服务器：

```sh
npm run dev
```

`src/config/site.ts` 已被 Git 忽略，可安全保存个人资料；公开仓库只提交 `site.example.ts`。

## 站点配置

站点内容集中在 `src/config/site.ts`：

- 标题、域名、描述、分享图和关键词
- 头像、简介、签名、位置和社交链接
- 导航、快捷入口、项目、技能和 GitHub 贡献记录
- 友链、联系方式、备案信息和外部短链
- 模块显隐与各页面背景；新主题统一在 `src/styles/tokens.css` 维护
- 可选近况 `nowNote`、项目维护信息与真实站点更新小记
- 背景图片、位置、透明度、亮度、饱和度与低干扰装饰效果

图片资源建议使用 WebP 或 AVIF，并放在 `src/assets/images/`。默认 Open Graph 图片为 `public/og-card.webp`，推荐保持 1200 × 630。

## 新增配置与维护

完整的内容入口、存储版本、工具边界、外部留言接入和发布顺序见 [维护说明](docs/cloud-house-maintenance.md)。动画触发、时序和退化见 [动效地图](docs/motion-map.md)。

- 所有主题值以 src/styles/tokens.css 为准；Tailwind 只映射语义变量。
- 作品在 /projects，详情在 /projects/:id；/navigation#projects 和旧项目锚点继续提供兼容入口。
- 私人资料仍在被忽略的 src/config/site.ts；新增字段先参考 site.example.ts 与 schema.ts。
- 本地收藏、偏好和计时不上传。明信片图片/草稿在本页内存中，离页前请导出；信纸用当前标签页 sessionStorage 暂存。
- 外链短地址保留真实目的地确认，不自动倒计时跳出。缺失贡献数据明确显示缺失，失败可以重试。
- giscus 公开参数均可选；没有实际配置时显示未接入，不提供假留言。不要在浏览器配置中填任何 Token。
- 旧大型家具场景和未引用组件保留为历史资源，当前页面使用方案 A；不要用历史 CSS 判断当前行为。

## 编写文章

在 `src/content/articles/` 新建 Markdown 文件：

````md
---
title: 文章标题
description: 用于文章列表和搜索摘要的说明
date: 2026-08-10
updated: 2026-08-10
tags: [Vue, TypeScript]
featured: false
icon: code
cover: example.webp
---

## 小节标题

正文内容。

```ts
const message: string = 'Hello, MeowYunCN!'
```
````

文章图片放在 `src/assets/images/articles/`，可在 Markdown 中使用文件名。文章会自动加入归档、搜索、标签、RSS、Sitemap 和静态详情入口。

`date` 必须是真实有效的 `YYYY-MM-DD`；`updated` 可选，填写时也需要有效日期。构建与浏览器共用解析器，无效日期会指出文章文件并中止构建，不以当天日期代替。远端技术图片加载前预留比例，加载后保留固有比例；原始尺寸未知时仍可能有局部布局变化。

支持标题、链接、图片、引用、有序/无序列表、任务列表、表格、行内代码和围栏代码块。代码高亮覆盖：

- C、C++、C#、Java、JavaScript、TypeScript、Python、Go、Rust
- PHP、Ruby、Swift、Kotlin、Dart、Scala、R、Lua、Perl、Objective-C
- HTML、XML、CSS、SCSS、Less、SQL、GraphQL、Protobuf
- JSON、YAML/YML、INI/TOML、Properties、Markdown
- Bash/Shell、PowerShell/PS1、BAT/CMD、Dockerfile、Makefile、CMake、Nginx、HTTP、Diff

## 可用命令

| 命令                 | 说明                                    |
| -------------------- | --------------------------------------- |
| `npm run dev`        | 启动开发服务器                          |
| `npm run build`      | 类型检查并生成生产构建                  |
| `npm run preview`    | 预览生产构建                            |
| `npm run type-check` | 检查 TypeScript 与 Vue 类型             |
| `npm run lint`       | 只检查 Oxlint 和 ESLint，不改写文件     |
| `npm run lint:fix`   | 显式修复 lint 问题（先审查范围）        |
| `npm test`           | 日期、内容安全、存储/工具与编译样式回归 |
| `npm run format`     | 格式化 `src` 目录                       |

## 项目结构

```text
src/
├─ assets/               # 图片与静态资源
├─ components/           # 页面和基础组件
├─ composables/          # 可复用交互状态
├─ config/               # 配置类型与站点配置
├─ content/articles/     # Markdown 文章
├─ layouts/              # 全站布局
├─ router/               # 路由定义
├─ styles/               # 设计变量与全局样式
├─ utils/                # SEO 等工具
└─ views/                # 路由页面
```

## 部署

```sh
npm run build
```

将 `dist/` 部署到现有源站，再接入 EdgeOne CDN。项目使用 Vue Router History 模式：先匹配真实静态文件和生成的路由入口，只对合适的页面导航执行回退；缺失资源/API 不能返回 200 首页。未知页面应返回真实 404。源站类型尚未确定，本轮不假定使用 EdgeOne Pages。

静态入口同时生成 `articles.html` 与 `articles/index.html` 等形式，支持无末尾斜杠与目录入口。托管端需先匹配实际文件再执行 SPA 回退；本地 `preview` 已验证两种入口的原始 HTML Meta，线上托管行为仍应在实际发布后复核。EdgeOne 规则参考其 [SPA fallback 说明](https://pages.edgeone.ai/document/edgeone-json)。

构建仅从 `siteConfig.meta` 读取字符串字面量以生成域名与 Meta，不执行配置表达式；`meta.name/title/description/siteUrl` 应保持明确字符串。配置启停通过 TypeScript 语法树读取，不通过跨对象正则猜测。普通页面不虚构 Sitemap 更新时间，文章使用 `updated` 或发布日期。

仓库保留 EdgeOne Pages 专属的 `edgeone.json`，它不会在任意源站或普通 EdgeOne CDN 接入中自动生效。缓存策略、发布顺序与线上待验项目见 [EdgeOne 适配说明](EDGEONE_READINESS.md)。本地测试源站使用 `node scripts/verify-origin.mjs`，仅用于验收，不代表已配置 CDN。生产构建还会生成：

- `sitemap.xml`
- `robots.txt`
- `rss.xml`
- `404.html`
- 文章、标签、作品详情、工坊、漫游等实际路由和已启用短链的静态入口

部署前请在 `site.ts` 中设置正确的 `meta.siteUrl`，并检查生成文件中的 canonical 与 Open Graph 地址。

## 参与贡献

欢迎通过 Issue 报告问题或通过 Pull Request 提交改进。提交前请运行：

```sh
npm run type-check
npm run lint
npm test
npm run build
```

提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/)。

## 许可证

项目代码采用 [MIT License](LICENSE)。站点示例图片及用户自行替换的图片可能具有独立版权，请在使用和再分发前确认相应授权。

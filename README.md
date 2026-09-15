# MeowYunCN

[![CI](https://github.com/WhiteCloudOL/MeowYun/actions/workflows/ci.yml/badge.svg)](https://github.com/WhiteCloudOL/MeowYun/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-a9b8ff.svg)](LICENSE)

一个以“云间手账”为主题、可配置的个人主页与技术博客，基于 Vue 3、TypeScript 和 Vite 构建。

![MeowYunCN 首页预览](.github/assets/meowyun-home.webp)

## 功能

- 自然滚动的欢迎手账、精选卡带作品、最新文章与精简个人档案
- 统一暖白 / 紫灰纸面主题，保留真实头像、角色素材与个人品牌
- Markdown 文章、文章目录、阅读进度、链接复制和相邻文章导航
- 本地正文搜索、标签叠加、中文组合输入、URL 与浏览历史恢复、年度归档和 RSS
- 全站快速查找（可见按钮、Ctrl / Cmd + K），文章 / 项目 / 站点分组
- 手机可收起目录、章节锚点、连续代码复制、完整图片查看和失败回退
- 贡献请求超时 / 重试 / 真实失败态，纯日期计算与可访问的按日期查询
- 跟随系统、浅色和深色三态主题
- 阅读页默认安静、站内安静模式与运行中系统减少动态效果支持
- 主流编程语言、配置文件和命令行脚本代码高亮
- Open Graph、Twitter Card、JSON-LD、Sitemap 和 robots.txt
- 为文章、标签和主要页面生成可直接访问的静态入口
- 移动导航、键盘焦点与语义化无障碍基础

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

以下字段均为可选。缺少真实内容时不展示，不会自动生成假近况、假朋友或维护状态。

```ts
// src/config/site.ts（被 Git 忽略）
nowNote: {
  date: 'YYYY-MM-DD', // 实际记录日期
  text: '作者确认的一句话近况',
  href: '/articles',  // 可选的真实关联入口
  linkLabel: '相关笔记',
},
updates: [
  // 只填写真实完成的更新，首页最多展示两条。
],
// sections.projects.items 的可选字段：
// audience、status、updatedAt、note；均需真实资料。
```

- 首页锚点：`/#welcome`、`/#projects`、`/#notes`、`/#about`。
- 全部作品：`/navigation#projects`；单个作品：`/navigation#project-配置id`。
- 技术标签只有匹配现有文章标签或项目技术时才会成为链接。
- 友链中的示例域名和示例友人不公开展示。空态保留真实邮件交换入口。
- 贡献接口无需 Token；8 秒超时，无自动重试、伪造矩阵或静默演示数据。缺失日期显示暂无记录。
- 安静偏好保存在本机，系统减少动态效果优先；存储被禁用时仍可在本次会话切换。
- 旧 appearance 玻璃参数、三场景参数保留类型兼容，新布局使用稳定纸面；首页沿用 homeBackground，阅读页不运行动态装饰。
- `profile.quotes` 当前显示第一句；`quoteInterval`、`typingEffect` 保留兼容但不再驱动轮播或打字。`about.facts` 的简历表格不渲染，可将必要资料放入 `about.description`。
- 背景的 `overlay`、`blur`、`tint`、`grayscale`、`twinkles`、`autoPan` 是旧版兼容项；当前不生效。`effect: none` 关闭装饰，其余旧值统一为轻量星形装饰。不要通过这些旧参数判断新主题效果。
- 首页文章 `limit` 限制为 2–3 篇，避免首页变成长归档。关闭分区后，相应的首页快捷锚点入口也会隐藏。
- 欢迎区已有作品、文章主行动时，重复快捷入口合并到对应按钮；友链及其他入口继续保留。
- 首页文章卡的 `compact` 使用较小封面与间距；旧页脚/贡献图 `compact` 仅保留类型兼容，不表示另一套布局。项目和站点卡当前使用图标与统一纸面，旧 `image`、`accent` 字段不驱动封面或配色。
- 手机阅读工具位于正文后方，不覆盖滚动中的文字。代码复制失败使用原生对话框，关闭后回到对应按钮；带链接的文章图片保留跳转行为，普通图片可查看原图。
- 贡献图使用独立五级色阶与缺失数据图例；日期查询提供精确数量，不把每个格子加入 Tab 顺序。
- 日期查询使用与明暗主题一致的日历面板，支持月份切换、最新记录、范围限制、方向键选日、Page Up / Down 切月与 Escape 关闭；关闭后焦点回到入口。320px 仍保留 44px 日期命中区。
- 文章、导航、快速查找共用 `SearchField` 与可聚焦的清除按钮。搜索清除、任务勾选框、悬浮提示和滚动条均使用站点样式；对话框保留语义与模态能力。
- 关于我的技术标签统一边框和尺寸。存在真实目标时才渲染链接；只读标签没有手型或悬停反馈。
- 外链兼容路径保留，现改为确认目的地后立即访问；旧 delaySeconds 仅作配置兼容，不再自动倒计时。

测试夹具在 `tests/fixtures`，不属于发布文章。Markdown 元数据与纯文本索引在 `src/content/articles/index.ts`，渲染与按需高亮在 `renderer.ts`。

详见 [改造映射](docs/redesign-plan.md)。验收报告在本地桌面独立交付，不进入生产包。

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

| 命令                 | 说明                                |
| -------------------- | ----------------------------------- |
| `npm run dev`        | 启动开发服务器                      |
| `npm run build`      | 类型检查并生成生产构建              |
| `npm run preview`    | 预览生产构建                        |
| `npm run type-check` | 检查 TypeScript 与 Vue 类型         |
| `npm run lint`       | 只检查 Oxlint 和 ESLint，不改写文件 |
| `npm run lint:fix`   | 显式修复 lint 问题（先审查范围）    |
| `npm test`           | 日期、时区与贡献数据边界回归        |
| `npm run format`     | 格式化 `src` 目录                   |

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

将 `dist/` 部署到静态托管服务。项目使用 Vue Router History 模式，托管平台需要把未知路径回退到 `/index.html`。

静态入口同时生成 `articles.html` 与 `articles/index.html` 等形式，支持无末尾斜杠与目录入口。托管端需先匹配实际文件再执行 SPA 回退；本地 `preview` 已验证两种入口的原始 HTML Meta，线上托管行为仍应在实际发布后复核。EdgeOne 规则参考其 [SPA fallback 说明](https://pages.edgeone.ai/document/edgeone-json)。

构建仅从 `siteConfig.meta` 读取字符串字面量以生成域名与 Meta，不执行配置表达式；`meta.name/title/description/siteUrl` 应保持明确字符串。配置启停通过 TypeScript 语法树读取，不通过跨对象正则猜测。普通页面不虚构 Sitemap 更新时间，文章使用 `updated` 或发布日期。

仓库包含 EdgeOne Pages 使用的 `edgeone.json`。生产构建还会生成：

- `sitemap.xml`
- `robots.txt`
- `rss.xml`
- `404.html`
- 文章、标签、导航、友链和已启用短链的静态入口

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

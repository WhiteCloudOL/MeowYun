# AGENTS.md

## 项目概况

MeowYunCN 是 Vue 3 + TypeScript + Vite 构建的可配置个人主页与技术博客，采用二次元沉浸式背景、克制玻璃质感和响应式布局。

当前能力：

- 首页、文章归档与详情、导航、友链、外链跳转和 404 页面
- Markdown、目录、搜索、标签、年度归档、RSS 与相邻文章导航
- 主流编程语言及常见文本格式的代码高亮
- 跟随系统 / 浅色 / 深色三态主题与文章专注阅读背景
- Sitemap、robots、Open Graph、Twitter Card、JSON-LD 和静态路由 Meta
- 移动导航、键盘焦点、减少动态效果与基础无障碍支持

后端、登录、评论和 CMS 尚未启用，只有用户明确确认后才能加入。

## 技术与目录

- Vue 3、Composition API、`<script setup lang="ts">`
- Vue Router、Vite、TypeScript
- 原生 CSS、CSS Variables、Grid / Flex、SVG
- MarkdownIt、Highlight.js、Lucide、Font Awesome Brands
- ESLint、Oxlint、Prettier、vue-tsc

主要目录：

```text
src/
├─ assets/               # 站内图片与静态资源
├─ components/           # articles、home、layout、ui 组件
├─ composables/          # 可复用状态与交互逻辑
├─ config/               # 配置类型、公开模板和本地实际配置
├─ content/articles/     # Markdown 文章与内容加载器
├─ layouts/              # 全站布局
├─ router/               # 路由
├─ styles/               # 设计变量和全局样式
├─ types/                # 共享类型
├─ utils/                # SEO 等无界面工具
└─ views/                # 路由页面
```

## 配置与内容

- `src/config/site.example.ts` 是可提交的无私人信息模板。
- `src/config/site.ts` 保存实际资料并被 `.gitignore` 排除。
- 新环境从 example 复制 `site.ts`，不要把私人资料、Token 或密钥提交到 Git。
- 文章存放在 `src/content/articles/*.md`；图片放在 `src/assets/images/articles/`。
- 站点图片优先使用经过压缩的 WebP / AVIF；不要提交无必要的大型原图。
- `public/og-card.webp` 是默认社交分享图，尺寸保持 1200 × 630。

## 设计约束

- 内容、可读性和留白优先；可爱但不幼态。
- 保持深蓝、雾蓝、淡紫体系与轻量半透明玻璃风格。
- 动画只用于局部反馈，主要使用 `transform` 和 `opacity`。
- 必须支持 375、768、1024、1440px，不得出现意外横向滚动。
- 触控目标不小于 44px，交互元素必须具备语义和 `:focus-visible`。
- 尊重 `prefers-reduced-motion`，装饰背景不得阻塞交互。
- 不加入拟物头像框、在线状态卡、大范围强模糊、霓虹发光或持续剧烈动画。

## 编码约定

- 先阅读相关文件和 `package.json`，再进行最小范围修改。
- Vue 组件使用 PascalCase，页面使用 `View` 后缀，TypeScript 文件使用 camelCase。
- Props、emits 和数据模型提供明确类型，禁止无理由使用 `any`。
- 业务内容放配置或数据层；基础 UI 组件不感知具体页面数据。
- 列表使用稳定唯一的 key；监听器、定时器和订阅必须在卸载时清理。
- 页面跳转使用链接，行为操作使用按钮，不用 `<div @click>` 模拟交互。
- 设计变量集中维护在 `src/styles/tokens.css`，避免组件内重复近似颜色、圆角和阴影。
- 不修改 `node_modules`、`dist`，不手动提交生成物。

### 注释要求

- 复杂算法、生命周期副作用、构建插件、解析与安全边界必须写中文注释。
- 注释说明“为什么这样处理”、约束条件和退化行为，不逐行复述代码。
- `v-html`、外链处理、本地存储、媒体查询和事件委托等非显然逻辑必须说明安全或清理策略。
- 修改旧逻辑时同步更新附近注释；禁止保留过时、与代码矛盾的说明。
- 简单模板绑定、直观样式和自解释变量无需堆叠无价值注释。

## 文章与代码高亮

- Markdown 渲染必须保持 `html: false`，不得直接信任文章中的原生 HTML。
- 外链添加安全的 `target` / `rel`，标题锚点必须稳定且处理重名。
- 新语法支持需要同步考虑样式、键盘操作、移动端和明暗主题。
- Highlight.js 使用按需注册；新增语言时同时添加常见别名。
- 保持 C/C++、C#、Java、JavaScript、TypeScript、Python、Go、Rust、PHP、Ruby、Swift、Kotlin、Dart、Scala、R、Lua、Perl、Objective-C，以及 JSON、YAML/YML、PowerShell、BAT/CMD、Shell、SQL、Dockerfile 等格式可用。

## 依赖与架构边界

- 新增依赖前检查是否能用现有能力完成，避免同类依赖重复。
- 不使用 `--force` 或 `--legacy-peer-deps` 掩盖依赖问题。
- 除非用户明确要求，不加入 Pinia、Tailwind、UI 框架、大型动画库、SSR 或后端。
- 需要评论、订阅、管理后台、统计或 CMS 时，先给出数据模型、隐私与部署影响，再等待用户确认。

## SEO 与部署

- 新路由同步维护运行时 SEO、Vite 静态入口生成与 Sitemap。
- 文章页提供 `BlogPosting` JSON-LD；搜索结果页使用 `noindex`。
- History 路由必须保留 `edgeone.json` 回退，生产构建应可直接刷新文章和标签路径。
- 修改正式域名、标题或分享图后检查 `site.ts`、`site.example.ts` 和 `index.html` 的一致性。

## 验证与 Git

修改完成后依次执行：

```sh
npm run type-check
npm run lint
npm run build
```

视觉改动还需检查：

- 375、768、1024、1440px
- 浅色、深色与跟随系统
- 键盘焦点、移动导航、减少动态效果
- 文章直达、标签筛选、搜索、RSS 与 404
- 控制台错误和横向溢出

关键阶段使用 Conventional Commits，例如：

```text
feat: add article discovery and rss
fix: improve mobile navigation accessibility
docs: refresh project documentation
```

提交前确认无调试输出、临时文件、敏感信息、构建产物和无关格式化改动。

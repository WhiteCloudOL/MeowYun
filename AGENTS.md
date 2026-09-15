# AGENTS.md

## 项目概况

MeowYunCN 是 Vue 3 + TypeScript + Vite 构建的可配置个人主页与技术博客，采用“云间手账”视觉、自然文档滚动、稳定纸面和响应式布局。

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
- 原生 CSS、CSS Variables、Grid / Flex、SVG；已存在 Tailwind 4，只映射语义 Token
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
- 保持暖白纸面、低饱和粉色、薄荷与蓝紫；深色使用紫灰纸面。首页有性格，展示页轻盈，阅读页安静。
- 所有主题值来自 tokens.css；CSS @theme 和 Tailwind 只映射它，禁止另外维护近似颜色。
- 首页自然滚动，稳定分区 id；不添加 wheel 滚动锁、整页 mandatory snap 或档案内部滚动。
- 统一 --header-clearance、44px 命中区、共享按钮/标签/浮层契约。正文使用不透明稳定纸面。
- 动画只用于局部反馈，主要使用 `transform` 和 `opacity`。
- 必须支持 375、768、1024、1440px，不得出现意外横向滚动。
- 触控目标不小于 44px，交互元素必须具备语义和 `:focus-visible`。
- 尊重 `prefers-reduced-motion`，装饰背景不得阻塞交互。
- 2026-09-15 最新目标固定 Gemini 方案 A：奶霜马卡龙、通透果冻、柔软轮廓、彩色错落背板与云朵底景。正文与焦点稳定，皮肤/背板独立微弹；不恢复大型家具场景，也不退回全部普通白卡。原头像五官、猫耳和发饰完整保留。
- 最新目标、实际组件映射与验收见 CURRENT_GOAL.md。先做样板与原图比对，吻合后直接推广全站，不再等待其他审美方向选择。原定功能继续完成，当前代码和稳定数据不得丢失。
- 文章页不运行装饰循环；安静模式与系统减少动态效果实时生效，离屏和后台停止装饰。
- 不编造 Now Note、项目维护信息、友链或贡献数据；可选字段缺失时隐藏，接口失败明确显示失败。

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
- 标题锚点需要对最终 ID 全局去重，包含自然后缀碰撞（如 A、A、A-2）。Markdown 图片已有链接时不得再嵌套查看按钮。
- 复制失败的手动输入不得定时消失；代码复制按按钮独立反馈，异步响应要检查内容代次与卸载状态。
- 新语法支持需要同步考虑样式、键盘操作、移动端和明暗主题。
- Highlight.js 使用按需注册；新增语言时同时添加常见别名。
- 保持 C/C++、C#、Java、JavaScript、TypeScript、Python、Go、Rust、PHP、Ruby、Swift、Kotlin、Dart、Scala、R、Lua、Perl、Objective-C，以及 JSON、YAML/YML、PowerShell、BAT/CMD、Shell、SQL、Dockerfile 等格式可用。

## 依赖与架构边界

- 新增依赖前检查是否能用现有能力完成，避免同类依赖重复。
- 不使用 `--force` 或 `--legacy-peer-deps` 掩盖依赖问题。
- 除非用户明确要求，不加入 Pinia、新 UI 框架、大型动画库、SSR 或后端；保留现有 Tailwind 4，不迁移框架。
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
npm test
npm run build
```

`lint` 只检查；只有明确需要修复格式时才使用 `lint:fix`，避免无关全库改动。测试夹具仅放 `tests/fixtures`，不得进入正式文章 glob、RSS 和 Sitemap。

视觉改动还需检查：

- 320、375、390、768、1024、1440px、关键断点与 200% 缩放
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

## 当前组件与内容契约

- `components/content/ArticleCard`、`ProjectCard`、`LinkCard` 为活跃内容卡；首页与索引共享。
- `BasePopover` 是普通非模态浮层；`QuickSearch` 与图片查看使用原生 dialog。
- 移动导航与浮层通过同一关闭事件协调；禁用的链接按钮渲染原生 disabled button，不保留 href。
- 贡献图使用独立 `--contribution-0…4` Token 和缺失数据图例，不能复用成功色拼出难以区分的深色梯度。
- 日期选择统一使用 `DatePicker` 主题日历，不调用浏览器日期弹窗；保留范围限制、方向键/月切换、模态焦点与关闭恢复。日历日用 UTC 运算。
- 搜索统一使用 `SearchField`，清除按钮至少 44px，保留中文组合输入与清除后的焦点；不重新显示浏览器自带清除装饰。
- 任务勾选框保留只读语义并使用主题样式；悬浮说明使用 `vTooltip`，不得用默认 title 提示替代。工具提示监听与定时器必须清理。
- 技术标签的链接与只读项共用 Chip 外框；仅真实链接提供手型、Hover 和键盘焦点。
- `useTheme`、`useMotion` 是共享偏好单例，存储失败安全退化，HMR 清理监听。
- `content/articles/index.ts` 提供元数据与纯文本索引；`renderer.ts` 只随详情加载，保留全部语言与 html:false。
- 旧 HomeDashboard、ProfileHero、QuickLinksGrid 等未引用组件是历史实现，不代表当前页面能力；不擅自删除源素材。
- 详细页面/组件改造映射见 `docs/redesign-plan.md`。

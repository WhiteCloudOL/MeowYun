# AGENTS.md

## 1. 项目概述

项目名称：**MeowYunCN**

这是一个基于 Vue 3 的个人主页网站，用于展示个人介绍、技术栈、开源项目、社交链接与联系方式。

项目定位：

- 个人主页与作品展示站
- 视觉风格可爱、简洁、清爽，并带有克制的高级感
- 采用“静态主体 + 局部动态点缀”的页面表现
- 使用几何分割的 Bento Grid 承载主要内容
- 适度使用马卡龙色和半透明玻璃质感
- 优先自制基础 UI 组件
- 完整支持桌面端、平板与移动端
- 当前以前端静态站点为主
- 保持代码易读、易改、易扩展

---

## 2. 核心设计原则

页面设计必须围绕以下原则展开：

1. **内容优先**：装饰不能影响文字、项目和链接的可读性。
2. **留白优先**：通过间距和层级营造高级感，不靠堆叠特效。
3. **局部动态**：主体结构保持稳定，只让背景丝带、按钮反馈等局部元素轻微运动。
4. **克制玻璃感**：玻璃效果只用于主要卡片，不让整页都处于高模糊状态。
5. **可爱但不幼态**：可使用柔和配色、圆角、轻微弹性反馈和少量 Emoji，但避免卡通化过度。
6. **统一性优先**：颜色、圆角、阴影、字体、图标和动画必须来自同一套设计系统。
7. **响应式优先**：桌面端 Bento 布局在移动端应自然降级为单列，不维护两套独立页面。
8. **性能优先**：动画主要使用 `transform` 和 `opacity`，避免高频重排与大面积实时滤镜。

### 明确不采用

除非用户明确要求，不要加入：

- 拟物化头像框
- 金属、皮革、实体按钮等拟物风格
- 在线状态卡、运行状态卡或无实际内容的状态模块
- 全屏持续流动的液体背景
- 大面积高饱和渐变
- 大范围强模糊毛玻璃
- 过强发光、霓虹或灰暗 AI 科技风
- 大量漂浮装饰物
- 频繁弹跳、旋转、晃动动画
- 为“可爱”而牺牲排版和可读性

---

## 3. 技术栈

核心技术：

- Vue 3
- TypeScript
- Vite
- Vue Router
- Composition API
- `<script setup lang="ts">`
- ESLint
- Oxlint
- Prettier
- CSS Variables
- 原生 CSS Grid 与 Flexbox
- 原生 SVG

可选依赖：

- `lucide-vue-next`：统一图标风格
- 出现复杂全局状态后再考虑 Pinia
- 出现复杂功能组件后再评估第三方 UI 库

除非用户明确要求，不要主动引入：

- Pinia
- Tailwind CSS
- Element Plus
- Naive UI
- Bootstrap
- jQuery
- 大型动画库
- Nuxt 或 SSR
- 后端服务

不要为了波浪背景、玻璃卡片或简单微交互新增第三方依赖，这些效果应优先使用 CSS 和 SVG 实现。

---

## 4. 开发目标

所有改动应尽量满足：

1. 页面风格统一，不出现明显的模板拼接感。
2. 可爱、柔和，但不过度幼态、花哨或杂乱。
3. 通过留白、排版、圆角和轻量阴影体现高级感。
4. 组件职责清晰，避免将整个页面写进单个 Vue 文件。
5. 文本、项目、技能和社交链接等内容与展示组件分离。
6. 页面在桌面、平板和手机宽度下均能正常显示。
7. 保持良好的可访问性、加载性能和 SEO 基础。
8. 优先使用简单直接的实现，不为未知需求过度设计。
9. 不因视觉效果破坏内容层级、交互反馈或设备性能。

---

## 5. 推荐目录结构

```text
src/
├─ assets/
│  ├─ images/
│  │  ├─ avatar/
│  │  └─ projects/
│  ├─ icons/
│  └─ fonts/
│
├─ components/
│  ├─ ui/
│  │  ├─ BaseButton.vue
│  │  ├─ BaseCard.vue
│  │  ├─ BaseTag.vue
│  │  ├─ BaseAvatar.vue
│  │  ├─ BaseIconButton.vue
│  │  ├─ BaseSectionTitle.vue
│  │  └─ BaseModal.vue
│  │
│  ├─ layout/
│  │  ├─ AppHeader.vue
│  │  ├─ AppFooter.vue
│  │  ├─ AppNavigation.vue
│  │  ├─ ThemeToggle.vue
│  │  └─ WaveBackground.vue
│  │
│  └─ home/
│     ├─ BentoGrid.vue
│     ├─ AboutCard.vue
│     ├─ SocialCard.vue
│     ├─ SkillsCard.vue
│     ├─ FeaturedProjectCard.vue
│     └─ ProjectsSection.vue
│
├─ views/
│  ├─ HomeView.vue
│  └─ NotFoundView.vue
│
├─ router/
│  └─ index.ts
│
├─ data/
│  ├─ profile.ts
│  ├─ projects.ts
│  ├─ skills.ts
│  └─ socialLinks.ts
│
├─ styles/
│  ├─ tokens.css
│  ├─ reset.css
│  ├─ base.css
│  └─ animations.css
│
├─ composables/
├─ types/
├─ utils/
├─ App.vue
└─ main.ts
```

不要为了目录完整而提前创建大量空目录。只有实际出现复用需求时，才创建 `composables`、`types` 和 `utils`。

---

## 6. 首页结构

首页推荐采用 Bento Grid，而不是传统的多段长页面堆叠。

桌面端推荐结构：

```text
┌────────────────────────────┬──────────────┐
│ About                      │ Social       │
│ 占 2 列                     │ 占 1 列       │
├──────────────┬─────────────┴──────────────┤
│ Skills       │ Featured Project           │
│ 占 1 列       │ 占 2 列                     │
└──────────────┴────────────────────────────┘
```

推荐内容：

- `AboutCard`：正常头像、名字、简短问候和个人简介
- `SocialCard`：GitHub、邮箱、Bilibili 等链接
- `SkillsCard`：通过 `BaseTag` 展示技术栈
- `FeaturedProjectCard`：展示一个主打项目
- 其他项目可以在 Bento Grid 下方使用 `ProjectsSection`

不要添加内容空洞的状态卡来填补网格。

### 推荐布局规则

```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-auto-rows: minmax(220px, auto);
  gap: var(--space-6);
}

.bento-card--wide {
  grid-column: span 2;
}

@media (max-width: 768px) {
  .bento-grid {
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
  }

  .bento-card--wide {
    grid-column: span 1;
  }
}
```

不要使用可能造成内容溢出的严格固定行高。优先使用 `minmax()` 和自然内容高度。

---

## 7. 目录职责

### `src/components/ui`

存放可复用的基础 UI 组件。

统一使用 `Base` 前缀：

```text
BaseButton.vue
BaseCard.vue
BaseTag.vue
BaseAvatar.vue
BaseIconButton.vue
BaseModal.vue
```

基础 UI 组件应：

- 不包含具体业务数据
- 支持插槽
- 使用明确的 props 和 emits
- 通过 CSS 变量读取主题
- 保持 API 简单
- 支持键盘操作、禁用状态和焦点样式
- 提供必要的视觉变体，但不要堆叠大量无用 props
- 不直接依赖某个具体页面

### `src/components/layout`

存放网站整体布局组件，例如导航栏、页脚、主题切换器和背景装饰。

`WaveBackground.vue` 只负责背景视觉，不应包含页面内容或业务逻辑。

### `src/components/home`

存放仅用于首页的内容卡片和网格结构。

推荐：

```vue
<template>
  <BentoGrid>
    <AboutCard />
    <SocialCard />
    <SkillsCard />
    <FeaturedProjectCard />
  </BentoGrid>

  <ProjectsSection />
</template>
```

不要在 `HomeView.vue` 中直接堆叠大量卡片内部代码。

### `src/views`

存放路由直接对应的完整页面。

命名格式：

```text
HomeView.vue
AboutView.vue
ProjectsView.vue
NotFoundView.vue
```

### `src/data`

存放个人主页展示数据，例如：

- 个人简介
- 技术栈
- 项目列表
- 社交链接
- 联系方式
- 时间线

不要把大量项目数据直接硬编码在模板中。

### `src/styles`

- `tokens.css`：颜色、圆角、阴影、间距、动画时长等设计变量
- `reset.css`：浏览器默认样式重置
- `base.css`：字体、背景、正文、标题和链接等全局样式
- `animations.css`：全局可复用动画

组件特有样式应放在组件的 `<style scoped>` 中。

### `src/assets` 与 `public`

放入 `src/assets`：

- 头像
- 项目封面
- 页面插图
- 需要通过 `import` 使用的资源

放入 `public`：

- `favicon.ico`
- `robots.txt`
- `site.webmanifest`
- 固定访问地址的简历 PDF
- Open Graph 分享图片

---

## 8. 命名规范

Vue 组件使用 PascalCase：

```text
ProjectCard.vue
AppHeader.vue
WaveBackground.vue
FeaturedProjectCard.vue
```

路由页面使用 `View` 后缀：

```text
HomeView.vue
ProjectsView.vue
NotFoundView.vue
```

首页内容块使用 `Card` 或 `Section` 后缀：

```text
AboutCard.vue
SkillsCard.vue
ProjectsSection.vue
```

TypeScript 文件使用 camelCase：

```text
projects.ts
socialLinks.ts
useTheme.ts
formatDate.ts
```

目录全部小写，必要时使用短横线。

不要混用：

```text
Components/
project_card.vue
Project-card.vue
homeComponents/
```

Props 使用 camelCase：

```ts
defineProps<{
  projectTitle: string
  githubUrl?: string
}>()
```

事件名称在 TypeScript 中使用 camelCase，在模板中使用 kebab-case：

```ts
defineEmits<{
  openProject: [projectId: string]
}>()
```

```vue
<ProjectCard @open-project="handleOpenProject" />
```

---

## 9. Vue 编码规范

默认结构：

```vue
<script setup lang="ts">
</script>

<template>
</template>

<style scoped>
</style>
```

要求：

- 优先使用 Composition API
- Props、emits 和数据模型必须提供 TypeScript 类型
- 不要随意使用 `any`
- 不要直接修改 props
- 不要在模板中写过长表达式
- 复杂计算使用 `computed`
- 可复用逻辑放入 composable
- 组件卸载时清理定时器、监听器和事件
- 列表必须使用稳定且唯一的 `key`
- 不要使用数组下标作为可变列表的 `key`
- 优先使用语义化 HTML
- 视觉组件不应持有与显示无关的业务逻辑

推荐：

```ts
const props = withDefaults(
  defineProps<{
    title: string
    description?: string
    hoverable?: boolean
  }>(),
  {
    description: '',
    hoverable: true,
  },
)
```

不推荐：

```ts
const props = defineProps<any>()
```

---

## 10. 组件拆分原则

出现以下情况时考虑拆分：

- 单个 Vue 文件明显过长
- 模板包含多个独立区域
- 同一结构在多个地方重复
- 某部分具有独立 props、事件或交互
- 某部分可以单独复用

不要为了拆分而拆分。仅包含少量静态标签且不会复用的结构可以保留在父组件中。

优先保持：

- 一个组件只负责一类职责
- 组件输入通过 props
- 组件输出通过 emits
- 页面内容通过 `data` 文件提供
- UI 组件不感知具体业务

---

## 11. 自制 UI 规范

优先自制：

```text
BaseButton
BaseCard
BaseTag
BaseAvatar
BaseIconButton
BaseSectionTitle
BaseModal
BaseTooltip
```

统一处理：

- 圆角
- 边框
- 阴影
- Hover 状态
- Active 状态
- Focus-visible 状态
- Disabled 状态
- 过渡动画
- 深色模式兼容
- 移动端触控尺寸

不要在多个组件中复制完全相同的按钮或卡片样式。

日期选择器、富文本编辑器、大型数据表格等复杂组件，可在用户确认后使用成熟第三方库。

### `BaseCard` 建议

`BaseCard` 可以提供少量语义明确的变体：

```ts
type CardVariant = 'solid' | 'glass'
```

不要创建大量外观接近、用途不清的卡片变体。

玻璃卡片建议：

- 半透明白色表面
- 极细半透明边框
- 轻量阴影
- 适度 `backdrop-filter`
- 提供不支持滤镜时的纯色回退
- Hover 只做轻微上移和阴影变化

示例：

```css
.base-card--glass {
  background: var(--color-surface-glass);
  border: 1px solid var(--color-border-glass);
  box-shadow: var(--shadow-glass);
  backdrop-filter: blur(14px) saturate(120%);
  -webkit-backdrop-filter: blur(14px) saturate(120%);
}

@supports not (backdrop-filter: blur(1px)) {
  .base-card--glass {
    background: var(--color-surface-fallback);
  }
}
```

不要在卡片内叠加多层毛玻璃。

---

## 12. 头像设计规范

头像应使用正常的个人头像展示方式，不使用拟物化画框或装饰性状态环。

推荐：

- 使用圆角矩形或轻微 Squircle 观感
- 边框保持细且柔和
- 阴影轻量
- Hover 缩放不超过 `1.03`
- 图片始终使用 `object-fit: cover`
- 提供明确 `alt`
- 移动端保持合适尺寸

推荐样式：

```css
.base-avatar {
  overflow: hidden;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-avatar);
  background: var(--color-surface);
  box-shadow: var(--shadow-avatar);
  transition:
    transform var(--transition-normal),
    box-shadow var(--transition-normal);
}

.base-avatar:hover {
  transform: scale(1.03);
  box-shadow: var(--shadow-avatar-hover);
}
```

禁止：

- 模拟金属、塑料、相框等实体材质
- 使用无实际意义的在线状态点
- 过厚多层边框
- 强烈外发光
- 大幅旋转、摇摆或弹跳

---

## 13. 背景设计规范

背景采用：

> 静态浅色主体 + 局部动态马卡龙丝带或波浪

### 静态主体

页面基础背景应保持干净、接近珍珠白：

```css
--color-background-base: #fcfcfd;
```

背景不应使用大面积复杂图片或持续流体动画。

### 局部动态点缀

可使用 `WaveBackground.vue` 在底部或页面对角线附近放置一层低透明度 SVG 丝带。

要求：

- 只占页面局部
- 不遮挡内容
- `pointer-events: none`
- 低饱和、低透明度
- 运动速度舒缓
- 只使用 `transform` 和 `opacity`
- 动画周期建议为 12～20 秒
- 移动端可以降低高度或关闭动画
- 必须适配 `prefers-reduced-motion`

推荐：

```css
.wave-background {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  background: var(--color-background-base);
}

.wave-background__ribbon {
  position: absolute;
  right: -10%;
  bottom: -4%;
  width: min(1800px, 180vw);
  height: clamp(180px, 38vh, 440px);
  opacity: 0.3;
  animation: ribbon-drift 16s ease-in-out infinite alternate;
}

@keyframes ribbon-drift {
  from {
    transform: translate3d(0, 0, 0) scaleY(1);
  }

  to {
    transform: translate3d(-4%, 1%, 0) scaleY(1.06);
  }
}

@media (prefers-reduced-motion: reduce) {
  .wave-background__ribbon {
    animation: none;
  }
}
```

不要直接照搬示例代码。Agent 应根据现有页面尺寸、SVG 路径和内容区域调整实现。

---

## 14. 视觉设计规范

整体方向：

- 可爱
- 简洁
- 柔和
- 清爽
- 精致
- 轻微猫系或二次元氛围
- 现代几何感
- 不做传统后台管理系统风格
- 不使用灰暗的 AI 科技风

推荐设计语言：

- 珍珠白基础背景
- 粉色、浅蓝和淡紫色作为马卡龙点缀
- 24px 左右的大圆角
- 轻量柔和阴影
- 透明度适中的玻璃卡片
- 清晰且克制的文字层级
- 统一的线性图标
- 少量 Emoji 点缀，例如 `🐾`、`✨`
- 动画短、轻、慢

避免：

- 大面积高饱和渐变
- 过多发光效果
- 过重毛玻璃
- 过多漂浮装饰
- 频繁弹跳和旋转动画
- 页面元素密度过高
- 每个区域使用不同配色
- 为可爱而牺牲可读性
- 使用 Emoji 代替所有图标

---

## 15. 设计变量

颜色、圆角、阴影、间距和动画必须优先通过 `src/styles/tokens.css` 管理。

推荐基础变量：

```css
:root {
  /* Background */
  --color-background-base: #fcfcfd;
  --color-background-soft: #fff8fb;

  /* Brand */
  --color-primary: #f38fb3;
  --color-primary-hover: #ec7fa8;
  --color-primary-soft: #fde8f0;
  --color-secondary: #a2d2ff;
  --color-accent: #c8b6ff;

  /* Ribbon */
  --gradient-ribbon: linear-gradient(
    120deg,
    #f38fb3 0%,
    #a2d2ff 50%,
    #c8b6ff 100%
  );

  /* Surface */
  --color-surface: #ffffff;
  --color-surface-glass: rgb(255 255 255 / 56%);
  --color-surface-fallback: rgb(255 255 255 / 92%);
  --color-border: #eee6eb;
  --color-border-soft: rgb(255 255 255 / 72%);
  --color-border-glass: rgb(255 255 255 / 76%);

  /* Text */
  --color-text: #40363d;
  --color-text-secondary: #80747c;
  --color-text-muted: #a0959c;

  /* Radius */
  --radius-small: 8px;
  --radius-medium: 14px;
  --radius-large: 24px;
  --radius-avatar: 22px;
  --radius-round: 999px;

  /* Shadow */
  --shadow-card: 0 8px 28px rgb(91 68 82 / 7%);
  --shadow-card-hover: 0 14px 36px rgb(91 68 82 / 11%);
  --shadow-glass: 0 6px 28px rgb(162 210 255 / 12%);
  --shadow-avatar: 0 8px 20px rgb(91 68 82 / 9%);
  --shadow-avatar-hover: 0 12px 28px rgb(91 68 82 / 13%);

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  /* Motion */
  --transition-fast: 160ms ease;
  --transition-normal: 240ms ease;
  --transition-slow: 420ms ease;

  /* Layout */
  --page-max-width: 1120px;
  --page-padding: clamp(16px, 4vw, 40px);
}
```

不要在不同组件中随意增加多个没有设计依据的近似颜色、圆角或阴影值。

如果需要深色模式，应通过同名变量覆盖，而不是在每个组件中重复写深色样式。

---

## 16. 字体与排版

优先使用系统字体，保证中文显示质量和加载速度。

推荐字体栈：

```css
font-family:
  Inter,
  "Nunito",
  "PingFang SC",
  "Microsoft YaHei",
  system-ui,
  -apple-system,
  sans-serif;
```

要求：

- 中文正文优先保证可读性
- 标题可以更圆润，但不使用过度卡通字体
- 不因追求可爱而大量使用手写字体
- 正文行高建议 `1.6`～`1.8`
- 单行正文不宜过宽
- 主标题和正文之间保持明确层级
- 同一页面不混用多套字体

引入网络字体前必须考虑加载性能和字体回退。非必要时不要新增字体依赖。

---

## 17. 微交互规范

微交互用于增加细腻感，而不是吸引全部注意力。

推荐：

- 卡片 Hover：上移 `2px`～`4px`
- 按钮 Active：缩放到 `0.97`～`0.98`
- 标签 Active：缩放到 `0.96`～`0.98`
- 图标 Hover：轻微位移或颜色变化
- 链接 Hover：下划线或柔和颜色变化
- 动画时长：`160ms`～`280ms`

示例：

```css
.interactive {
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-normal),
    color var(--transition-fast);
}

.interactive:hover {
  transform: translateY(-2px);
}

.interactive:active {
  transform: scale(0.98);
}
```

避免：

- Hover 大幅缩放
- 所有元素同时移动
- 持续自动弹跳
- 长时间循环旋转
- 影响点击位置的剧烈动画

---

## 18. 响应式要求

至少检查：

```text
375px
768px
1024px
1440px
```

要求：

- 不出现意外横向滚动条
- 导航在移动端可正常使用
- Bento Grid 在移动端自然变为单列
- 项目卡片能够自动换行
- 文字不能过小
- 按钮和链接保持足够点击区域
- 图片保持比例
- 不使用固定宽度强行撑开布局
- 优先使用 Grid、Flex、`min()`、`max()` 和 `clamp()`
- 移动端适当减少玻璃模糊、背景高度和阴影强度

移动端应按阅读顺序合理重排，不要求机械复刻桌面布局。

---

## 19. 可访问性

尽量做到：

- 图片提供准确 `alt`
- 装饰性图片使用空 `alt`
- 按钮行为使用 `<button>`
- 页面跳转使用 `<a>` 或 `RouterLink`
- 输入框有关联的 `<label>`
- 可点击元素支持键盘操作
- 自定义组件提供明显的 `:focus-visible`
- 文本和背景对比度合理
- 不只使用颜色表示状态
- 尊重 `prefers-reduced-motion`
- 标题层级按顺序使用
- SVG 装饰背景应设置 `aria-hidden="true"`

不要用 `<div @click>` 替代按钮，除非完整实现键盘和语义支持。

---

## 20. 路由规范

路由统一放在：

```text
src/router/index.ts
```

路由页面优先懒加载：

```ts
{
  path: '/projects',
  name: 'projects',
  component: () => import('@/views/ProjectsView.vue'),
}
```

保留 404 页面：

```ts
{
  path: '/:pathMatch(.*)*',
  name: 'not-found',
  component: () => import('@/views/NotFoundView.vue'),
}
```

当前如果采用单页主页，可以只保留首页和 404，不要为了形式创建空路由。

---

## 21. 数据与类型

项目、技能和社交链接应定义明确类型。

示例：

```ts
export interface Project {
  id: string
  name: string
  description: string
  technologies: string[]
  repositoryUrl?: string
  previewUrl?: string
  coverUrl?: string
  featured?: boolean
}
```

数据文件示例：

```ts
import type { Project } from '@/types/project'

export const projects: Project[] = []
```

简单类型可直接写在数据文件中，只有多个文件复用时再抽离到 `src/types`。

---

## 22. 状态管理

当前个人主页不默认使用 Pinia。

优先级：

1. 单组件状态：`ref`、`reactive`
2. 父子通信：props、emits
3. 少量跨组件逻辑：composable
4. 多页面复杂共享状态：Pinia

仅在出现登录状态、后台管理、复杂主题配置或大量跨页面共享数据时考虑 Pinia。

---

## 23. 图标与资源

图标优先统一使用 `lucide-vue-next`。

要求：

- 不混用多套风格差异明显的图标
- 纯图标按钮必须提供 `aria-label`
- SVG 颜色优先使用 `currentColor`
- 不把大量 SVG 源码直接堆入页面模板
- 背景装饰 SVG 可以独立封装为组件
- 图片优先使用 WebP 或 AVIF
- 大图需要压缩
- 非首屏图片使用懒加载

项目封面用于玻璃卡片背景时：

- 必须降低透明度
- 可以添加轻微模糊或渐变遮罩
- 不得影响文字对比度
- 不要把整张高分辨率图片直接当作无压缩背景

---

## 24. SEO 与页面基础

至少维护：

- 页面标题
- Meta description
- favicon
- Open Graph 基础信息
- 语义化标题结构
- 404 页面
- `robots.txt`

不要在个人主页公开密钥、Token、真实地址或不应公开的私人信息。

---

## 25. 性能要求

视觉效果必须兼顾性能。

要求：

- 背景动画优先使用 SVG、`transform` 和 `opacity`
- 避免对大面积元素持续执行高强度 `backdrop-filter`
- 避免同时存在多个无限循环动画
- 图片必须合理压缩
- 非首屏图片使用 `loading="lazy"`
- 避免不必要的 JavaScript 动画循环
- 不使用 JavaScript 持续监听鼠标来驱动背景，除非用户明确要求
- 不随意添加 `will-change`
- 动态背景不应阻塞页面交互
- 移动端必要时禁用非关键动画

如果玻璃效果导致明显掉帧，应优先降低模糊半径、减少卡片数量或使用半透明纯色回退。

---

## 26. 依赖管理

修改依赖前必须：

1. 检查现有 `package.json`
2. 判断能否使用现有能力完成
3. 说明新增依赖用途
4. 避免多个依赖解决同一问题
5. 确认 Vue 3 与 TypeScript 兼容性

禁止：

- 用 `npm install --force` 掩盖依赖冲突
- 把 `--legacy-peer-deps` 当作长期解决方案
- 无理由升级整个依赖树
- 同时引入多个 UI 框架
- 因一个小功能引入体积巨大的库

遇到依赖冲突时，应对齐版本并解释原因。

---

## 27. 修改原则

Agent 修改项目时必须：

- 先阅读相关文件，再修改
- 基于现有代码做最小范围调整
- 尽量保留现有目录、变量名和代码结构
- 不在没有必要时重写整个文件
- 不删除现有功能，除非用户明确要求
- 不擅自改变技术栈
- 不擅自更换包管理器
- 不擅自加入后端
- 不创建无实际用途的抽象层
- 不修改 `node_modules`
- 不手动编辑 `dist`
- 不把构建产物提交到 Git
- 不在源码中写入密钥和 Token
- 不机械照搬外部示例代码
- 应根据项目现状调整设计建议和代码实现

发现现有实现存在问题时，应说明问题并进行针对性修复。

涉及视觉重构时，优先遵循：

1. 保留已有有效内容。
2. 先统一设计变量。
3. 再调整布局结构。
4. 再创建基础 UI 组件。
5. 最后加入背景和微交互。
6. 不用动画掩盖布局问题。

---

## 28. Agent 工作流程

每次任务按以下顺序执行：

1. 阅读用户需求。
2. 检查相关目录和文件。
3. 检查 `package.json` 与已有依赖。
4. 检查现有设计变量和全局样式。
5. 明确需要修改的文件。
6. 优先采用最小可行改动。
7. 完成代码修改。
8. 检查 TypeScript 类型。
9. 检查桌面端与移动端布局。
10. 检查动画降级和基础可访问性。
11. 运行项目已有检查命令。
12. 汇总修改内容和仍需用户决定的事项。

不要在未检查代码的情况下凭空假设项目结构。

---

## 29. 验证命令

执行前先检查 `package.json` 中实际存在的 scripts。

常见命令：

```bash
npm install
npm run dev
npm run type-check
npm run lint
npm run format
npm run build
```

如果命令不存在，不要假装已经运行，应明确说明该 script 未配置。

完成任务后优先验证：

```bash
npm run type-check
npm run lint
npm run build
```

视觉相关改动还应人工检查：

- 375px 移动端
- 768px 平板
- 1024px 小型桌面
- 1440px 桌面
- 键盘焦点
- 减少动态效果模式
- 不支持 `backdrop-filter` 时的回退

---

## 30. Git 规范

不应提交：

```text
node_modules/
dist/
.env
.env.local
编辑器缓存
临时日志
包含密钥的配置
```

提交前检查：

- 无调试输出
- 无临时测试数据
- 无敏感信息
- 无无关格式化改动
- 无大面积不必要重排
- 无未压缩的大型图片
- 无由构建生成的文件

---

## 31. 输出要求

Agent 完成任务后，应简要说明：

- 修改了哪些文件
- 实现了什么功能
- 是否新增依赖
- 执行了哪些检查
- 是否存在未解决问题
- 是否有需要用户提供的头像、项目封面或个人资料

不要只回复“已完成”，也不要输出冗长的逐行修改记录。

---

## 32. 当前项目优先级

优先完成：

1. 整理并统一 `tokens.css`
2. 建立珍珠白静态背景
3. 创建低干扰的 `WaveBackground.vue`
4. 创建 `BaseCard`、`BaseButton`、`BaseTag` 和 `BaseAvatar`
5. 建立 Bento Grid 页面骨架
6. 创建 About、Social、Skills 和 Featured Project 卡片
7. 将个人资料与项目数据抽离
8. 完成移动端单列适配
9. 添加 404 页面
10. 完善标题、描述和 favicon
11. 运行类型检查、Lint 与构建检查

当前不优先：

- 拟物化头像框
- 在线状态卡
- 后台管理系统
- 登录注册
- 数据库
- 复杂状态管理
- 多语言系统
- 完整博客 CMS
- 大型动画系统
- 微前端
- 服务端渲染

---

## 33. 最终原则

代码应服务于个人主页的真实需求。

优先选择：

- 静态主体，局部动态
- 简单而清晰
- 可爱但不杂乱
- 精致但不过度装饰
- 玻璃感适度，不牺牲性能
- 组件化但不过度抽象
- 类型安全但不堆砌类型
- 响应式但不维护两套页面
- 可扩展但不提前实现未知需求

---

## 34. 实施记录

> 本节由 Agent 在关键阶段完成后更新，用于让后续维护者快速了解实际落地状态。

### 2026-08-06 · 项目审计完成

- 当前项目为 Vue 3 + TypeScript + Vite 的初始脚手架，路由表为空。
- `HomeView.vue`、现有首页组件与多数基础 UI 组件均为空文件，没有需要迁移的业务逻辑。
- 已确认现有依赖足以完成本次实现；优先使用原生 CSS、SVG 与 Vite 能力，不新增 UI 或动画库。
- 已确认可用检查命令：`npm run type-check`、`npm run lint`、`npm run build`。
- 本次落地采用集中配置：个人资料、技能、社交链接、项目与站点设置统一维护；文章使用独立 Markdown 目录。
- 视觉签名确定为低透明度的“云层 / 猫尾式丝带”，其余界面保持安静、清晰和内容优先。

### 当前阶段

- [x] 项目、依赖与现有文件审计
- [x] 集中配置与文章内容层
- [x] 设计变量、基础组件与布局组件
- [x] Bento 首页、文章页、404 与 SEO
- [ ] 类型、Lint、构建与视觉验证

### 2026-08-06 · 内容层完成

- 新增 `src/config/site.ts`，集中维护个人资料、导航、社交链接、技能、项目和 SEO 文案。
- 新增 `src/content/articles/`，文章以 Markdown 文件独立保存；新增文章无需改动路由或组件。
- 内容加载器使用 Vite 原生 `import.meta.glob`，将 Markdown 安全解析为标题、段落、列表、引用和代码块，不使用 `v-html`。
- 已放入三篇明确可替换的示例文章；示例个人资料和链接同样集中在配置文件中。
- 未新增第三方依赖。

### 2026-08-06 · 页面与内容体验完成

- 首页已按推荐比例实现 About（宽）、Social、Skills、Featured Project（宽）的 Bento Grid，并在 768px 以下自然降级为单列。
- 新增更多项目区、最近文章区、文章列表、Markdown 文章详情与 404 页面。
- 路由页面已懒加载，包含滚动复位、动态文章标题、基础 Meta description 与 Open Graph 文案。
- `README.md` 已改为面向站点维护者的配置手册；资料和项目改 `src/config/site.ts`，文章只需改 `src/content/articles/*.md`。
- 页面使用语义化标题、链接、按钮、时间元素、跳转主内容链接和清晰的键盘焦点。
- 375px 以下仍保留可用导航与触控尺寸；桌面卡片高度均使用最小高度而非固定行高。

### 2026-08-06 · 视觉方向返工（用户反馈）

- 用户明确指出首版卡片过密、留白不足、缺少图片底图，原首页布局不再作为最终方案。
- 新方向：高级、可爱、现代、简洁；重点通过大幅留白、编辑式非对称排版与少量高质量图片建立质感。
- 首屏取消四张等权 Bento 卡片，改为单一沉浸式图片主视觉；技能与社交降级为轻量信息带。
- 项目区改为一张大幅主项目 + 两个简洁项目条目；文章区改为一篇主文章 + 两篇列表，减少重复卡片。
- 顶部导航由居中胶囊改为页面宽度内的轻薄横栏，降低首屏视觉拥挤。
- 通过 ImageGen 生成并压缩两张项目内 WebP 资产：`hero-cloud-studio.webp`（约 41 KB）与 `project-cloud-craft.webp`（约 35 KB）。
- 两张图均为低饱和珍珠白、雾蓝、浅粉、淡紫体系，无文字、Logo 或水印。
- 受本次用户反馈影响，原“页面与内容体验完成”仅代表功能骨架完成，首页视觉布局进入返工阶段。

### 2026-08-06 · 二次元沉浸式方向确认（第二次返工）

- 用户指定参考 `home.kasuie.cc`、`kasuie/remio-home` 与两张截图，要求彻底重构为有创意的二次元个人主页。
- 已检查线上页面、公开仓库 README、`src/config/config.json` 与依赖结构；参考的核心组织方式为固定全屏背景、集中身份区、图标化社交入口、低透明站点卡、可配置背景特效与页脚。
- 将融合第二张参考的信息层级：技能矩阵、站点/项目分组与更完整的个人信息，但不照搬布局或源码。
- 用户新增明确要求：所有模块均可在配置中控制显隐与内容；实际自定义配置不得提交到 Git。
- 新配置策略：`src/config/site.ts` 保存本地实际配置并加入 `.gitignore`；仓库仅保留无私人信息的 `site.example.ts` 和独立类型定义。
- 用户提供的 `wallpaper1修复.png` 用作首页深蓝二次元背景，`亚托莉.png` 用作友链页“友链花园”背景；`BingWallpaper251227.jpg` 因风格不一致暂不使用。
- 页面风格统一为深蓝/雾蓝/淡紫的半透明玻璃体系，Lucide 线性图标贯穿导航、社交、站点、项目、技能与文章。
- 新增独立友链页，并在全站页脚提供工信部备案与公安备案入口。
- 前一版编辑式首页与 3D 图片不再作为最终渲染方案，仅保留功能代码直至新结构验证完成。

### 2026-08-06 · 私有配置与全局舞台完成

- 新增 `src/config/schema.ts` 定义完整配置类型；模块、导航、社交、快捷入口、项目、技能、文章、友链、背景特效与备案均可独立控制显隐和内容。
- 实际配置使用 `src/config/site.ts`，已加入 `.gitignore`；新增无私人信息的 `src/config/site.example.ts` 作为可提交模板。
- 用户原始图片完整保留，另生成适合网页加载的 `home-bg.webp`（约 301 KB）、`friends-bg.webp`（约 264 KB）与 `avatar-demo.webp`（约 45 KB）。
- 首页使用用户提供的深蓝舞台图，友链页使用用户提供的花园图；背景图片、位置、遮罩、模糊、粒子类型和缓慢移动均来自配置。
- 新增 `ImmersiveBackground.vue`，支持 stars、petals、snow、none 四种低干扰效果，并适配移动端与 `prefers-reduced-motion`。
- 保留用户认可的顶部轻薄玻璃导航结构，仅接入新配置、友链入口与夜空配色。
- 全局页脚已接入配置化工信部备案与公安备案信息，公安图标使用用户指定资源地址。
- 默认主题改为深色以适配二次元夜空背景，用户仍可通过顶部按钮切换。

### 2026-08-06 · 设计系统与全局布局完成

- 新增 `tokens.css`、`reset.css`、`base.css` 与 `animations.css`，统一浅色/深色主题、字阶、间距、圆角、阴影和动效。
- 完成 `BaseCard`、`BaseButton`、`BaseTag`、`BaseAvatar`、`BaseIconButton` 与 `BaseSectionTitle`。
- 完成浮动半透明导航、主题切换、页脚和局部丝带背景；玻璃材质没有互相叠放。
- 交互遵循即时按压反馈；背景动画只使用 `transform`，且对减少动态、减少透明度和高对比度偏好提供回退。
- 头像支持配置图片 URL；未配置时显示可用的首字占位，不依赖额外素材。
- 未新增第三方依赖。

### 2026-08-06 · 导航信息架构完成

- 顶部导航已固定包含“主页、文章、导航、友链、联系”五项，并继续沿用用户认可的轻薄玻璃横栏结构。
- “联系”使用原生 `details/summary` 实现可键盘操作的下拉菜单，默认提供 Bilibili、GitHub 与 QQ 群入口；各入口的链接、图标、颜色和显示状态均由私有配置控制。
- 新增独立 `/navigation` 导航页，将快捷入口与项目入口整合为统一的图标卡片矩阵，避免首页继续堆叠纯文字链接。
- 导航项目类型支持普通站内路由与外部链接子菜单，Lucide 图标系统新增 `compass` 图标映射。
- 小屏幕下收紧导航间距并隐藏重复线性图标，仍保留全部中文导航文字；联系菜单切换为贴近视口右侧的触控友好浮层。

### 2026-08-06 · 文章归档布局与缩略图规则完成

- 文章页采用用户参考图的信息结构：桌面端为左侧粘性作者资料栏与右侧纵向文章列表；平板和移动端自然折叠为单列。
- 仅借鉴布局关系，颜色、玻璃材质、圆角、阴影、Lucide 图标与交互动效继续使用全站统一的夜空二次元设计系统。
- 每篇文章列表项均有独立视觉标识，选择顺序为 Markdown 头部 `icon`、头部 `cover`、正文第一张 Markdown 图片、配置中的封面兜底、统一文章图标。
- `icon` 必须使用站点 Lucide 图标名；`cover` 和正文图片支持远程地址、站点根路径，以及 `src/assets/images` 内的文件名。
- Markdown 内容解析新增图片块，正文首图不仅可用作列表缩略图，也会在文章详情中以带说明的响应式图片正常渲染。
- 三篇示例文章分别演示了 `icon`、`cover` 和“自动读取正文第一张图片”三种写法。
- 用户纠正头像资源后，全站头像已统一改用 `neko-cute.png` 的 768px WebP 压缩版本 `neko-cute.webp`（约 76 KB）；用户提供的两张大图仅作为背景底图，不再裁切或复用为头像。
- 文章图片自动发现范围限定为 `src/assets/images/articles/`，避免将背景原图和无关素材一并打包；文章专用图片应统一放入该目录。
- 原始 PNG/JPG 资源继续保留作为素材源；运行时只引用压缩 WebP，后续新增头像、背景和文章封面也应先按实际展示尺寸压缩。

### 2026-08-06 · 全站背景与品牌图标配置完成

- 修复背景层位于 `body` 不透明背景之后的问题；`app-shell` 建立独立层叠上下文，固定背景现在会在所有页面内容之后稳定可见。
- `appearance.globalBackground` 成为全站基础底图，首页、友链页和内容页仅使用局部 override，避免每个页面重复整套配置。
- 背景配置新增图片透明度、深色遮罩、模糊、灰度、饱和度、亮度、主题染色颜色与染色强度；原有定位、移动端图片、粒子和缓慢移动继续保留。
- 新增 Font Awesome Vue、SVG Core 与 Free Brands 依赖，仅单独导入 Bilibili、GitHub、QQ 三个品牌图标，避免打包整套图标库。
- config 图标项支持 `iconProvider: 'lucide' | 'fontawesome'`；Lucide 继续负责功能图标，Font Awesome 仅用于品牌标识，保持视觉职责清晰。
- 新增 `ConfigIcon.vue` 作为统一适配层，首页社交、文章作者栏、联系下拉、快捷入口、项目、技能与导航页均可从配置选择图标来源。
- 友链图标支持自动发现：条目 `avatar` 自定义覆盖优先，其次按配置直接读取友站 `/favicon.ico` 或使用带 `{domain}`、`{origin}`、`{url}` 占位符的 favicon 服务，失败时回退到首字占位且不显示破图。

### 2026-08-06 · 路由与主题过渡完成

- 顶部导航取消每个链接独立闪现的下划线，改为一条由实际 DOM 尺寸驱动的共享渐变高光；路由切换时高光以弹性曲线滑动到新项目，并随响应式尺寸实时校正。
- 文章详情会继续保持“文章”导航选中状态，首页仅在根路径选中，避免 Vue Router 包含匹配造成状态歧义。
- 全站背景按路由 key 交叉淡入并轻微缩放，使首页、内容页和友链页之间的主题染色与底图切换不再突然闪变。
- 页面材质、上浮与详情过渡分别增加克制的景深、模糊、位移和轻微透视效果；离场保持短促，入场使用更自然的减速曲线。
- 所有新增动画只改变 `transform`、`opacity` 和短时 `filter`，在 `prefers-reduced-motion` 下自动退化为 160ms 淡入淡出，导航高光改为瞬时定位。

### 2026-08-06 · 二次元 Favicon 完成

- 使用 ImageGen 以 `neko-cute.png` 的银白、浅蓝、淡粉配色为参考，生成独立原创的猫耳、云朵与爪印圆形徽记；设计重点是 16px/32px 下仍可识别的粗轮廓与简洁形状。
- ImageGen 两次透明化仍输出了绘制的棋盘格，因此保留其徽记设计，使用本地像素处理仅清除与画布边缘连通的中性棋盘背景，没有重绘主体。
- 新增 `public/favicon.png`、多尺寸 `favicon.ico`、`favicon-32x32.png` 与 `apple-touch-icon.png`，并在 `index.html` 声明对应尺寸。
- 浏览器 `theme-color` 已调整为夜空深蓝 `#0b1230`，与全站深色二次元背景统一。
- 用户确认 GitHub 主页为 `WhiteCloudOL`；私有 `site.ts` 中联系菜单、社交链接、快捷入口、贡献用户名和资料链接已统一更新，可提交的示例配置仍保持匿名。
- `public/robots.txt` 从空文件补为有效的全站允许抓取规则，不暴露本地私有配置路径，也不虚构尚未提供站点域名的 Sitemap。

### 2026-08-06 · 贡献足迹、动态签名与双主题可读性完成

- GitHub 提交足迹不再嵌入白绿配色的远程图；改为通过可配置 `apiUrl` 获取公开数据，并由站点使用深蓝、雾蓝、淡紫、浅粉五级色阶绘制 53×7 矩阵。
- 足迹包含月份、星期、年度总数、强度图例、单日原生提示和 LIVE/SYNC/DEMO 状态；接口失败时使用用户名稳定生成的同风格示例数据。
- `profile.quote` 改为 `quotes` 列表与 `quoteInterval`，首页在多条签名间轮换并重新播放打字动画；文章侧栏稳定显示第一条，减少动态模式不启动轮换计时器。
- 主题状态抽离到共享 `useTheme`；默认深色，仅保存用户主动选择，不再读取或跟随系统主题。
- 补齐浅色 `--anime-*` 变量与 `lightBackground` 配置；浅色背景保留可见底图但降低干扰，卡片使用独立 `lightGlassOpacity` 提高不透明度。
- 修复文章正文、首页项目/技能/快捷入口、社交品牌图标等写死深色值的问题；深色正文使用高对比冷白，浅色正文使用深靛蓝，两个模式均保持背景与内容分层。
- 友链申请区新增配置化 `applicationEmail`，实际邮箱为 `113251172@qq.com`，页面使用可点击 `mailto:` 链接；示例配置不包含用户资料。
- 将原本直接堆在 `App.vue` 的站点背景、顶栏、路由过渡、主体与页脚骨架迁移至 `src/layouts/AppLayout.vue`，使 `layouts` 目录具有明确且实际的公共布局职责。
- 首页动态提示语移除胶囊背景、边框、模糊与内阴影，只保留文字和打字光标，恢复首屏留白与轻盈感。
- 最终验证：`npm run lint`、`npm run type-check`、`npm run build` 全部通过；生产构建只打包压缩后的 WebP 资源，未引入原始大图。
- 最终验证：375px 深色首屏人工检查通过，公共布局迁移后路由内容正常渲染；开发控制台仅有 Vite 连接与热更新调试信息，无业务报错。
- 最终验证：`src/config/site.ts` 命中 `.gitignore`，用户自定义资料不会进入 Git；源码中不存在旧的 `github.com/MeowYunCN`、旧贡献用户名或 `graphUrl` 配置。

### 2026-08-06：真实资料、站点导航、文档导读与 SEO

- 根据公开仓库 README 更新私有 `site.ts`：Bilibili 指向 `109054961`，主要项目替换为 `meowyun_docs`、`PackPilot`、`MaiBot-Manager-TUI`、`maimai-drawpic-plugin`、`astrbot_plugin_joinmanager` 与 `astrbot_plugin_mcstatus`。
- 个人简介与技能调整为真实方向：Python、Rust、TypeScript、QQ 机器人、Minecraft 服务端工具、AI 绘图与部署运维；未使用无法从公开资料确认的描述。
- 新增独立 `sections.navigation` 配置及导航页展示，加入清蒸云鸭文档、服务状态、中转 API 与雨云推广入口；中转 API 明确标注个人自用非商业，雨云明确标注推广链接与非本人网站。
- 将三篇占位文章替换为 AstrBot 部署路线、MaiBot Manager 部署和 Minecraft 服务端包检查导读；新增可选 `sourceUrl` / `sourceLabel` 头部字段，详情页可跳转到清蒸云鸭文档的完整教程。
- SEO 新增 config 化 `siteUrl` / `ogImage`、路由级标题与描述、canonical、Open Graph、Twitter Card、robots 控制、`WebSite` / `Person` JSON-LD 和 Web App Manifest。
- Vite 生产构建根据 `siteUrl` 与 Markdown 文章目录自动生成 `sitemap.xml` 和 `robots.txt`；同时保留 `public` 基础版本，避免新增文章后手动维护部署产物。
- 页脚新增 config 化图片资源免责声明，使用低干扰文本排版，并复用友链申请邮箱提供侵权联系入口；按用户最终决定维持当前页脚顺序。
- 新增顶层 `redirects` 配置与统一风格的 `ExternalRedirectView`；外部短链由 Router 自动注册，`/ry` 使用 `location.replace` 跳转雨云推广地址，跳转页标记 `noindex` 且不写入 Sitemap。
- 私有配置增加 `/docs` → `https://docs.meowyun.cn/` 与 `/status` → `https://status.meowyun.cn/`，和 `/ry` 共用自动注册与回退机制。
- Sitemap 不加入可见导航：它保留为爬虫入口与固定静态地址，避免原始 XML 破坏面向访客的导航内容层级。
- 最终验证：`npm run lint`、`npm run type-check`、`npm run build` 全部通过；构建产物自动生成 4 个公开页面与 3 篇文章的 Sitemap，短链未被收录，robots 指向正确。
- 浏览器验收：导航页展示 4 个站点入口与 6 个真实项目；文章文档按钮、页脚声明、canonical、路由 description 和 `og:type=article` 正常，控制台无 warning/error。
- 再次确认 `src/config/site.ts` 被 `.gitignore` 排除，真实社交链接、项目和短链不会作为私有 config 提交。
- 外部短链新增 `delaySeconds` 配置；`/docs`、`/status` 与 `/ry` 默认显示 10 秒倒计时，可随时手动跳转，组件卸载时清理计时器。

### 2026-08-06：文章目录与全站星光

- 文章解析器从仅支持二、三级标题扩展到一至四级，为正文标题生成稳定、去重的锚点，并把文章主标题作为一级目录项。
- 新增 `sections.articles.toc` 配置，支持目录显隐、标题和 1～4 级范围；默认 `minLevel: 1`、`maxLevel: 2`。
- 新增无厚重卡框的 `ArticleTableOfContents`：桌面端位于正文右侧并 sticky 跟随阅读，当前章节使用细轨道平滑高亮；窄屏按阅读顺序移动到正文前，支持键盘锚点与减少动态效果。
- `PageBackground` 新增独立 `twinkles` 开关；全站默认开启低密度十字星光，使用 `opacity` 与 `transform` 动画，移动端降低数量，减少动态效果时改为静态微光。
- 最终验证：`npm run lint`、`npm run type-check`、`npm run build` 全部通过；`site.ts` 继续命中 `.gitignore`，构建后的 Sitemap 不包含 `/docs`、`/status` 或 `/ry` 短链。
- 浏览器桌面验收：目录位于正文右侧且无厚重卡框，标题锚点可更新 URL 与 `aria-current`；星光层保持低密度并与背景融合。
- 浏览器 375px 验收：目录按阅读顺序位于正文前，无横向溢出；`/docs` 在 1.4 秒后仍显示 9 秒倒计时与手动按钮，离开页面后计时器正确清理；控制台无 warning/error。

### 2026-08-06：EdgeOne History 路由直达修复

- 线上响应实测确认主页返回 `200`，直接请求 `/navigation` 返回源站 `404`，且 EdgeOne 均为缓存未命中；问题来自 History 路由缺少 SPA 回退，不是 CDN 旧缓存。
- 新增仓库根目录 `edgeone.json`，使用 EdgeOne 官方 SPA rewrite 规则把未匹配请求交给 `/index.html`，站内路径与短链可直接访问或刷新。
- Vite 生产构建会将根目录的同一份 `edgeone.json` 复制到 `dist`，同时兼容 Git 构建和直接上传，不维护重复配置源。
- README 新增 EdgeOne 部署与验证说明；部署完成后应再次检查 `/navigation` 返回应用 HTML，且访问地址末尾不能误带中文逗号。
- 最终验证：`npm run lint`、`npm run type-check`、`npm run build` 全部通过，`dist/index.html` 与 `dist/edgeone.json` 均正常生成。
- 路由表复核完成：通配 rewrite 覆盖首页、文章列表、文章详情、导航、友链和 config 动态短链；未知地址仍由 Vue Router 的 catch-all 页面处理，不会被 EdgeOne 直接截成源站 404。
- 用户确认部署架构为“EdgeOne CDN 站点加速 + 独立源站”；线上 `/edgeone.json` 返回 200 且 `/navigation` 仍返回 404，证明 CDN 将配置当作普通静态文件，实际 History 回退必须由源站承担。
- 构建兼容层新增静态路由入口生成：自动为文章列表、导航、友链、全部 Markdown 文章详情和 config 中启用的短链写入 `<route>/index.html`，同时生成 `404.html`；独立源站即使不识别 EdgeOne Pages 配置，也能按目录索引打开所有已知页面。
- 最终验证：`npm run lint`、`npm run type-check`、`npm run build` 全部通过；产物已确认包含 `/articles`、3 个文章详情、`/navigation`、`/friends`、`/docs`、`/status`、`/ry` 的独立 `index.html`。

### 2026-08-06：GitHub 开源发布准备

- GitHub 发布前完成凭据审计：私有 `src/config/site.ts` 已被 `.gitignore` 排除；未发现 `.env`、私钥/证书文件、GitHub/AWS/Google/Slack/Stripe 密钥特征、JWT 或源码硬编码账号密码。
- 凭据关键词命中项均为文章中的安全提醒、`tokens.css` 文件名和 `js-tokens` 依赖名，不包含真实凭据。
- 将本地原始头像、两张原始背景 PNG 与未使用 JPG 加入 `.gitignore`；文件不删除，仅避免将 2～8 MB 原图、潜在元数据及非运行时素材发布，仓库继续保留页面实际使用的压缩 WebP。
- 新增 MIT License，版权标识使用 `WhiteCloudOL`；README 补充开源许可与图片资源权利边界。
- 发布图片元数据复核无 EXIF/GPS，未发现带用户名密码的 URL 或 token/key/secret 查询参数；最终 `npm run lint`、`npm run type-check`、`npm run build` 全部通过。
- 首次提交清单复核移除未被引用的空 `BaseInput`、`BaseModal`、`AboutView`、`ContactView` 占位文件，避免向开源使用者暴露不存在的组件能力。
- 已在 GitHub 账号 `WhiteCloudOL` 下创建公开仓库 `MeowYun`，仓库主页指向 `https://meowyun.cn/`；本地 `origin` 已连接到 `https://github.com/WhiteCloudOL/MeowYun.git`。
- 首次开源版本已推送到远端 `main`；GitHub 端复核仓库为 Public、MIT License 可识别，主题包含 Vue 3、TypeScript、Vite、portfolio 与 personal-website。
- 远端 Git tree 二次确认不包含真实 `src/config/site.ts`、原始头像 PNG、两张原始背景 PNG 或未使用 JPG；本地 `main` 与 `origin/main` 同步。

# 当前目标：方案 A 全站迁移与功能完成

本文件落实用户在 2026-09-15 最新锁定的 Gemini 方案 A，以及“可以修订目标”的指示。它覆盖 REDESIGN_PLAN.md 和旧任务书中冲突的视觉方向与中途等待审美确认要求。原任务尚未完成，不将局部视觉验收当作全站完成。

## 最新反馈补充

- 参考包用于艺术方向；围绕真实内容创作更可爱、辨识度更高的站点，不照抄演示构图或代码。目标是彻底的全站美化。
- 配色继续调浅；保留清楚文字。修复主按钮 href 丢失造成的文本光标和键盘不可达；提供实际可见的局部反馈及录制证据。
- 全站不使用旋转、歪斜、鼠标倾斜动效；文章、项目主体、导航、标签、筛选、主题选项、分页及类似小入口保持水平；状态用底色、边框和短过渡表达。皮肤、背板和少量装饰独立增强，正文与点击目标稳定。
- 漫游六张入口补充主页同类的皮肤回弹、按压、图标与箭头反馈；不让正文跟随变形。全局点击微光覆盖空白、文字、输入与弹层，遵守开关、静止和系统 reduce。

### 漫游增量验收

- 六张卡片的皮肤回弹、真实导航、键盘焦点、三档动效、全局微光和开关重载已验证。
- 1440 / 1024 / 768 / 390 / 375 / 320px、暗色跟随系统和 reduce 共 26 项浏览器检查通过；静止时无持续动画，也不改变背板角度。
- type-check、lint、15 项自动测试与 build 通过；私人 site.ts 哈希未改变，未提交或部署。
- 证据：系统桌面 `清蒸云鸭-方案A全站迁移-20260915-223859/漫游动效验收/`，含前后截图、实际录屏、内嵌图片 HTML 与详细测试 JSON。
- 本次增量不替代下方全站功能与部署验收；全站总任务保持未完成。

## 目标与边界

在当前 Vue 3 / TypeScript 网站上，统一实现「奶霜马卡龙、通透果冻、柔和不对称轮廓、粉/蓝/薄荷错落背板、云朵与稀疏星光、有回应的微弹」；保留真实原头像、内容、路由、收藏稳定 ID、阅读与编辑状态、安全边界和已完成工具。

不回到拱窗/桌板/实体柜子，不回到全部普通白卡；不新增替代网站、重复口袋路由，不复制演示数据，不将设计图切片成页面。正文和输入控件保持稳定、可读，文字和功能使用真实 DOM。

继续完成原定独立功能：真实作品索引及详情、文章查找/收藏/稍后读/阅读设置与位置、收藏口袋与 6 枚本地印章、随机发现、完整明信片编辑及 PNG 导出、配色工具、专注工具、外观和动效偏好、真实小记、关于、友链、联系邮局。无真实公共留言配置时明确未接入，不伪造公共留言或云同步。

**用户最新目标已允许自动 commit、push、发布或部署；实施前仍需完成验收并核实实际发布目标。禁止覆盖私人 site.ts 或回滚用户修改。** CDN 按现有源站 + EdgeOne 准备，不擅自迁移 Pages，不修改真实控制台/DNS。

## 参考证据与缺件

参考目录：`C:/Users/white/Downloads/示例`。

- 已查看 `Gemini_Generated_Image_p19ohwp19ohwp19o.jpg` 原图；目录没有任务中所述的 assets 子目录，按实际文件名记录。
- 已读取 README、INTEGRATION、EDGEONE、tokens、components、motion、三个 composable；pages.css 只参考布局，不整包覆盖。
- 用户补齐后已完整阅读 DESIGN-SPEC.md 与 vue 目录中的八个组件；在浏览器操作 preview.html 的首页、文章、作品、详情、工坊、口袋、组件和主题/动效。SchemeAReference.vue 聚合示例仍未提供，现有参考足以继续。
- 当前项目的真实实现和生产浏览器结果是最终证据，演示成功不能替代生产测试。

## 实施顺序

1. [x] 安全保留工作区，完成下面的组件样板映射；合并到现有 tokens.css 和组件变体，避免第三套末尾覆盖。
2. [x] 实作首页、果冻项目卡、奶霜文章条目、云形头像、云横幅、软糖按钮；与原图并排看真实桌面/手机截图。造型不成立时先修，不批量推广错误风格。
3. [x] 沿方案 A 迁移全部实际页面和控件；用户已锁定 A，**不再等待 B/C 选择或上一阶段的截图批准**。
4. [x] 完成保留的原定未完功能，复核真实收藏→印章→明信片→PNG 路径和各工具边界。
5. [x] 核验 1440/1024/768/390/375/更窄、暗色/系统/reduce、长标题/空数据/资源失败；现有类型、lint、测试、build 与生产 preview。
6. [ ] 系统真实桌面新目录交付前后截图、实际动效视频、组件样板、迁移表、测试记录、内嵌关键图片 HTML 和 ZIP；明确线上 CDN 未验证。

## 组件迁移表（以当前活跃引用为准）

| 现有组件 / 路由 | 方案 A 角色 | 修改文件 | 必须保留的功能 | 验收状态 |
| --- | --- | --- | --- | --- |
| AppLayout / SkyBackdrop | 稀疏大云与淡蓝紫云影背景，阅读区稳定 | layouts/AppLayout.vue；scene/SkyBackdrop.vue；styles/tokens.css | 自然滚动、减少动态、路由与阅读布局 | 已迁移；生产预览已验 |
| AppHeader / ThemeToggle | 奶霜胶囊，粉蓝薄荷浅氛围 | layout/AppHeader.vue、ThemeToggle.vue | 明确文字导航；收藏/联系同组；搜索/外观同组；移动折叠 | 已迁移；桌面/移动与焦点已验 |
| useTheme / useMotion | 现有单例内的主题与灵动/轻柔/静止 | composables/useTheme.ts、useMotion.ts | 旧明确偏好、系统 reduce 优先、后台/离屏暂停、清理 | 已迁移；生产预览已验 |
| HomeView 头像 | 薄高光云形/气泡轮廓、淡粉蓝晕 | views/HomeView.vue；新局部头像组件 | 原图五官/猫耳/发饰、比例、失败回退 | 已迁移；生产预览已验 |
| ProjectCard；/projects；/projects/:slug | 三层果冻卡与稳定详情，彩色错落背板 | content/ProjectCard.vue；ProjectsView.vue；ProjectView.vue | 6 个真实项目、筛选、详情、稳定收藏 ID、相关资料 | 已迁移；生产预览已验 |
| ArticleCard；/articles；/articles/tags/:tag | 奶霜条目和清楚封面 | content/ArticleCard.vue；ArticlesView.vue | 搜索/输入法、query、标签、列表切换、收藏 | 已迁移；生产预览已验 |
| /articles/:slug；阅读工具/目录 | 稳定正文，边缘控件微反馈 | ArticleView.vue；articles/ReaderBookmark、ReadingTools、ArticleTableOfContents、MarkdownContent | 阅读设置、位置提示、目录锚点、高亮/代码复制、来源、html:false | 已迁移；生产预览已验 |
| 首页工坊入口 | 云边缘横幅与稳定侧便签 | HomeView.vue；局部 CloudBanner | 真正进入已有编辑器，非图片链接页 | 已迁移；生产预览已验 |
| /lab；/lab/postcard | 清楚工具布局与柔和面板 | LabView.vue；PostcardView.vue；utils/postcard.ts | 拖动、层级、非拖动控制、撤销/重做、25 层限制、本地图片、PNG | 已迁移；图层、撤销、PNG 与输入边界已验 |
| /lab/palette；/lab/focus | 同一组件系统下的真正工具 | PaletteView.vue；FocusView.vue；utils/colors.ts、focusSession.ts | 色锁/颜色调整/CSS/收藏；截止时间校正/暂停恢复/完成记录 | 已实现；真实输入、输出和存储边界已验 |
| /pocket；SaveButton；PocketNotice | 紧凑口袋、护照、局部真实反馈 | PocketView.vue；content/SaveButton.vue；layout/PocketNotice.vue | 收藏/取消/重载，阅读/稍后读，导入导出/重置，原记录不丢 | 已迁移；收藏、重载、损坏数据与备份已验 |
| DiscoveryMachine；/roam；/navigation | 果冻发现面板与可读导航 | content/DiscoveryMachine.vue；RoamView.vue；NavigationView.vue；LinkCard.vue | 真内容随机且轮内不重复、保存、真实外链、旧锚点兼容 | 已迁移；生产预览已验 |
| /about；/moments；/friends | 同系统的介绍、时间线与友链 | AboutView.vue；MomentsView.vue；FriendsView.vue | 原介绍、实际更新、诚实空态、申请入口 | 已迁移；生产预览已验 |
| /postoffice | 局部信封意象、可编辑邮件与复制 | PostofficeView.vue；content/PublicGuestbook.vue | 清楚说明 mailto≠发送、真实邮箱、可选外部留言边界 | 已实现；真实输入、输出和存储边界已验 |
| BaseButton / Chip / 图标按钮 / 表单 | 软糖皮肤、稳定文字、清楚选中和焦点 | ui/BaseButton.vue；styles/base.css、cottage.css；SearchField.vue | 原生语义、44px、禁用、输入法与清除 | 已迁移；生产预览已验 |
| BasePopover / QuickSearch / DatePicker / 对话框 | 奶霜气泡浮层与稳定日历 | ui/BasePopover.vue、DatePicker.vue；layout/QuickSearch.vue；相关 View | Escape、焦点恢复、同一浮层协调、自定义日期范围/键盘 | 已迁移；日期、浮层、移动与键盘已验 |
| EmptyState / 404 / 外链中转 / LoadRecovery | 同一色彩与形状的错误/空态 | ui/EmptyState.vue；NotFoundView.vue；ExternalRedirectView.vue；layout/LoadRecovery.vue | 真实状态、明确恢复、安全外链、分块失败不刷新编辑页 | 已迁移；生产预览已验 |
| ContributionCalendar / NowNote / UpdateNote / Footer | 奶霜数据面板与清楚辅助信息 | home/ContributionCalendar.vue、NowNote.vue、UpdateNote.vue；layout/AppFooter.vue | 真实贡献、缺失区分、日期查询、真实更新和备案 | 已迁移；生产预览已验 |

历史未引用组件（如 CottageScene、HomeDashboard 等）不因存在文件就计为活跃页面；清理只在确认引用后进行，不删除原素材。

## 交互与完成判据

- 按下约 100ms / 释放约 430ms，动作立即执行；CSS 模拟弹性，不声称物理引擎。
- 皮肤、背板、正文分层，内容与焦点不长期倾斜；按钮释放状态有界，可快速打断。
- 仅少数装饰 2–3px / 6–9s 呼吸；首批列表有限 40–70ms 错峰，筛选不重播整页长入场。
- 系统 reduce 优先；静止只停运动，保留形状、表面与色彩；不清空旧偏好迫使动效出现。
- 可读性在真实背景上检查；辅助文字与控件不能照抄演示的过小尺寸或失真文案。
- 源站与 CDN 缓存分层、真实深链/404、旧哈希分块过渡、查询缓存键与画布安全遵循 EDGEONE_READINESS.md 和参考 EDGEONE.md。生产不复制内联演示脚本，不放宽安全策略。
- 完成必须证明：移除头像仍能识别方案 A；关动画仍有形状与颜色；开动画有回应且不阻碍使用；所有页面与控件属于同一系统；原定功能完整可用；所有要求有真实验收证据。

## 全站验收进展（2026-09-16）

- 已完成 21 个代表路由 × 6 个视口及暗色的 147 个布局样本；768px 云景与长标题背板溢出已修复复验。
- 收藏→口袋→印章→明信片 PNG、配色导出、计时恢复、文章输入法/查询/阅读位置、损坏存储与资源失败均有实际浏览器记录。
- type-check、lint、15 项测试、build 通过；本地源站 36 项检查通过。最终记录正在整理至系统桌面交付目录。
- 可选 giscus 仅完成受控接入边界，未配置真实公共服务；EdgeOne 线上及原生 200% 浏览器菜单缩放仍未验证。明信片草稿仍为当前编辑页内存状态。
- 用户已明确授权本阶段 Conventional Commit 并 push；交付整理与剩余验收继续进行。

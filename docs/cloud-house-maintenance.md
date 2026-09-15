# 云上小屋：内容、数据与上线维护

## 设计来源与当前范围

当前采用用户锁定的方案 A：奶霜马卡龙、通透果冻表面、柔软不对称轮廓、彩色背板和稀疏云光。参考图提供颜色与层次方向，实际插画、原头像承托、内容结构和工具以本项目实现为准。后来修订明确禁止歪斜交互：正文、按钮文字、导航和标签都保持水平。

- 主入口：首页 / 文章 / 作品 / 工坊 / 漫游；收藏、联系、搜索、外观为清楚的工具入口。
- 三个工坊工具均可直达：/lab/postcard、/lab/palette、/lab/focus。
- /roam 连接星图导航、友链、小记、关于、邮局与口袋。
- 保留 /navigation 的旧项目锚点，以及配置中启用的 /docs、/status、/ry 等外链地址。
- 全站公开索引在 src/utils/search.ts；不把本地收藏、信件草稿与计时记录加入索引。

## 作者如何维护

| 内容                     | 来源                                                                | 约束与操作                                                                                                      |
| ------------------------ | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 品牌 / 原头像 / 联系方式 | src/config/site.ts 的 meta、profile                                 | 此文件被 Git 忽略；先复制 site.example.ts，不覆盖已有私人配置                                                   |
| 作品与详情               | sections.projects.items                                             | 稳定 id 决定详情与收藏地址；填写真实用途、technologies、href；audience/status/updatedAt/note 可选，缺失时不推断 |
| 文章                     | src/content/articles/*.md                                           | 文件名为稳定 slug；正文安全渲染，date/updated 必须是真实日期；不要为了活跃修改发布日期                          |
| 文章封面                 | Markdown cover 或 sections.articles.covers                          | 优先本地压缩 WebP/AVIF；真实图片失效时保留可访问回退                                                            |
| 关联内容                 | 文章 tags 与项目 technologies                                       | 按实际共同标签/技术生成，并显示关联理由；不是 AI 推荐                                                           |
| 小记                     | site.ts 的 nowNote/updates 与 src/config/updates.ts                 | 只维护真实事件；文章发布自动进入时间线，不伪装成生活随笔                                                        |
| 友链                     | friendsPage.items                                                   | enabled 且有效真实站点才展示；示例条目不公开；缺少友链显示种子袋空态                                            |
| 新工具                   | src/views + router/index.ts + utils/extraPages.ts + utils/search.ts | 同时添加真实页面、路由、静态入口/SEO 和搜索，完成输出与失败处理后再挂入口                                       |
| 主题 / 组件皮肤          | src/styles/tokens.css                                               | 三套氛围和明暗配色在单一 Token 来源维护；base/cottage/组件 CSS 只消费语义值                                     |
| 动画                     | styles/animations.css、useMotion、viewTransitions、组件皮肤         | 见 motion-map.md；共享图片转场不能把整张卡或正文一起扭动                                                        |
| 印章                     | utils/pocketData.ts、utils/stampPaths.ts、scene/StampArt.vue        | 六枚稳定 id；SVG 与 Canvas 共用路径；只由实际操作发放                                                           |

项目详情使用原创主题插画并明确标注，未声称它是软件运行截图。外部仓库最新兼容要求以其真实文档为准，不虚构下载数或维护状态。

## 浏览器数据与版本

| 键 / 区域                                                 | 内容                                         | 生命周期与边界                                                                                      |
| --------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| meowyun-pocket-v1                                         | 收藏、稍后读、阅读位置、印章、配色、专注记录 | localStorage；导入重建白名单；300 条收藏/阅读、40 组配色、最近 100 段专注；损坏原文不被自动操作覆盖 |
| meowyun-focus-session-v1                                  | 专注阶段、暂停剩余时间或截止时间             | localStorage；按绝对时间校正；跨标签事件同步；页面关闭不承诺提醒                                    |
| meowyun-letter-draft-v1                                   | 称呼、目的、正文                             | sessionStorage；仅当前标签页，称呼 60 字、正文 2000 字；不进入 URL 或服务器                         |
| meowyun-theme                                             | system/light/dark                            | 保留用户显式选择；系统主题变化实时跟随                                                              |
| meowyun-motion / meowyun-quiet                            | full/gentle/off 与旧安静键                   | 新键缺省才读取旧偏好；系统 reduce 优先                                                              |
| meowyun-atmosphere                                        | cream/sky/mint                               | 仅切换氛围，不改收藏；实验配色不会偷偷应用全站                                                      |
| meowyun-pointer-feedback / scenery / guide 对应完整前缀键 | 点击微光、云层星光、云团向导开关             | 分别写入 meowyun-pointer-feedback、meowyun-scenery、meowyun-guide；恢复默认不清空口袋               |
| meowyun-article-view、阅读字号/行距偏好                   | 文章展示与阅读设置                           | 与查询/标签状态分开，列表切换不丢过滤条件                                                           |
| 明信片草稿、ImageBitmap                                   | 当前编辑器画布和本地图片                     | 仅本页内存，离页释放；刷新不承诺恢复；最多 25 层、5 张 5MB/4096px 图片、40 步撤销                   |

所有这些记录属于当前访客，不是站长工作记录、全站统计或云同步。写入失败时当前会话仍可操作，并提示导出/复制。重置或恢复备份有明确确认，不自动覆盖损坏记录。

## 明信片与配色输出

- 明信片输出 1200×800 PNG；独立 Canvas 渲染不包含选框。图层选择、位置按钮、缩放/旋转/透明度、层级与撤销均对应实际数据。
- 图片只接受通过 MIME、文件签名、大小与尺寸检查的 PNG/JPEG/WebP；不接收 SVG/HTML，不上传。
- Canvas 与选择命中共享几何边界；本地图片在卸载时释放；导入期间重新核验图层上限。
- 配色采用类似色与柔和对比色组合；锁定保护自动生成/预设替换，但选中后仍可手动微调。文字对比不足时显示真实提示。
- CSS 导出为五个 --palette-n 变量；复制失败提供手动文本框，不显示假成功。

## 可选 giscus 公共留言

默认没有启用任何公共留言服务。真实可用的本地信纸、复制与 mailto 不依赖它。

接入前由站长在 GitHub 完成公开仓库、启用 Discussions、安装 giscus App 并选择分类；访客发表评论需要 GitHub 账号授权。数据公开保存在 Discussions，可由仓库维护者管理。这不是匿名留言或本地草稿同步。[官方配置说明](https://giscus.app/zh-CN)

1. 在官方配置页生成 repo、repo-id、category、category-id。
2. 将公开参数填入自己的 site.ts.guestbook；检查分类后才设置 enabled: true。字段不需要 Token，禁止填服务器秘密。
3. PublicGuestbook 仅在配置完整且访客点击“加载公共留言”时异步加载 @giscus/vue。邮件草稿没有传给组件。
4. 使用官方 light / dark_dimmed 主题；只维护外围容器，不承诺重画 iframe 的结构。消息接收核验来源与具体 iframe。
5. 可在评论仓库用 giscus.json 限制允许的站点 origin。真实 CSP 需要允许 giscus iframe；本轮没有放宽生产 CSP，也没有替站长安装 App。[高级配置](https://github.com/giscus/giscus/blob/main/ADVANCED-USAGE.md)
6. 上线前验证账号授权、真实评论/删除、网络失败、主题跟随与移动端；当前无有效配置，记录为“接入边界已实现，公共服务未接通”。

依赖 @giscus/vue 3.1.1 / giscus 1.6.0 为官方维护的 Vue 适配与组件；生产独立按需分块，不在首页启动评论请求。组件库管理 iframe 生命周期，不自行拼装不受支持的 widget URL。

## 发布与缓存

- 先执行 npm run type-check、npm run lint、npm test、npm run build，再 npm run preview 验证生产构建。
- dist 由 Vite 生成，不手工修改。新增真实路由同时维护 router/index.ts、extraPages.ts 和构建插件；私人口袋、明信片和邮局为 noindex。
- 生产架构继续按现有源站 + EdgeOne CDN；edgeone.json 只对对应 Pages 场景有意义，不会替普通源站配置回退。
- HTML 与非哈希内容重新验证；清单中的哈希分块长缓存；404/API 错误不缓存成页面；不能全局忽略 query。
- 发布时先上传新资源再切 HTML，保留旧哈希分块让旧标签页继续工作；只清理变化的非哈希内容。不要用覆盖整个静态目录的删除同步丢掉旧分块。
- 独立图片域名需验证 CORS 与画布导出；同域资源不必为了 CDN 改为跨域。详情见 EDGEONE_READINESS.md。
- 本地 scripts/verify-origin.mjs 验证缓存分类、br/gzip、深链与真实缺失资源；每次重新 build 后重启该验收进程以重新读取 manifest。
- EdgeOne 控制台、真实 DNS、线上缓存命中与旧版本资源保留，需在具体发布目标中复核。本轮本地验证不能当作线上部署证据。

## 验收材料

桌面目录含一致尺寸的前后截图、全站多尺寸/暗色截图、实际交互视频、实际 PNG/CSS 下载、功能与源站 JSON、动效与维护文档。浏览器无头模式未响应原生缩放快捷键；200% 浏览器菜单缩放需在用户实际浏览器补充检查，不能把 CSS 视口重排冒充原生缩放。

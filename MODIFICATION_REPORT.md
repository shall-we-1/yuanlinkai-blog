# 第一阶段修改报告

## 1. 项目基线与目录

- 正式项目目录：`D:\webblog\devosfera-blog`
- 唯一基线：Devosfera 官方仓库 `https://github.com/0xdres/astro-devosfera.git` 的 `main` 分支源码。
- 由于当前网络环境无法通过 GitHub 443 端口完成 `git clone`，改用 GitHub 官方 codeload 下载同一 `main` 分支 ZIP；ZIP 不包含上游 Git 历史，因此在本地创建了 `upstream-main` 基线分支和基线提交 `c84ae8e`，并在 `chinese-personal-blog` 分支上实施本阶段修改。
- 保留原项目的 Astro、Tailwind CSS、Pagefind、目录结构、路由、动画、Cursor Glow、主题切换、搜索、归档、标签、RSS、OG 图生成等核心能力，没有更换框架或重新设计视觉系统。
- `README.md` 与 `LICENSE` 未修改，Devosfera、AstroPaper 和开源许可归属保留完整。
- Windows 基线兼容：`package.json` 的构建脚本使用 Node `fs.cpSync` 代替原脚本中的 Unix `cp`，使官方项目在 Windows PowerShell 下能完成同等复制步骤。

## 2. 逐文件修改说明

### 根目录与配置

- `.env.example`：清空原作者社交账号示例值，保留可填写的环境变量名。
- `.env`：创建本地、被 Git 忽略的空白个人信息配置，所有社交与编辑链接均为空。
- `astro.config.ts`：目录标题改为“目录”，折叠提示改为“展开目录”。
- `package.json`：新增 `canvas-nest.js` 依赖；构建脚本采用 Windows 可执行的 Node 文件复制方式。
- `pnpm-lock.yaml`：记录 `canvas-nest.js@2.0.4` 及其依赖解析结果。

### Canvas Nest

- `src/components/CanvasNest.astro`：新增独立背景组件；实现桌面端初始化、单实例管理、销毁清理、Astro 客户端导航生命周期、媒体条件变化监听、点击穿透和安全层级。
- `src/canvas-nest.d.ts`：为当前 npm 包补充本地 TypeScript 模块声明。
- `src/layouts/Layout.astro`：挂载 `CanvasNest`，将正文内容置于粒子层之上，并保留原站背景与页面过渡；同时移除原作者结构化个人资料。

Canvas 参数固定为：

```ts
{
  color: "0,0,255",
  pointColor: "0,0,255",
  opacity: 0.7,
  count: 99,
  zIndex: 0,
}
```

组件在 `max-width: 768px` 或 `prefers-reduced-motion: reduce` 时不创建 Canvas；背景容器和 Canvas 均为 `pointer-events: none`。客户端换页前销毁实例，换页后重新初始化，避免重复叠加。

### 站点身份、导航与公共组件

- `src/config.ts`：站点标题改为“我的知识空间”，作者改为“作者”，描述、语言、时区和首页终端提示中文化；关闭图片集、音频和在线编辑入口。
- `src/constants.ts`：清除原作者社交信息来源，中文化分享入口与邮件主题。
- `src/components/Header.astro`：移除 Devosfera 图形标志，使用中文站名；桌面导航、搜索、主题按钮及无障碍文本中文化；按配置隐藏图片集和音频入口。
- `src/components/MobileMenu.astro`：移动端菜单、搜索、主题提示中文化，并遵循功能关闭配置。
- `src/components/Footer.astro`：替换原作者与品牌文案，移除无配置的社交链接展示。
- `src/components/SearchModal.astro`：Ctrl+K 弹窗标题、按钮、提示、键盘说明和 Pagefind 文案中文化。
- `src/components/Breadcrumb.astro`：面包屑与返回操作中文化，并支持中文路由名称。
- `src/components/Datetime.astro`：日期标签和中文日期格式。
- `src/components/Pagination.astro`：分页按钮与无障碍文本中文化。
- `src/components/BackToTopButton.astro`：返回顶部文本中文化。
- `src/components/ShareLinks.astro`：分享区标题中文化。

### 布局、页面与脚本

- `src/layouts/AboutLayout.astro`：移除原作者头像式装饰和身份标签，保留 Devosfera 关于页布局。
- `src/layouts/PostDetails.astro`：文章作者、日期、阅读时间、目录、标题锚点、代码复制、分享、结束标记、上一篇/下一篇等界面中文化。
- `src/pages/index.astro`：首页标题、主标语、辅助标语、精选文章、最近文章、全部文章入口和 RSS 提示中文化。
- `src/pages/about.md`：改为无虚构身份的中文个人知识空间说明。
- `src/pages/posts/[...page].astro`：文章列表标题、数量、搜索状态和空结果文案中文化。
- `src/pages/search.astro`：独立搜索页及搜索异常提示中文化。
- `src/pages/archives/index.astro`：归档标题、统计与月份中文化。
- `src/pages/tags/index.astro`：标签页标题、统计与卡片文案中文化。
- `src/pages/tags/[tag]/[...page].astro`：标签详情页标题、统计与空状态中文化。
- `src/pages/404.astro`：404 页面中文化。
- `src/scripts/theme.ts`：桌面和移动端主题按钮无障碍名称中文化。
- `src/utils/breadcrumbs.ts`：新增固定路由的中文名称映射。
- `src/utils/readingTime.ts`：阅读时间改为中文格式。
- `src/utils/slugify.ts`：为本阶段中文标签提供稳定英文 URL 映射。
- `src/utils/pagefindTranslations.ts`：新增统一的 Pagefind 中文界面文案。

### 新增演示文章

- `src/data/blog/start-recording.md`：新增《开始记录》。
- `src/data/blog/why-write-after-reading.md`：新增《读书之后，为什么要写下自己的想法》。
- `src/data/blog/useful-study-notes.md`：新增《如何整理一份真正有用的学习笔记》，包含目录、列表、代码块和引用块。
- `src/data/blog/thoughts-on-long-term-recording.md`：新增《关于长期记录的一点思考》。

### 删除的原演示内容

已从正式项目删除以下 11 篇原英文演示文章：

- `src/data/blog/advanced-postgresql-jsonb.md`
- `src/data/blog/autonomous-ai-agents-2026.md`
- `src/data/blog/docker-compose-best-practices.md`
- `src/data/blog/hidden-danger-of-open-source.mdx`
- `src/data/blog/modern-css-2026.md`
- `src/data/blog/react-19-new-apis.md`
- `src/data/blog/rust-for-javascript-devs.md`
- `src/data/blog/terminal-productivity-2026.md`
- `src/data/blog/typescript-5-new-features.md`
- `src/data/blog/urban-city-photography.mdx`
- `src/data/blog/vibe-coding-new-era.md`

图片集功能的实现代码仍然保留，但展示已通过配置关闭；原图片集索引与演示资源已从正式项目移出：

- `src/data/galleries/urban-photography/index.md`
- `src/data/galleries/urban-photography/20260128_181038.webp`
- `src/data/galleries/urban-photography/20260128_181053.webp`
- `src/data/galleries/urban-photography/20260128_181457.webp`
- `public/audio/intro-web.mp3`
- `public/devosfera-og.webp`
- `src/assets/images/comic.webp`
- `src/assets/logo/devosfera.svg`

二进制原始资源保存在可恢复备份目录 `D:\webblog\devosfera-upstream-assets-backup`，未永久擦除。

## 3. 新增依赖

- `canvas-nest.js@2.0.4`：用于蓝色粒子/连线背景。
- 没有引入新的前端框架、CSS 框架或内容系统。

## 4. 验证结果

- 原项目基线：依赖安装成功；修正 Windows 文件复制命令后，官方基线完整构建成功。
- `pnpm run lint`：通过。
- `pnpm run build`：通过。
- Astro Check：66 个文件，0 errors、0 warnings、0 hints。
- Astro Build：18 个页面构建完成。
- Pagefind：识别 `zh-cn`，成功索引 4 篇文章；中文关键词“记录”“学习”均返回正确结果。
- 源码与公开资源检索：未发现原作者姓名、账号、站点地址或原演示内容标识；`README.md` 和 `LICENSE` 中的必要项目/许可归属除外。
- Windows Edge 桌面端：验证首页、文章列表、归档、标签、关于、搜索、两篇文章详情、上一篇/下一篇、目录、代码块、引用块、深浅主题、Ctrl+K；客户端导航控制台 0 错误。
- Canvas：桌面端存在 1 个实例；连续客户端导航后仍为 1 个；层级位于正文下方且不拦截鼠标。
- 移动端 390×844：Canvas 数量为 0，菜单可用，无横向溢出。
- `prefers-reduced-motion: reduce`：桌面宽度下 Canvas 数量为 0。
- 视觉检查：浅色、深色和移动端截图均未发现中文溢出、内容遮挡或明显布局破坏；Devosfera 原有视觉语言和 Cursor Glow 保留。
- 构建期间仅出现预期提示：图片集已关闭且没有图片集内容；Pagefind 对 `zh-cn` 不提供词干分析，但中文原词搜索正常。

## 5. 本地访问

当前开发服务器：

```text
http://localhost:4321
```

如果当前 PowerShell 尚未配置便携 Node，可执行：

```powershell
$env:Path = "D:\webblog\tools\node-v24.20.0-win-x64;$env:Path"
$env:COREPACK_HOME = "D:\webblog\tools\corepack"
$env:PNPM_HOME = "D:\webblog\tools\pnpm-home"
cd D:\webblog\devosfera-blog
pnpm run dev
```

## 第二阶段：正式版本与 GitHub

- 网站名称：已由“我的知识空间”改为“袁琳凯”；Header、Hero、浏览器标题、SEO、Open Graph、Twitter metadata、RSS 与其他由 `SITE.title` 驱动的位置均已同步。
- 作者署名：已由中性“作者”改为“袁琳凯”，未增加头像或个人介绍。
- 文章：四篇中文 Demo 已全部删除；`src/data/blog` 当前为 0 篇正式文章，未创建替代测试内容。
- 零文章状态：首页、文章列表、归档、标签、搜索和关于页均可正常打开；首页与文章/归档页显示“暂无文章”，标签页显示“暂无标签”；没有 `undefined`、`null`、`NaN`、500、空白页或 Astro 页面错误。
- Lint：`pnpm run lint` 通过。
- Build：强制刷新 Astro 内容层缓存后，`pnpm run build` 通过；Astro Check 为 0 errors、0 warnings、0 hints，最终生成 8 个静态页面且不再包含 Demo 路由。
- 浏览器检查：Windows Edge 真实 localhost 验证通过，指定页面无横向溢出，最终控制台为 0 错误；首页保留原标语、主题文案、终端提示和已冻结视觉效果。
- Git 正式提交：`Finalize Yuan Linkai personal blog`（提交 hash 将在完成提交后回填）。
- 正式分支：提交后由 `chinese-personal-blog` 重命名为 `main`；`upstream-main` 保留。
- GitHub 目标仓库：`https://github.com/shall-we-1/yuanlinkai-blog`。
- Push：未执行。当前 Codex 环境中的 GitHub CLI 未读取到认证状态；同时本地 `origin` 指向 `https://github.com/0xdres/astro-devosfera.git`。根据本阶段安全规则，未修改凭据、未修改或删除现有远程，也未尝试创建仓库或推送。

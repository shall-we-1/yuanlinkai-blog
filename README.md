# 个人知识博客

这是我的个人知识博客，用于记录阅读、学习、技术和生活中的一些思考。

网站整体基于 Astro 构建，并在 Devosfera / AstroPaper 的基础上进行了中文化和视觉调整。

## 功能

- 中文个人博客
- Markdown / MDX 文章
- 深色 / 浅色模式
- 全文搜索
- 标签与归档
- 独立图片集合、图片描述与文章关联
- 按文章配置本地配乐，低音量播放及浏览器拦截提示
- 响应式页面
- Canvas Nest 鼠标粒子连线背景
- SEO、RSS 与 Sitemap

## 本地运行

项目需要：

- Node.js 20+
- pnpm

安装依赖：

```bash
pnpm install
```

启动开发服务器：

```bash
pnpm run dev
```

在线访问：

```text
https://yuanlinkai-blog.3449185324.workers.dev/
```

生产构建：

```bash
pnpm run build
```

本地预览生产版本：

```bash
pnpm run preview
```

## 写文章

文章存放在：

```text
src/data/blog/
```

新建 `.md` 或 `.mdx` 文件即可添加文章。

文章元数据请遵循项目当前 Content Schema。

## 发布图片

“图片”入口位于导航栏，地址是 `/galleries/`。每张图片独立保存描述，点击后直接进入关联文章；多张图片可以关联同一篇文章，不会把图片插入文章正文。

1. 将照片放到 `src/assets/photos/`（可自行建立按年份或文章命名的子目录）。
2. 编辑 `src/data/photos.json`，每张照片增加一条记录。例如：

```json
[
  {
    "id": "autumn-leaves",
    "image": "../assets/photos/autumn-leaves.jpg",
    "description": "今年终于等到了秋天。",
    "alt": "公园小路上铺满落叶",
    "post": "keep-walking",
    "order": 10
  }
]
```

`image` 相对于 `src/data/photos.json`；`id` 必须唯一。`post` 是文章 ID，通常是去掉 `.md` 的文件名（不是文章标题或完整网址）。`description` 是显示在图片下方的文字，`alt` 可选，用来描述图片内容。`order` 越小越靠前；相同顺序按 ID 排列。设置 `draft: true` 可暂时隐藏图片。关联草稿或尚未发布的文章时，正式网站也会隐藏图片；关联不存在的文章会阻止构建。无标题文章使用日期作为链接说明，不会修改文章标题。

图片使用 Astro 的优化处理，按设备尺寸加载并保持原有比例。建议上传处理过的 JPG、PNG 或 WebP 展示版，保留原图在本地备份。这个阶段通过文件和 GitHub 发布，没有网页上传后台或外部存储。

## 为文章上传配乐

1. 将自己的音频放到 `public/audio/`，例如 `public/audio/autumn.mp3`。
2. 在对应文章开头的 `---` 元数据中添加：

```yaml
music:
  src: "/audio/autumn.mp3"
  title: "配乐名称"
  artist: "音乐人（可选）"
  loop: true
```

`src` 必须指向 `public/audio/` 下存在的文件，支持 MP3、M4A、OGG 和 WAV；请使用字母、数字、短横线或下划线命名，可以建立子目录。优先选择 MP3 以便跨浏览器播放。单个文件不能超过 25 MiB，空文件或文件缺失会阻止发布。`loop` 可省略，默认循环播放。普通歌曲分享网页不是音频文件；此版本使用你自行上传的本地音频。

进入配置了配乐的文章会尝试自动播放，初始音量为 12%，播放器最多调到 30%。浏览器可能要求先点击，届时显示播放按钮；手机系统可能接管音量，无法保证物理响度，建议使用适合轻声播放的音频副本。从图片点击进入文章时，会利用这次点击启动对应配乐。暂停或静音后，本次标签页访问不再自动播放，点击播放可恢复。

切换文章时停止旧配乐；离开文章回到图片集合时停止播放。没有 `music` 配置的文章不显示播放器、不请求音频。现有纯文字文章和无标题文章无需修改。音乐的暂停、静音和音量偏好只存在当前浏览器标签页，不上传服务器。

图片、音频、JSON 与文章配置一起提交，然后运行 `pnpm run build` 验证并推送。初始图片集合为空；只有添加真实照片和配乐后才会出现相应内容。

## 项目结构

```text
src/
├── components/
├── layouts/
├── pages/
├── data/
│   └── blog/
├── styles/
└── utils/
```

## 技术栈

- Astro
- Tailwind CSS
- Pagefind
- Markdown / MDX
- Canvas Nest

## 致谢

本项目基于以下开源项目进行修改：

- Devosfera
- AstroPaper

原项目版权及许可信息请查看：

```text
LICENSE
```

## License

本项目继续遵循仓库中的 MIT License。

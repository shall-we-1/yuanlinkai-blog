# 个人知识博客

这是我的个人知识博客，用于记录阅读、学习、技术和生活中的一些思考。

网站整体基于 Astro 构建，并在 Devosfera / AstroPaper 的基础上进行了中文化和视觉调整。

## 功能

- 中文个人博客
- Markdown / MDX 文章
- 深色 / 浅色模式
- 全文搜索
- 标签与归档
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

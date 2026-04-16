# my_site_frontend

React 重写版博客前端（Vite + React Router），用于消费 Django 提供的 `/api/mysite/v1/*` 接口。

## 开发运行

```bash
npm install
npm run dev
```

默认后端地址：`http://127.0.0.1:8000`

可通过环境变量覆盖：

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## 生产构建

```bash
npm run build
npm run preview
```

## 已接入接口

- `GET /api/mysite/v1/home/`：首页聚合数据（文章、热门、分类、标签、归档、轮播、友链）
  - 支持筛选参数：`keyword`、`tag`、`classification`、`year`、`month`、`page_num`、`page_size`
- `GET /api/mysite/v1/articles/:id/`：文章详情（正文、上下篇、相关文章）
- `GET /api/mysite/v1/comments/`：评论列表（参数：`target`、`page_num`、`page_size`）
- `POST /api/mysite/v1/comments/`：提交评论（`nickname`、`email`、`website`、`content`、`target`、`parent_comment_id`）

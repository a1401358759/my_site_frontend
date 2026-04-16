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

## Docker 部署

### 1. 配置环境变量

```bash
cp .env.docker.example .env.docker
```

至少需要确认：

- `FRONTEND_PORT`：前端容器映射端口（默认 `8080`）
- `VITE_API_BASE_URL`：后端 API 地址（会在构建时注入）

### 2. 启动容器

```bash
docker compose --env-file .env.docker up -d --build
```

### 3. 停止容器

```bash
docker compose down
```

### 4. 访问地址

默认访问：`http://127.0.0.1:8080`

## 已接入接口

- `GET /api/mysite/v1/home/`：首页聚合数据（文章、热门、分类、标签、归档、轮播、友链）
  - 支持筛选参数：`keyword`、`tag`、`classification`、`year`、`month`、`page_num`、`page_size`
- `GET /api/mysite/v1/articles/:id/`：文章详情（正文、上下篇、相关文章）
- `GET /api/mysite/v1/comments/`：评论列表（参数：`target`、`page_num`、`page_size`）
- `POST /api/mysite/v1/comments/`：提交评论（`nickname`、`email`、`website`、`content`、`target`、`parent_comment_id`）

# =============================================================================
# Stage 1: Builder (编译阶段)
# =============================================================================
FROM node:22-alpine AS builder
WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@9.15.1 --activate

# 复制依赖文件（利用 Docker 缓存）
COPY package.json pnpm-lock.yaml ./

# 安装全量依赖（编译时需要 devDeps）
RUN pnpm install --frozen-lockfile

# 复制源码
COPY . .

# 编译环境变量
ARG REMARK_URL
ARG REMARK_SITE_ID
ARG UMAMI_ID
ARG UMAMI_ENDPOINT
ENV REMARK_URL=${REMARK_URL}
ENV REMARK_SITE_ID=${REMARK_SITE_ID}
ENV UMAMI_ID=${UMAMI_ID}
ENV UMAMI_ENDPOINT=${UMAMI_ENDPOINT}

# 执行构建：生成 dist/server 及其入口文件
RUN pnpm build

# =============================================================================
# Stage 2: Production (运行时阶段)
# =============================================================================
FROM node:22-alpine AS production
WORKDIR /app

# 设置生产环境变量
ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production

# 从 builder 阶段复制构建产物和必要的依赖
# 注意：SSR 运行需要 node_modules 中的运行时依赖
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# 暴露 Astro 默认端口
EXPOSE 4321

# 启动 SSR 服务
# 默认情况下 @astrojs/node 生成的入口文件路径如下
CMD ["node", "./dist/server/entry.mjs"]

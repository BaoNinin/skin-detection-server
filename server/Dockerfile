# 第一阶段：构建阶段
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json
COPY package.json ./

# 安装所有依赖（包括 devDependencies）
RUN npm install --silent

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 第二阶段：运行阶段
FROM node:18-alpine AS runner

# 设置工作目录
WORKDIR /app

# 从构建阶段复制 package.json
COPY package.json ./

# 只安装生产依赖
RUN npm install --production --silent

# 从构建阶段复制 dist 目录
COPY --from=builder /app/dist ./dist

# 暴露端口（云托管使用 80 端口）
EXPOSE 80

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:80/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用
CMD ["node", "dist/main"]

# 使用 Node.js 18 Alpine 镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖（包含开发依赖，用于构建）
RUN npm install --production=false

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 清理开发依赖（只保留生产依赖）
RUN npm prune --production

# 暴露端口（微信云托管使用 80 端口）
EXPOSE 80

# 设置环境变量
ENV PORT=80
ENV NODE_ENV=production

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:80/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用（直接使用 node 运行编译后的代码）
CMD ["node", "dist/main.js"]

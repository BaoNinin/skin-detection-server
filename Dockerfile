# 使用官方 Node.js 镜像作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制根目录的 package.json 和 lock 文件
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装根目录依赖
RUN pnpm install --frozen-lockfile

# 复制 server 目录的 package.json
COPY server/package*.json ./server/

# 安装 server 依赖
RUN pnpm install --filter server --frozen-lockfile

# 复制整个项目
COPY . .

# 构建 server
RUN pnpm build:server

# 暴露端口
EXPOSE 80

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=80

# 启动应用
CMD ["node", "server/dist/main"]

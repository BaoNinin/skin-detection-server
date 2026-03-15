# 使用官方 Node.js 18 镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production

# 安装 pnpm
RUN npm install -g pnpm

# 复制 package.json 和 pnpm-lock.yaml（根目录的）
COPY package.json ./

# 安装依赖
RUN pnpm install

# 复制源代码
COPY . .

# 构建项目
RUN pnpm build

# 暴露端口（云托管健康检查端口）
EXPOSE 80

# 启动应用
CMD ["pnpm", "start:prod"]

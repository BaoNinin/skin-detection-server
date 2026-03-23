# 使用官方 Node.js 镜像作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install --production=false

# 复制源代码
COPY . .

# 构建项目
RUN npm run build

# 安装生产环境依赖
RUN npm prune --production

# 暴露端口
EXPOSE 80

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=80

# 启动应用
CMD ["node", "dist/main"]

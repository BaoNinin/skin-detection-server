# Docker 容器启动问题修复

## 问题描述

微信云托管部署失败，错误信息：

```
sh: nest: not found
```

## 问题原因

在 Dockerfile 中：

```dockerfile
# 安装依赖（包含开发依赖）
RUN npm install --production=false

# 构建应用
RUN npm run build

# 清理开发依赖（只保留生产依赖）
RUN npm prune --production

# 启动应用
CMD ["npm", "run", "start"]
```

`npm run start` 执行的是 `nest start` 命令，但是：

1. `@nestjs/cli` 包在开发依赖中
2. `npm prune --production` 删除了所有开发依赖
3. 导致容器中找不到 `nest` 命令

## 解决方案

将启动命令从 `npm run start` 改为直接使用 `node` 运行编译后的代码：

```dockerfile
# 启动应用（直接使用 node 运行编译后的代码）
CMD ["node", "dist/main.js"]
```

## 优势

1. **更简洁**：不需要在生产镜像中保留开发工具
2. **更轻量**：镜像体积更小
3. **更稳定**：不依赖 npm 脚本的执行
4. **更快速**：直接运行编译后的 JS 文件，无需额外的 CLI 调用

## 完整修复后的 Dockerfile

```dockerfile
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
```

## 验证

修复后的镜像应该能够正常启动：

```bash
# 本地构建测试
docker build -t skin-detection-serve .

# 本地运行测试
docker run -p 3000:80 -e PORT=80 skin-detection-serve

# 检查日志
docker logs <container-id>
```

期望看到的日志：

```
SkinService 初始化完成，使用模型: ep-20260324135258-7shrd
使用豆包端点模型进行皮肤分析
使用云存储保存图片
✅ Server running on http://localhost:80
```

## 提交信息

```
fix: 修复 Docker 容器启动问题，使用 node 直接运行编译后的代码
```

## 部署状态

- ✅ 代码已修复
- ✅ 已推送到 GitHub
- ⏳ 等待微信云托管自动触发部署

## 相关问题

### 如果遇到其他启动问题

1. **端口绑定失败**
   - 检查 `PORT` 环境变量是否设置为 `80`
   - 确认 `EXPOSE 80` 配置正确

2. **健康检查失败**
   - 确认 `/api/health` 端点存在
   - 检查服务器启动时间是否在 `start-period` 之内

3. **环境变量未加载**
   - 确认所有必需的环境变量已配置
   - 查看容器日志确认环境变量值

## 参考资料

- NestJS 最佳实践：https://docs.nestjs.com/techniques/performance
- Docker 多阶段构建：https://docs.docker.com/build/building/multi-stage/
- 微信云托管部署：https://docs.cloudbase.net/run/

---

**修复时间**: 2025-03-24
**提交**: `c7a1134`
**状态**: ✅ 已修复并推送

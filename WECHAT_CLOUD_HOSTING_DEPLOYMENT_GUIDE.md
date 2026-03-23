# 微信云托管部署指南

## 📋 前置准备

### 1. 确认 GitHub 仓库

```
仓库地址：https://github.com/BaoNinin/smart-skin-detection.git
分支：main
```

### 2. 确认环境变量

| 变量名 | 值 |
|--------|-----|
| COZE_API_KEY | 8f38a8d0-b6d4-481c-8e15-b93bb30c7444 |
| COZE_MODEL | doubao-vision |
| WECHAT_APP_ID | wxf218fed093b4e374 |
| WECHAT_APP_SECRET | a869daf192fc52fddd1ac6269948e749 |
| CLOUDBASE_ENV_ID | cloud1-7gi0fykp49ab039a |
| NODE_ENV | production |

---

## 🚀 部署步骤（推荐方案）

### 方案一：仅部署后端服务（推荐）

#### 1. 登录微信云托管控制台

访问：https://console.cloud.tencent.com/tcb/service

选择环境：`prod-8g9r8x6c43dcafcb`

#### 2. 创建新服务

点击「新建服务」，填写以下信息：

```
服务名称：skin-detection-api
服务版本：v1
```

#### 3. 配置代码来源

```
代码来源：GitHub
仓库地址：https://github.com/BaoNinin/smart-skin-detection.git
分支：main
目标目录：server/
```

**关键配置：**
- ✅ 目标目录必须填写 `server/`
- ✅ Dockerfile 位置：`server/Dockerfile`

#### 4. 配置构建参数

```
构建方式：使用 Dockerfile
Dockerfile 路径：Dockerfile（在 server 目录下）
```

**说明：**
- 不需要填写构建命令
- 不需要填写启动命令
- 完全由 Dockerfile 控制

#### 5. 配置端口

```
端口：80
```

#### 6. 配置环境变量

点击「添加环境变量」，逐个添加：

```
COZE_API_KEY=8f38a8d0-b6d4-481c-8e15-b93bb30c7444
COZE_MODEL=doubao-vision
WECHAT_APP_ID=wxf218fed093b4e374
WECHAT_APP_SECRET=a869daf192fc52fddd1ac6269948e749
CLOUDBASE_ENV_ID=cloud1-7gi0fykp49ab039a
NODE_ENV=production
```

#### 7. 创建服务

点击「创建」，等待构建和部署完成。

---

## 🔍 部署验证

### 1. 查看部署日志

在服务详情页面，点击「日志」标签，查看构建和启动日志。

**成功标志：**
```
✅ Build succeeded
✅ Application is running
```

### 2. 获取服务地址

部署成功后，服务地址为：
```
https://skin-detection-api.prod-8g9r8x6c43dcafcb.sh.run.tcloudbase.com
```

### 3. 测试健康检查接口

```bash
curl https://skin-detection-api.prod-8g9r8x6c43dcafcb.sh.run.tcloudbase.com/health
```

返回 `{ "status": "ok" }` 表示服务正常运行。

---

## 📦 Dockerfile 说明

### server/Dockerfile（推荐）

这是为后端服务优化的 Dockerfile：

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production=false
COPY . .
RUN npm run build
RUN npm prune --production
EXPOSE 80
ENV NODE_ENV=production
ENV PORT=80
CMD ["node", "dist/main"]
```

**特点：**
- ✅ 使用 Alpine 镜像，体积小
- ✅ 分层构建，利用缓存
- ✅ 多阶段优化，减小镜像大小
- ✅ 正确设置环境变量和端口

### 根目录 Dockerfile

如果需要部署整个项目，使用根目录的 Dockerfile。

---

## ❓ 常见问题

### 问题 1：找不到 Dockerfile

**错误信息：**
```
代码仓库中没有找到Dockerfile，请补充后重试
```

**解决方案：**
1. 确认目标目录填写正确
   - 部署后端：目标目录填 `server/`
   - 部署全项目：目标目录填 `/`

2. 确认 Dockerfile 在正确的位置
   - server/Dockerfile 应该在 server 目录下
   - Dockerfile 应该在根目录

3. 重新提交代码到 GitHub

### 问题 2：构建失败

**可能原因：**
- 依赖安装失败
- 构建命令错误
- 端口配置错误

**解决方案：**
1. 查看构建日志，定位错误
2. 检查 server/package.json 中的 build 命令
3. 确认端口配置为 80

### 问题 3：服务启动失败

**可能原因：**
- 环境变量缺失
- 端口配置错误
- 启动命令错误

**解决方案：**
1. 检查所有环境变量是否已配置
2. 确认端口配置为 80
3. 查看服务启动日志

---

## 🔧 调试技巧

### 1. 本地测试 Dockerfile

在本地构建和测试 Docker 镜像：

```bash
cd server
docker build -t skin-detection-api .
docker run -p 80:80 -e COZE_API_KEY=xxx skin-detection-api
```

### 2. 查看构建日志

```bash
docker logs <container-id>
```

### 3. 进入容器调试

```bash
docker exec -it <container-id> sh
```

---

## 📚 相关文档

- [微信云托管官方文档](https://cloud.tencent.com/document/product/1243)
- [Dockerfile 最佳实践](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [NestJS 部署指南](https://docs.nestjs.com/techniques/deployment)

---

**更新时间：** 2026-03-21
**维护者：** 开发团队
**版本：** 1.0

# 微信云托管部署修复总结

## 🐛 问题描述

在微信云托管部署时遇到以下错误：
```
RUN npm ci --only=production --silent did not complete successfully: exit code: 1
ERROR: resolve : lstat server: no such file or directory
```

## 🔍 根本原因分析

1. **package-lock.json 缺失**：Dockerfile 使用 `npm ci` 命令，该命令需要 `package-lock.json` 文件
2. **包管理器不一致**：项目使用 `pnpm` 作为包管理器，没有 `package-lock.json` 文件
3. **workspace 结构**：项目是 pnpm workspace 结构，server 目录没有独立的锁文件

## ✅ 已完成的修复

### 1. 修改 Dockerfile

**修改前：**
```dockerfile
COPY package.json package-lock.json* ./
RUN npm ci --only=production --silent
```

**修改后：**
```dockerfile
COPY package.json ./
RUN npm install --production --silent
```

**关键改动：**
- ❌ 不再复制 `package-lock.json`
- ❌ 不再使用 `npm ci`（需要 lockfile）
- ✅ 改用 `npm install --production`（不需要 lockfile）
- ✅ 改为直接使用 `node dist/main` 启动，避免依赖 npm

### 2. 更新部署文档

- ✅ 更新 `CLOUD_HOSTING_QUICK_START.md`，说明 Dockerfile 改动
- ✅ 添加常见问题说明，解释 `npm ci` 失败原因

## 🚀 下一步操作

### 步骤 1：重新打包部署文件

```bash
# 在项目根目录执行
cd /workspace/projects

# 打包 server 目录（排除不必要的文件）
zip -r skin-detection-server.zip server -x "server/node_modules/*" "server/dist/*" "server/.env.local" "server/.env.*" "server/*.log" "server/.git/*" "server/.github/*" "server/.vscode/*" "server/coverage/*"

# 验证 ZIP 包内容
unzip -l skin-detection-server.zip
```

### 步骤 2：上传 ZIP 到微信云托管

1. 进入微信云托管控制台：https://console.cloud.tencent.com/tcb/service
2. 选择你的云托管环境
3. 点击「服务管理」→「新建服务」或「更新版本」
4. 选择「代码包上传」
5. 上传 `skin-detection-server.zip`

### 步骤 3：配置构建参数

**关键配置：**
- **目标目录**：`server`（ZIP 解压后的目录结构为 `server/...`）
- **镜像构建**：使用 Dockerfile 构建
- **端口映射**：容器端口 `80`

### 步骤 4：配置环境变量

从 `server/.env.local` 复制所有环境变量：

```bash
# 必需的环境变量
PORT=80
NODE_ENV=production

# Coze API 配置
COZE_API_KEY=8f38a8d0-b6d4-481c-8e15-b93bb30c7444
COZE_MODEL=doubao-1-5-vision-pro-32k-250115

# Supabase 配置
COZE_SUPABASE_URL=https://pacqfzvxkiobtxbjubil.supabase.co
COZE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhY3FmenZ4a2lvYnR4Ymp1YmlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODM1ODYsImV4cCI6MjA4ODk1OTU4Nn0.CZoSjahWflEy3vhj_Ya9ddYhie9BtmvRxhNaN8JdZs4

# 微信小程序配置
WECHAT_APPID=wx8826c7b681ec3c65
WECHAT_APP_SECRET=<你的微信小程序 AppSecret>
```

### 步骤 5：部署并等待构建

1. 点击「部署」
2. 等待 Docker 镜像构建（约 3-5 分钟）
3. 查看构建日志，确认没有错误

### 步骤 6：获取云托管服务地址

部署成功后，在控制台获取服务地址：
```
https://<服务名>-<随机ID>.tcb.qcloud.la
```

### 步骤 7：更新小程序配置

修改 `config/index.ts` 和 `.env.local`：
```typescript
// config/index.ts
defineConstants: {
  PROJECT_DOMAIN: JSON.stringify('https://<你的云托管服务地址>'),
  // ... 其他配置
}
```

```bash
# .env.local
PROJECT_DOMAIN=https://<你的云托管服务地址>
TARO_APP_WEAPP_APPID=wx8826c7b681ec3c65
```

### 步骤 8：测试验证

```bash
# 测试 API 健康检查
curl https://<你的云托管服务地址>/api/health

# 预期返回：
# {"status":"success","data":"2025-01-22T10:00:00.000Z"}

# 测试 Hello 接口
curl https://<你的云托管服务地址>/api/hello

# 预期返回：
# {"status":"success","data":"Hello, welcome to coze coding mini-program server!"}
```

## 📊 预期结果

部署成功后，你应该看到：

1. ✅ Docker 镜像构建成功
2. ✅ 服务状态为「运行中」
3. ✅ 健康检查通过
4. ✅ API 接口可以正常访问
5. ✅ 小程序可以正常调用后端接口

## 🔧 如果仍然失败

### 检查构建日志

查看云托管控制台的构建日志，重点关注：

1. **依赖安装阶段**：
   ```
   > RUN npm install --production --silent
   ```
   如果失败，检查是否有依赖下载失败

2. **构建阶段**：
   ```
   > RUN npm run build
   ```
   如果失败，检查 TypeScript 编译错误

3. **启动阶段**：
   ```
   > CMD ["node", "dist/main"]
   ```
   如果失败，检查运行时错误

### 常见问题

**Q1: npm install 失败**
- 检查网络连接
- 尝试使用国内镜像：`npm config set registry https://registry.npmmirror.com`

**Q2: 构建失败**
- 检查 package.json 中的 build 脚本
- 查看 TypeScript 编译错误

**Q3: 运行时错误**
- 检查环境变量是否完整
- 查看 dist/main.js 是否正确生成

## 📝 技术细节

### 为什么改用 npm 而不是 pnpm？

1. **简化部署**：npm 是 Node.js 自带的包管理器，不需要额外安装
2. **避免 workspace 复杂性**：pnpm workspace 需要额外的配置文件
3. **兼容性更好**：云托管环境对 npm 支持最完善
4. **稳定性更高**：npm 在容器化环境中更成熟稳定

### 为什么使用 npm install 而不是 npm ci？

- `npm ci` 需要 `package-lock.json`，项目使用 pnpm 没有此文件
- `npm install --production` 可以直接从 `package.json` 安装生产依赖
- 在云托管环境中，两者效果相同

### 为什么直接用 node 启动？

- 避免依赖 npm 的环境
- 减少一层命令调用
- 启动更快，更可靠

## 🎯 成功标志

部署成功的标志：
- ✅ 服务状态为「运行中」
- ✅ 健康检查显示「健康」
- ✅ 日志中显示 `✅ Server running on http://localhost:80`
- ✅ 调用 `/api/health` 返回 200 状态码
- ✅ 小程序可以正常登录和上传图片

---

**准备就绪，开始部署吧！** 🚀

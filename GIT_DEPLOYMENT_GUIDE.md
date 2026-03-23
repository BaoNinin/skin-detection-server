# 微信云托管 Git 仓库自动部署指南

## 🚀 推荐部署方式：Git 仓库自动部署

通过连接 Git 仓库，微信云托管可以：
- ✅ 自动拉取代码
- ✅ 自动构建镜像
- ✅ 自动部署更新
- ✅ 支持多种 Git 平台

## 📋 支持的 Git 平台

微信云托管支持以下 Git 仓库：
- **GitHub**（推荐）
- **GitLab**
- **Gitee（码云）**
- **Coding**
- **腾讯云 CODING**

## 🔧 方案一：GitHub 自动部署（推荐）

### 步骤 1：推送代码到 GitHub

```bash
# 1. 初始化 Git 仓库（如果还没有）
cd /workspace/projects
git init
git add .
git commit -m "feat: 初始化微信小程序后端项目"

# 2. 创建 GitHub 仓库
#    访问：https://github.com/new
#    创建一个新仓库，例如：skin-detection-server

# 3. 添加远程仓库
git remote add origin https://github.com/<你的用户名>/skin-detection-server.git

# 4. 推送代码
git branch -M main
git push -u origin main
```

### 步骤 2：在微信云托管连接 GitHub

1. **登录云托管控制台**
   - 访问：https://console.cloud.tencent.com/tcb/service
   - 选择你的云托管环境

2. **创建服务 → 选择代码来源**
   - 代码来源：选择「GitHub」
   - 点击「授权 GitHub」

3. **授权 GitHub**
   - 跳转到 GitHub 授权页面
   - 使用 GitHub 账号登录
   - 授权微信云托管访问你的仓库

4. **选择仓库和分支**
   - 仓库：选择 `skin-detection-server`
   - 分支：选择 `main`
   - 代码目录：输入 `server`（重要！因为后端代码在 server 子目录）

5. **配置构建参数**
   - 构建目录：`server`
   - Dockerfile 路径：`Dockerfile`（相对于 server 目录）
   - 构建类型：使用 Dockerfile

6. **配置环境变量**
   - 从 `server/.env.local` 复制所有变量
   - 见下方详细配置

7. **创建服务**
   - 点击「创建」
   - 等待自动构建和部署

### 步骤 3：配置环境变量

**必需的环境变量：**

| 变量名 | 值 | 说明 |
|-------|-----|------|
| `PORT` | `80` | 服务端口 |
| `NODE_ENV` | `production` | 运行环境 |
| `COZE_API_KEY` | `8f38a8d0-b6d4-481c-8e15-b93bb30c7444` | Coze API 密钥 |
| `COZE_MODEL` | `doubao-vision` | Coze 模型 |
| `COZE_SUPABASE_URL` | `https://pacqfzvxkiobtxbjubil.supabase.co` | Supabase URL |
| `COZE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Supabase 密钥 |
| `WECHAT_APPID` | `wx8826c7b681ec3c65` | 微信小程序 AppID |
| `WECHAT_APP_SECRET` | `<你的 AppSecret>` | 微信小程序密钥（需要自己获取） |

### 步骤 4：部署后验证

```bash
# 获取服务地址（从云托管控制台复制）
# 示例：https://skin-detection-server-xxx.tcb.qcloud.la

# 测试 API
curl https://<你的服务地址>/api/health

# 预期返回：
# {"status":"success","data":"2025-01-22T10:00:00.000Z"}
```

### 步骤 5：更新小程序配置

修改 `config/index.ts` 和 `.env.local`：
```typescript
// config/index.ts
defineConstants: {
  PROJECT_DOMAIN: JSON.stringify('https://<你的服务地址>'),
  // ... 其他配置
}
```

---

## 🔧 方案二：腾讯云 CODING 自动部署

如果已有腾讯云账号，使用 CODING 更方便。

### 步骤 1：创建 CODING 仓库

1. 访问：https://coding.net/
2. 登录并创建新项目
3. 创建仓库：`skin-detection-server`

### 步骤 2：推送代码到 CODING

```bash
cd /workspace/projects

# 添加 CODING 远程仓库
git remote add coding https://e.coding.net/<你的用户名>/skin-detection-server.git

# 推送代码
git push -u coding main
```

### 步骤 3：在微信云托管连接 CODING

1. 选择代码来源：CODING
2. 授权 CODING 账号
3. 选择仓库和分支
4. 设置代码目录为 `server`
5. 配置环境变量（同上）
6. 部署

---

## 🔄 方案三：使用 Webhook 自动部署（高级）

如果使用自己的 Git 服务器或 CI/CD 流程。

### 配置步骤

1. **配置 CI/CD 工具**（如 GitHub Actions、GitLab CI）
2. **构建 Docker 镜像**
3. **推送到腾讯云镜像仓库**
4. **触发云托管更新**

**示例 GitHub Actions 配置：**

```yaml
name: Deploy to WeChat Cloud Hosting

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Login to Tencent Cloud Registry
        run: |
          docker login ccr.ccs.tencentyun.com \
            -u ${{ secrets.TENCENT_CLOUD_USERNAME }} \
            -p ${{ secrets.TENCENT_CLOUD_PASSWORD }}

      - name: Build Docker Image
        run: |
          cd server
          docker build -t ccr.ccs.tencentyun.com/<命名空间>/skin-detection-server:latest .

      - name: Push Image
        run: |
          docker push ccr.ccs.tencentyun.com/<命名空间>/skin-detection-server:latest

      - name: Trigger Cloud Hosting Update
        run: |
          curl -X POST https://<云托管 Webhook URL> \
            -H "Content-Type: application/json" \
            -d '{"image":"ccr.ccs.tencentyun.com/<命名空间>/skin-detection-server:latest"}'
```

---

## 📝 Git 提交规范

为了保持代码整洁，建议遵循以下提交规范：

```bash
# 功能开发
git commit -m "feat: 添加用户登录功能"

# Bug 修复
git commit -m "fix: 修复图片上传接口错误"

# 文档更新
git commit -m "docs: 更新部署文档"

# 代码重构
git commit -m "refactor: 优化数据库查询逻辑"

# 性能优化
git commit -m "perf: 优化 API 响应速度"

# 样式调整
git commit -m "style: 统一代码格式"

# 测试相关
git commit -m "test: 添加单元测试"

# 构建配置
git commit -m "chore: 更新 Dockerfile"
```

---

## 🚀 自动部署流程

一旦配置完成，每次推送代码到主分支：

1. **代码推送** → `git push`
2. **自动触发** → 云托管检测到新提交
3. **自动构建** → 使用 Dockerfile 构建镜像
4. **自动部署** → 部署新版本
5. **流量切换** → 自动切换到新版本
6. **验证** → 健康检查通过

**整个过程无需人工干预！** ✨

---

## 📊 推荐方案对比

| 方案 | 优点 | 缺点 | 推荐度 |
|-----|------|------|--------|
| GitHub | 免费、稳定、社区大 | 访问速度可能较慢 | ⭐⭐⭐⭐⭐ |
| CODING | 腾讯云原生、速度快 | 需要腾讯云账号 | ⭐⭐⭐⭐ |
| Gitee | 国内访问快 | 需要实名认证 | ⭐⭐⭐ |
| GitLab | 功能强大 | 配置复杂 | ⭐⭐⭐ |
| 本地上传 | 简单直接 | 每次手动上传 | ⭐ |

**推荐使用 GitHub 或 CODING** 👍

---

## ✅ 部署检查清单

部署前请确认：

- [ ] Dockerfile 已修复（使用 npm install --production）
- [ ] 代码已推送到 Git 仓库
- [ ] 云托管环境已创建
- [ ] 服务已配置代码目录为 `server`
- [ ] 环境变量已完整配置
- [ ] WECHAT_APP_SECRET 已添加
- [ ] 部署成功，服务状态为「运行中」

---

## 🎯 开始部署吧！

1. **选择 Git 平台**（推荐 GitHub）
2. **推送代码到仓库**
3. **在云托管连接仓库**
4. **配置环境变量**
5. **等待自动部署完成**
6. **获取服务地址**
7. **更新小程序配置**

---

## 💡 常见问题

### Q1: 如何获取 WECHAT_APP_SECRET？
1. 登录微信小程序后台：https://mp.weixin.qq.com/
2. 开发 → 开发管理 → 开发设置
3. 找到 AppSecret，生成或重置

### Q2: 如何查看部署日志？
- 进入云托管控制台
- 选择服务 → 日志
- 可以查看构建日志和运行日志

### Q3: 如何回滚到旧版本？
- 进入云托管控制台
- 选择服务 → 版本管理
- 选择旧版本，点击「回滚」

### Q4: 代码更新后如何部署？
- 直接 git push 到主分支
- 云托管会自动检测并部署新版本

### Q5: 如何配置多个环境（开发/测试/生产）？
- 在云托管创建多个环境
- 每个环境连接不同的 Git 分支
- 例如：dev 分支 → 开发环境，main 分支 → 生产环境

---

**准备好开始了吗？选择一个 Git 平台开始吧！** 🚀

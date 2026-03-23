# GitHub 自动部署执行清单

## ✅ 前置检查

- [x] GitHub 仓库已创建：https://github.com/BaoNini/skin-detection-server.git
- [x] Dockerfile 已修复（使用 npm install --production）
- [x] 代码已提交到本地 Git
- [ ] 推送代码到 GitHub
- [ ] 配置微信云托管
- [ ] 设置环境变量
- [ ] 验证部署

## 🚀 执行步骤

### 步骤 1：推送代码到 GitHub

在沙箱环境中执行：
```bash
cd /workspace/projects
git remote add origin https://github.com/BaoNini/skin-detection-server.git
git branch -M main
git push -u origin main
```

### 步骤 2：在微信云托管配置 GitHub 自动部署

1. **登录云托管控制台**
   - 访问：https://console.cloud.tencent.com/tcb/service
   - 选择环境（或创建新环境）

2. **创建服务 → 选择代码来源**
   - 代码来源：GitHub
   - 点击「授权 GitHub」

3. **授权 GitHub**
   - 使用 GitHub 账号登录
   - 授权微信云托管访问仓库

4. **选择仓库和配置**
   - 仓库：`BaoNini/skin-detection-server`
   - 分支：`main`
   - **代码目录：`server`**（重要！）
   - Dockerfile 路径：`Dockerfile`（相对于 server 目录）

5. **配置基本信息**
   - 服务名称：`skin-detection-server`
   - 版本名称：`v1.0`

6. **配置环境变量**（见下方完整列表）

7. **创建并部署**

### 步骤 3：配置环境变量（完整列表）

**必需的环境变量：**

| 变量名 | 值 | 说明 |
|-------|-----|------|
| `PORT` | `80` | 服务端口 |
| `NODE_ENV` | `production` | 运行环境 |
| `COZE_API_KEY` | `8f38a8d0-b6d4-481c-8e15-b93bb30c7444` | Coze API 密钥 |
| `COZE_MODEL` | `doubao-vision` | Coze 模型名称 |
| `COZE_SUPABASE_URL` | `https://pacqfzvxkiobtxbjubil.supabase.co` | Supabase 数据库 URL |
| `COZE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhY3FmenZ4a2lvYnR4Ymp1YmlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODM1ODYsImV4cCI6MjA4ODk1OTU4Nn0.CZoSjahWflEy3vhj_Ya9ddYhie9BtmvRxhNaN8JdZs4` | Supabase 匿名密钥 |
| `WECHAT_APPID` | `wx8826c7b681ec3c65` | 微信小程序 AppID |
| `WECHAT_APP_SECRET` | `<需要你从微信后台获取>` | 微信小程序密钥 |

**获取 WECHAT_APP_SECRET：**
1. 访问：https://mp.weixin.qq.com/
2. 登录你的小程序后台
3. 开发 → 开发管理 → 开发设置
4. 找到 AppSecret，点击生成或重置
5. 复制并添加到环境变量中

### 步骤 4：等待部署完成

- Docker 镜像构建：约 3-5 分钟
- 服务启动：约 1-2 分钟
- 健康检查：自动验证服务可用性

### 步骤 5：获取服务地址

部署成功后，在云托管控制台获取服务地址，格式类似：
```
https://skin-detection-server-xxxxx.tcb.qcloud.la
```

### 步骤 6：测试 API

```bash
# 测试健康检查接口
curl https://<你的服务地址>/api/health

# 预期返回：
# {"status":"success","data":"2025-01-22T10:00:00.000Z"}

# 测试 Hello 接口
curl https://<你的服务地址>/api/hello

# 预期返回：
# {"status":"success","data":"Hello, welcome to coze coding mini-program server!"}
```

### 步骤 7：更新小程序配置

修改 `config/index.ts`：
```typescript
defineConstants: {
  PROJECT_DOMAIN: JSON.stringify('https://<你的服务地址>'),
  TARO_ENV: JSON.stringify(process.env.TARO_ENV),
  TARO_APP_WEAPP_APPID: JSON.stringify('wx8826c7b681ec3c65'),
}
```

修改 `.env.local`：
```bash
PROJECT_DOMAIN=https://<你的服务地址>
TARO_APP_WEAPP_APPID=wx8826c7b681ec3c65
TARO_ENV=weapp
```

重新编译：
```bash
pnpm build:weapp
```

## 🔄 后续自动部署

配置完成后，每次推送代码到 GitHub 的 main 分支：
1. `git push` 触发自动部署
2. 云托管自动拉取最新代码
3. 自动构建 Docker 镜像
4. 自动部署新版本
5. 自动切换流量到新版本

**全程无需人工干预！**

## 📊 监控和日志

### 查看部署日志
1. 进入云托管控制台
2. 选择服务 → 版本管理
3. 点击版本查看构建日志

### 查看运行日志
1. 选择服务 → 日志
2. 实时查看应用日志
3. 可以按关键字过滤（如 ERROR、WARN）

### 查看监控指标
1. 选择服务 → 监控
2. 查看 CPU、内存、请求量等
3. 设置告警规则（可选）

## ⚠️ 重要提示

1. **代码目录必须设置为 `server`**
   - 因为后端代码在 server 子目录
   - Dockerfile 在 server 目录下

2. **WECHAT_APP_SECRET 必须手动添加**
   - 无法通过公开渠道获取
   - 必须从微信小程序后台获取

3. **环境变量名称必须完全匹配**
   - 包括大小写
   - 不能有额外空格

4. **首次部署可能较慢**
   - 需要下载 npm 依赖
   - 需要 TypeScript 编译
   - 预计 5-10 分钟

## ✅ 部署成功标志

- [ ] 服务状态为「运行中」
- [ ] 健康检查显示「健康」
- [ ] `/api/health` 返回 200
- [ ] 日志中显示 `✅ Server running on http://localhost:80`
- [ ] 小程序可以正常调用 API

---

**准备就绪！开始部署吧！** 🚀

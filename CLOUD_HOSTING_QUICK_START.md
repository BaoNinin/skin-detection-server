# 微信云托管快速部署指南

## 📦 准备工作

**已完成的配置文件：**
- ✅ `server/Dockerfile` - Docker 配置（使用 npm 安装依赖）
- ✅ `server/.dockerignore` - 构建忽略文件
- ✅ `server/package.json` - 包含启动脚本
- ✅ `DEPLOYMENT_GUIDE.md` - 完整部署文档

---

## 🚀 步骤 1：准备腾讯云账号

### 1.1 登录微信云开发控制台
访问：https://console.cloud.tencent.com/tcb/env

### 1.2 准备腾讯云容器镜像仓库
- 命名空间（Namespace）：创建或使用已有命名空间
- 用户名和密码：用于登录 Docker

---

## 🔧 步骤 2：登录腾讯云容器镜像服务

**在本地电脑执行：**

```bash
# 登录腾讯云镜像仓库
docker login ccr.ccs.tencentyun.com \
  --username=<你的腾讯云账号> \
  --password=<你的腾讯云密码>

# 或者使用腾讯云 API 密钥
docker login ccr.ccs.tencentyun.com \
  --username=<你的云账号ID> \
  --password=<你的云API密钥>
```

**如何获取腾讯云 API 密钥：**
1. 访问：https://console.cloud.tencent.com/cam/capi
2. 点击「新建密钥」
3. 记录 SecretId 和 SecretKey

---

## 🐳 步骤 3：构建 Docker 镜像

**在项目根目录执行：**

```bash
cd server

# 构建镜像（替换 <你的命名空间> 为实际的命名空间）
docker build -t ccr.ccs.tencentyun.com/<你的命名空间>/skin-detection-server:latest .
```

**构建时间：约 2-5 分钟**

---

## 📤 步骤 4：推送镜像

```bash
# 推送镜像到腾讯云仓库
docker push ccr.ccs.tencentyun.com/<你的命名空间>/skin-detection-server:latest

# 推送时间：约 1-3 分钟（取决于网络）
```

---

## ☁️ 步骤 5：创建云托管服务

### 5.1 创建环境
1. 访问：https://console.cloud.tencent.com/tcb/env
2. 点击「新建环境」
3. 选择「云托管」
4. 环境名称：`skin-detection-prod`
5. 点击「立即创建」

### 5.2 创建服务
1. 进入云托管环境
2. 点击「服务」→「新建服务」
3. 配置服务：

**基本信息：**
- 服务名称：`skin-detection-server`
- 版本名称：`v1.0`

**镜像配置：**
- 镜像来源：镜像仓库
- 镜像地址：`ccr.ccs.tencentyun.com/<你的命名空间>/skin-detection-server:latest`

---

## 🔐 步骤 6：配置环境变量

**从 `server/.env.local` 复制配置：**

```bash
# 获取环境变量
cat server/.env.local
```

**在云托管控制台添加环境变量：**

| 变量名 | 值 |
|-------|-----|
| `PORT` | `80` |
| `NODE_ENV` | `production` |
| `COZE_API_KEY` | `ea77474e-46bb-4f4e-a42f-99dedce29678` |
| `COZE_MODEL` | `doubao-seed-1-6-vision-250815` |
| `COZE_SUPABASE_URL` | `https://pacqfzvxkiobtxbjubil.supabase.co` |
| `COZE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhY3FmenZ4a2lvYnR4Ymp1YmlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODM1ODYsImV4cCI6MjA4ODk1OTU4Nn0.CZoSjahWflEy3vhj_Ya9ddYhie9BtmvRxhNaN8JdZs4` |
| `WECHAT_APPID` | `wx8826c7b681ec3c65` |
| `WECHAT_APP_SECRET` | `<你的微信小程序 AppSecret>` |

---

## 🚀 步骤 7：部署服务

1. 点击「部署」
2. 等待部署完成（约 2-3 分钟）
3. 部署成功后，记录服务地址

**服务地址示例：**
```
https://skin-detection-server-xxx.tcb.qcloud.la
```

---

## 📱 步骤 8：更新小程序配置

### 8.1 修改 `config/index.ts`

```typescript
defineConstants: {
  PROJECT_DOMAIN: JSON.stringify('https://skin-detection-server-xxx.tcb.qcloud.la'), // 替换为实际的服务地址
  TARO_ENV: JSON.stringify(process.env.TARO_ENV),
  TARO_APP_WEAPP_APPID: JSON.stringify('wx8826c7b681ec3c65'),
},
```

### 8.2 修改 `.env.local`

```bash
PROJECT_DOMAIN=https://skin-detection-server-xxx.tcb.qcloud.la
TARO_APP_WEAPP_APPID=wx8826c7b681ec3c65
TARO_ENV=weapp
```

### 8.3 重新编译

```bash
pnpm build:weapp
```

---

## ✅ 步骤 9：测试验证

### 9.1 测试云托管服务

```bash
# 测试 API
curl https://skin-detection-server-xxx.tcb.qcloud.la/api/hello

# 预期返回：
# {"status":"success","data":"Hello, welcome to coze coding mini-program server!"}
```

### 9.2 测试登录接口

```bash
# 测试登录（使用有效的微信登录 code）
curl -X POST https://skin-detection-server-xxx.tcb.qcloud.la/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"code":"test-code","userInfo":null}'
```

### 9.3 测试小程序

1. 在开发者工具中清除缓存
2. 重新编译
3. 点击「预览」
4. 真机测试

---

## 📊 步骤 10：监控和日志

### 查看服务日志
1. 进入云托管控制台
2. 选择服务 `skin-detection-server`
3. 点击「日志」查看实时日志

### 查看监控数据
1. 进入「监控」标签
2. 查看 CPU、内存、请求量等指标

---

## 💡 常见问题

### Q1: 如何获取微信小程序 AppSecret？
1. 登录微信小程序后台：https://mp.weixin.qq.com/
2. 进入「开发」→「开发管理」→「开发设置」
3. 找到「开发者ID」→「AppSecret」
4. 点击「生成」或「重置」
5. 复制 AppSecret

### Q2: 构建失败怎么办？
- 检查 Dockerfile 是否正确
- 检查 package.json 是否有启动脚本
- 查看 Docker 构建日志

**如果遇到 `npm ci` 失败的错误：**
```
RUN npm ci --only=production --silent did not complete successfully: exit code: 1
```
这是因为项目使用 pnpm 作为包管理器，没有 `package-lock.json` 文件。

**解决方案：**
Dockerfile 已更新为使用 `npm install --production`，不再需要 `package-lock.json`。如果仍然失败，请检查：
1. package.json 中 dependencies 是否完整
2. 所有依赖都能正常从 npm registry 下载
3. 构建日志中是否有具体的错误信息

### Q3: 部署失败怎么办？
- 检查镜像地址是否正确
- 检查环境变量是否完整
- 查看云托管部署日志

### Q4: 如何更新服务？
1. 重新构建镜像：`docker build -t ...`
2. 重新推送镜像：`docker push ...`
3. 在云托管控制台创建新版本
4. 选择新镜像部署

---

## 📞 需要帮助？

遇到问题可以：
1. 查看完整部署指南：`DEPLOYMENT_GUIDE.md`
2. 查看云托管文档：https://cloud.tencent.com/document/product/1243/45604
3. 联系微信云托管技术支持

---

## 🎉 完成！

部署完成后，你的小程序将：
- ✅ 使用云托管服务，稳定性高
- ✅ 自动 HTTPS，无需配置
- ✅ 自动扩缩容，按需付费
- ✅ 完美解决真机调试网络问题

**开始部署吧！** 🚀

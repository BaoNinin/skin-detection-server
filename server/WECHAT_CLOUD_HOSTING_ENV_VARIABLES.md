# 微信云托管环境变量配置指南

## 完整环境变量列表

### 豆包端点模型配置

| 环境变量 | 值 | 说明 | 是否必填 |
|---------|-----|------|----------|
| `COZE_API_KEY` | `8f60880a-1ac3-40a7-bd60-1b68dbc549e6` | 豆包端点模型 API Key | ✅ 必填 |
| `COZE_MODEL` | `ep-20260324135258-7shrd` | 豆包端点模型名称 | ✅ 必填 |
| `COZE_API_BASE` | `https://ark.cn-beijing.volces.com/api/v3/chat/completions` | API 端点地址 | ✅ 必填 |
| `COZE_USE_MOCK` | `false` | 是否使用模拟数据（生产环境必须为 false） | ✅ 必填 |

### 微信云托管配置

| 环境变量 | 值 | 说明 | 是否必填 |
|---------|-----|------|----------|
| `CLOUDBASE_ENV_ID` | `cloud1-9gz0vft7d1ddce7f` | 微信云开发环境 ID | ✅ 必填 |
| `PORT` | `80` | 容器端口（云托管健康检查端口） | ✅ 必填 |
| `NODE_ENV` | `production` | 运行环境 | ✅ 必填 |

### 微信小程序配置

| 环境变量 | 值 | 说明 | 是否必填 |
|---------|-----|------|----------|
| `WECHAT_APPID` | `wx8826c7b681ec3c65` | 微信小程序 AppID | ✅ 必填 |
| `WECHAT_APP_SECRET` | `b5660a490882bbc56b8fcc69d2cb8cd4` | 微信小程序 AppSecret | ✅ 必填 |

### Supabase 数据库配置

| 环境变量 | 值 | 说明 | 是否必填 |
|---------|-----|------|----------|
| `COZE_SUPABASE_URL` | `https://pacqfzvxkiobtxbjubil.supabase.co` | Supabase 项目 URL | ✅ 必填 |
| `COZE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Supabase 匿名访问密钥 | ✅ 必填 |

---

## 方法一：微信云托管控制台配置

### 步骤 1：登录微信云开发控制台

1. 访问：https://console.cloud.tencent.com/tcb
2. 选择环境：`cloud1-9gz0vft7d1ddce7f`
3. 进入「云托管」服务页面

### 步骤 2：创建或更新服务

1. 点击「新建服务」或选择现有服务
2. 服务名称：`skin-detection-server`
3. 选择「从代码仓库导入」或「从本地上传」

### 步骤 3：配置环境变量

在服务配置页面，添加以下环境变量：

```json
{
  "COZE_API_KEY": "8f60880a-1ac3-40a7-bd60-1b68dbc549e6",
  "COZE_MODEL": "ep-20260324135258-7shrd",
  "COZE_API_BASE": "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
  "COZE_USE_MOCK": "false",
  "CLOUDBASE_ENV_ID": "cloud1-9gz0vft7d1ddce7f",
  "PORT": "80",
  "NODE_ENV": "production",
  "WECHAT_APPID": "wx8826c7b681ec3c65",
  "WECHAT_APP_SECRET": "b5660a490882bbc56b8fcc69d2cb8cd4",
  "COZE_SUPABASE_URL": "https://pacqfzvxkiobtxbjubil.supabase.co",
  "COZE_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhY3FmenZ4a2lvYnR4Ymp1YmlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODM1ODYsImV4cCI6MjA4ODk1OTU4Nn0.CZoSjahWflEy3vhj_Ya9ddYhie9BtmvRxhNaN8JdZs4"
}
```

### 步骤 4：配置容器规格

```yaml
CPU: 0.5 核
内存: 1 GB
最小实例数: 1
最大实例数: 1
容器端口: 80
```

### 步骤 5：部署

点击「部署」按钮，等待部署完成（约 2-5 分钟）

---

## 方法二：使用 CLI 部署

### 前置条件

```bash
# 安装 CloudBase CLI
npm install -g @cloudbase/cli

# 登录微信云开发
tcb login
```

### 方式 1：使用部署脚本（推荐）

```bash
cd /workspace/projects/server
bash deploy-cloud-hosting.sh
```

### 方式 2：手动执行命令

```bash
cd /workspace/projects/server

# 构建 Docker 镜像
tcb run build

# 部署到云托管
tcb run service:deploy \
  --env-id cloud1-9gz0vft7d1ddce7f \
  --service-name skin-detection-server \
  --version-name latest \
  --cpu 0.5 \
  --memory 1 \
  --min-num 1 \
  --max-num 1 \
  --container-port 80 \
  --env COZE_API_KEY=8f60880a-1ac3-40a7-bd60-1b68dbc549e6 \
  --env COZE_MODEL=ep-20260324135258-7shrd \
  --env COZE_API_BASE=https://ark.cn-beijing.volces.com/api/v3/chat/completions \
  --env COZE_USE_MOCK=false \
  --env CLOUDBASE_ENV_ID=cloud1-9gz0vft7d1ddce7f \
  --env PORT=80 \
  --env NODE_ENV=production \
  --env WECHAT_APPID=wx8826c7b681ec3c65 \
  --env WECHAT_APP_SECRET=b5660a490882bbc56b8fcc69d2cb8cd4 \
  --env COZE_SUPABASE_URL=https://pacqfzvxkiobtxbjubil.supabase.co \
  --env COZE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhY3FmenZ4a2lvYnR4Ymp1YmlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODM1ODYsImV4cCI6MjA4ODk1OTU4Nn0.CZoSjahWflEy3vhj_Ya9ddYhie9BtmvRxhNaN8JdZs4
```

---

## 配置验证

### 部署后验证环境变量

#### 1. 在控制台查看

1. 进入微信云开发控制台
2. 云托管 → 服务管理 → 选择服务
3. 点击「版本管理」→ 选择最新版本
4. 查看「环境变量」配置

#### 2. 使用 CLI 查看

```bash
# 查看服务信息
tcb services list --env-id cloud1-9gz0vft7d1ddce7f

# 查看服务详情
tcb services get skin-detection-server --env-id cloud1-9gz0vft7d1ddce7f
```

#### 3. 查看日志验证

```bash
# 查看实时日志
tcb logs --env-id cloud1-9gz0vft7d1ddce7f --service-name skin-detection-server --latest
```

期望看到的日志：
```
SkinService 初始化完成，使用模型: ep-20260324135258-7shrd
使用豆包端点模型进行皮肤分析
使用云存储保存图片
✅ Server running on http://localhost:80
```

---

## 常见问题

### 1. 环境变量未生效

**症状**：日志显示使用默认值或模拟数据

**解决方案**：
1. 检查环境变量名称是否正确（区分大小写）
2. 确认服务已重新部署（环境变量修改后必须重新部署）
3. 查看日志确认环境变量加载情况

### 2. API 调用失败

**症状**：皮肤分析返回错误

**解决方案**：
1. 确认 `COZE_API_KEY` 正确
2. 确认 `COZE_MODEL` 名称正确
3. 确认 `COZE_API_BASE` 地址正确
4. 检查网络连接是否正常

### 3. 端口访问失败

**症状**：健康检查失败或无法访问服务

**解决方案**：
1. 确认 `PORT` 环境变量设置为 `80`
2. 确认容器端口配置为 `80`
3. 检查安全组配置

### 4. Supabase 连接失败

**症状**：数据保存或查询失败

**解决方案**：
1. 确认 `COZE_SUPABASE_URL` 正确
2. 确认 `COZE_SUPABASE_ANON_KEY` 正确
3. 检查 Supabase 项目是否启用

---

## 环境变量变更历史

### 2025-03-24：切换到豆包端点模型

| 环境变量 | 旧值 | 新值 |
|---------|------|------|
| `COZE_API_KEY` | `ea77474e-46bb-4f4e-a42f-99dedce29678` | `8f60880a-1ac3-40a7-bd60-1b68dbc549e6` |
| `COZE_MODEL` | `doubao-seed-1-6-vision-250815` | `ep-20260324135258-7shrd` |
| `COZE_API_BASE` | `https://ark.cn-beijing.volces.com/api/v3/responses` | `https://ark.cn-beijing.volces.com/api/v3/chat/completions` |

---

## 文件位置

- **JSON 格式配置**: `server/.env.wechat-cloud.json`
- **文本格式配置**: `server/.env.wechat-cloud.txt`
- **部署脚本**: `server/deploy-cloud-hosting.sh`
- **更新说明**: `server/ENDPOINT_MODEL_CONFIG_UPDATE.md`

---

## 联系支持

如有问题，请查看：
1. 微信云开发文档：https://cloud.tencent.com/document/product/876
2. 豆包端点模型文档：https://www.volcengine.com/docs/82379
3. 项目日志：微信云托管控制台 → 日志管理

---

**最后更新**: 2025-03-24
**版本**: 1.0.0
**状态**: ✅ 已验证

# 微信云托管环境变量 - 最新配置

## 📋 快速复制配置

### JSON 格式（控制台配置）

```json
{
  "COZE_API_KEY": "654a810c-bc85-44b1-8d21-ab53cbdf5d26",
  "COZE_MODEL": "doubao-1-5-vision-pro-32k-250115",
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

### 环境变量格式（.env 文件）

```bash
# 豆包视觉模型配置
COZE_API_KEY=654a810c-bc85-44b1-8d21-ab53cbdf5d26
COZE_MODEL=doubao-1-5-vision-pro-32k-250115
COZE_API_BASE=https://ark.cn-beijing.volces.com/api/v3/chat/completions
COZE_USE_MOCK=false

# 微信云托管配置
CLOUDBASE_ENV_ID=cloud1-9gz0vft7d1ddce7f
PORT=80
NODE_ENV=production

# 微信小程序配置
WECHAT_APPID=wx8826c7b681ec3c65
WECHAT_APP_SECRET=b5660a490882bbc56b8fcc69d2cb8cd4

# Supabase 配置
COZE_SUPABASE_URL=https://pacqfzvxkiobtxbjubil.supabase.co
COZE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhY3FmenZ4a2lvYnR4Ymp1YmlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODM1ODYsImV4cCI6MjA4ODk1OTU4Nn0.CZoSjahWflEy3vhj_Ya9ddYhie9BtmvRxhNaN8JdZs4
```

---

## 🚀 一键部署命令

### 使用部署脚本

```bash
cd /workspace/projects/server
bash deploy-wechat-cloud.sh
```

### 手动 CLI 命令

```bash
cd /workspace/projects/server

tcb run service:deploy \
  --env-id cloud1-9gz0vft7d1ddce7f \
  --service-name skin-detection-server \
  --version-name latest \
  --cpu 0.5 \
  --memory 1 \
  --min-num 1 \
  --max-num 1 \
  --container-port 80 \
  --env COZE_API_KEY=654a810c-bc85-44b1-8d21-ab53cbdf5d26 \
  --env COZE_MODEL=doubao-1-5-vision-pro-32k-250115 \
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

## 📊 关键配置信息

| 配置项 | 值 |
|--------|-----|
| 环境ID | `cloud1-9gz0vft7d1ddce7f` |
| 服务名称 | `skin-detection-server` |
| 容器端口 | `80` |
| CPU | `0.5 核` |
| 内存 | `1 GB` |
| 最小实例数 | `1` |
| 最大实例数 | `1` |

---

## 🆕 最新模型配置（2025-03-24 更新）

| 环境变量 | 值 |
|---------|-----|
| `COZE_API_KEY` | `654a810c-bc85-44b1-8d21-ab53cbdf5d26` |
| `COZE_MODEL` | `doubao-1-5-vision-pro-32k-250115` ⭐ |
| `COZE_API_BASE` | `https://ark.cn-beijing.volces.com/api/v3/chat/completions` |

**模型说明**：
- ✅ 豆包官方视觉模型
- ✅ 支持 32K 上下文
- ✅ 高级图像理解能力
- ✅ 已测试可用

---

## 🔍 验证配置

### 查看实时日志

```bash
tcb logs --service-name skin-detection-server --latest
```

### 期望看到的日志

```
SkinService 初始化完成，使用模型: doubao-1-5-vision-pro-32k-250115
使用豆包视觉模型进行皮肤分析
使用云存储保存图片
✅ Server running on http://localhost:80
```

---

## 📝 相关文档

- **配置文件**: `server/.env.wechat-cloud.json`, `server/.env.wechat-cloud.txt`
- **部署脚本**: `server/deploy-wechat-cloud.sh`
- **模型切换文档**: `server/MODEL_SWITCH_DOUBAO_VISION.md`
- **Docker 修复文档**: `server/DOCKER_FIX.md`

---

## 🔗 快速链接

- 微信云开发控制台: https://console.cloud.tencent.com/tcb/env
- GitHub 仓库: https://github.com/BaoNinin/skin-detection-server

---

**更新时间**: 2025-03-24
**版本**: 2.0.0
**状态**: ✅ 已更新为 doubao-1-5-vision-pro-32k-250115

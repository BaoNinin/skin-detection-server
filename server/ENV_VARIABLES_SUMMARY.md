# 微信云托管环境变量配置文件总结

## 📁 配置文件列表

以下是所有可用的微信云托管环境变量配置文件：

### 1. JSON 格式（控制台配置）

**文件路径**: `server/.env.wechat-cloud.json`

```json
{
  "COZE_API_KEY": "654a810c-bc85-44b1-8d21-ab53cbdf5d26",
  "COZE_MODEL": "ep-20260324135258-7shrd",
  "COZE_API_BASE": "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
  "COZE_USE_MOCK": "false",
  "CLOUDBASE_ENV_ID": "cloud1-9gz0vft7d1ddce7f",
  "PORT": "80",
  "NODE_ENV": "production",
  "WECHAT_APPID": "wx8826c7b681ec3c65",
  "WECHAT_APP_SECRET": "b5660a490882bbc56b8fcc69d2cb8cd4",
  "COZE_SUPABASE_URL": "https://pacqfzvxkiobtxbjubil.supabase.co",
  "COZE_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**用途**: 在微信云托管控制台添加环境变量时使用

---

### 2. 环境变量格式（.env 文件）

**文件路径**: `server/.env.wechat-cloud.txt`

```bash
# 豆包端点模型配置
COZE_API_KEY=654a810c-bc85-44b1-8d21-ab53cbdf5d26
COZE_MODEL=ep-20260324135258-7shrd
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
COZE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**用途**: 作为参考或导入到其他系统使用

---

### 3. Shell 变量格式（脚本使用）

**文件路径**: `server/.env.wechat-cloud`

```bash
COZE_API_KEY=654a810c-bc85-44b1-8d21-ab53cbdf5d26
COZE_MODEL=ep-20260324135258-7shrd
COZE_API_BASE=https://ark.cn-beijing.volces.com/api/v3/chat/completions
COZE_USE_MOCK=false
CLOUDBASE_ENV_ID=cloud1-9gz0vft7d1ddce7f
PORT=80
NODE_ENV=production
WECHAT_APPID=wx8826c7b681ec3c65
WECHAT_APP_SECRET=b5660a490882bbc56b8fcc69d2cb8cd4
COZE_SUPABASE_URL=https://pacqfzvxkiobtxbjubil.supabase.co
COZE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**用途**: Shell 脚本 `source` 命令使用

---

## 🚀 部署脚本

### 一键部署脚本

**文件路径**: `server/deploy-wechat-cloud.sh`

```bash
cd /workspace/projects/server
bash deploy-wechat-cloud.sh
```

**功能**:
- 自动配置所有环境变量
- 部署到微信云托管
- 显示部署进度和日志查看命令

---

## 📖 文档文件

### 1. 完整配置指南

**文件路径**: `server/WECHAT_CLOUD_HOSTING_ENV_VARIABLES.md`

**内容**:
- 详细的环境变量说明
- 微信云托管控制台配置步骤
- CLI 部署命令
- 配置验证方法
- 常见问题解答

### 2. 快速参考

**文件路径**: `server/QUICK_ENV_VARIABLES.md`

**内容**:
- 快速复制配置
- 一键部署命令
- 验证配置方法
- 关键配置信息

### 3. 更新说明

**文件路径**: `server/ENDPOINT_MODEL_CONFIG_UPDATE.md`

**内容**:
- 模型切换的详细变更说明
- API 格式对比
- 部署步骤
- 测试建议

---

## 🎯 使用场景

### 场景 1：在微信云托管控制台配置

1. 打开 `server/.env.wechat-cloud.json`
2. 复制 JSON 内容
3. 在控制台粘贴到环境变量配置区域

### 场景 2：使用 CLI 部署

1. 运行 `bash server/deploy-wechat-cloud.sh`
2. 或参考 `server/QUICK_ENV_VARIABLES.md` 中的命令
3. 所有环境变量已内置

### 场景 3：自定义部署

1. 从 `server/.env.wechat-cloud.txt` 复制需要的变量
2. 根据实际情况修改
3. 使用自己的部署脚本

---

## 📊 环境变量对比

### 本次更新（2025-03-24）

| 配置项 | 旧值 | 新值 |
|--------|------|------|
| API Key | `ea77474e-46bb-4f4e-a42f-99dedce29678` | `654a810c-bc85-44b1-8d21-ab53cbdf5d26` |
| 模型名称 | `doubao-seed-1-6-vision-250815` | `ep-20260324135258-7shrd` |
| API 端点 | `/api/v3/responses` | `/api/v3/chat/completions` |

---

## 🔍 文件清单

| 文件名 | 格式 | 用途 |
|--------|------|------|
| `.env.wechat-cloud.json` | JSON | 控制台配置 |
| `.env.wechat-cloud.txt` | 环境变量 | 参考或导入 |
| `.env.wechat-cloud` | 环境变量 | Shell 脚本使用 |
| `deploy-wechat-cloud.sh` | Shell | 一键部署脚本 |
| `WECHAT_CLOUD_HOSTING_ENV_VARIABLES.md` | Markdown | 完整配置指南 |
| `QUICK_ENV_VARIABLES.md` | Markdown | 快速参考 |
| `ENDPOINT_MODEL_CONFIG_UPDATE.md` | Markdown | 更新说明 |

---

## ✅ 配置检查清单

部署前请确认：

- [ ] API Key: `654a810c-bc85-44b1-8d21-ab53cbdf5d26`
- [ ] 模型名称: `ep-20260324135258-7shrd`
- [ ] API 端点: `https://ark.cn-beijing.volces.com/api/v3/chat/completions`
- [ ] 环境ID: `cloud1-9gz0vft7d1ddce7f`
- [ ] 端口: `80`
- [ ] NODE_ENV: `production`
- [ ] 微信 AppID: `wx8826c7b681ec3c65`
- [ ] Supabase URL 和 Key 正确

---

## 📞 快速开始

### 最快部署方式

```bash
# 1. 进入项目目录
cd /workspace/projects/server

# 2. 运行一键部署脚本
bash deploy-wechat-cloud.sh

# 3. 等待部署完成（2-5 分钟）

# 4. 查看日志验证
tcb logs --env-id cloud1-9gz0vft7d1ddce7f --service-name skin-detection-server --latest
```

---

**更新时间**: 2025-03-24
**版本**: 1.0.0
**状态**: ✅ 已准备就绪

# 微信云托管环境变量配置

## JSON 格式配置

将以下 JSON 复制到微信云托管控制台的「环境变量」配置中：

```json
{
  "COZE_API_KEY": "ea77474e-46bb-4f4e-a42f-99dedce29678",
  "COZE_MODEL": "ep-20260324135258-7shrd",
  "COZE_API_BASE": "https://ark.cn-beijing.volces.com/api/v3/responses",
  "COZE_USE_MOCK": "false",
  "CLOUDBASE_ENV_ID": "cloud1-6gzezzskad9fed0b",
  "WECHAT_APPID": "wxa1c57025b508e913",
  "WECHAT_APPSECRET": "056dc956b934bf58fc659c4b08bfa16e",
  "COZE_SUPABASE_URL": "https://pacqfzvxkiobtxbjubil.supabase.co",
  "COZE_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhY3FmenZ4a2lvYnR4Ymp1YmlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODM1ODYsImV4cCI6MjA4ODk1OTU4Nn0.CZoSjahWflEy3vhj_Ya9ddYhie9BtmvRxhNaN8JdZs4",
  "NODE_ENV": "production",
  "PORT": "3000"
}
```

⚠️ **重要提示**：微信云托管的环境变量配置应该是直接的键值对对象，**不要**使用 `{"envVariables": {...}}` 这种嵌套格式！

## 单行配置格式（适合命令行部署）

```bash
COZE_API_KEY=ea77474e-46bb-4f4e-a42f-99dedce29678
COZE_MODEL=ep-20260324135258-7shrd
COZE_API_BASE=https://ark.cn-beijing.volces.com/api/v3/responses
COZE_USE_MOCK=false
CLOUDBASE_ENV_ID=cloud1-6gzezzskad9fed0b
WECHAT_APPID=wxa1c57025b508e913
WECHAT_APPSECRET=056dc956b934bf58fc659c4b08bfa16e
COZE_SUPABASE_URL=https://pacqfzvxkiobtxbjubil.supabase.co
COZE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhY3FmenZ4a2lvYnR4Ymp1YmlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODM1ODYsImV4cCI6MjA4ODk1OTU4Nn0.CZoSjahWflEy3vhj_Ya9ddYhie9BtmvRxhNaN8JdZs4
NODE_ENV=production
PORT=3000
```

## CLI 命令部署格式

```bash
wxcloud services:deploy \
  --service skin-detection-serve \
  --env-vars 'COZE_API_KEY=ea77474e-46bb-4f4e-a42f-99dedce29678' \
  --env-vars 'COZE_MODEL=ep-20260324135258-7shrd' \
  --env-vars 'COZE_API_BASE=https://ark.cn-beijing.volces.com/api/v3/responses' \
  --env-vars 'COZE_USE_MOCK=false' \
  --env-vars 'CLOUDBASE_ENV_ID=cloud1-6gzezzskad9fed0b' \
  --env-vars 'WECHAT_APPID=wxa1c57025b508e913' \
  --env-vars 'WECHAT_APPSECRET=056dc956b934bf58fc659c4b08bfa16e' \
  --env-vars 'COZE_SUPABASE_URL=https://pacqfzvxkiobtxbjubil.supabase.co' \
  --env-vars 'COZE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhY3FmenZ4a2lvYnR4Ymp1YmlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODM1ODYsImV4cCI6MjA4ODk1OTU4Nn0.CZoSjahWflEy3vhj_Ya9ddYhie9BtmvRxhNaN8JdZs4' \
  --env-vars 'NODE_ENV=production' \
  --env-vars 'PORT=3000'
```

## 环境变量说明

### 豆包视觉模型配置（已更新 ✨）
| 变量名 | 值 | 说明 |
|--------|-----|------|
| `COZE_API_KEY` | `ea77474e-46bb-4f4e-a42f-99dedce29678` | 豆包视觉模型 API Key |
| `COZE_MODEL` | `ep-20260324135258-7shrd` | 模型名称（新版本） |
| `COZE_API_BASE` | `https://ark.cn-beijing.volces.com/api/v3/responses` | API 地址（新端点） |
| `COZE_USE_MOCK` | `false` | 是否使用模拟数据（生产环境应为 false） |

### 微信小程序配置
| 变量名 | 值 | 说明 |
|--------|-----|------|
| `WECHAT_APPID` | `wxa1c57025b508e913` | 微信小程序 AppID |
| `WECHAT_APPSECRET` | `056dc956b934bf58fc659c4b08bfa16e` | 微信小程序 AppSecret |

### 云开发配置
| 变量名 | 值 | 说明 |
|--------|-----|------|
| `CLOUDBASE_ENV_ID` | `cloud1-6gzezzskad9fed0b` | 云开发环境 ID |

### Supabase 配置
| 变量名 | 值 | 说明 |
|--------|-----|------|
| `COZE_SUPABASE_URL` | `https://pacqfzvxkiobtxbjubil.supabase.co` | Supabase 数据库 URL |
| `COZE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Supabase 匿名访问密钥 |

### 其他配置
| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NODE_ENV` | `production` | 运行环境（生产环境） |
| `PORT` | `3000` | 服务端口 |

## 配置步骤

### 方法 1：通过微信云托管控制台配置

1. 登录 [微信云托管控制台](https://console.cloud.tencent.com/tcb)
2. 进入你的服务
3. 点击「环境变量」或「配置管理」
4. 选择「JSON 配置」
5. 粘贴上面的 JSON 配置
6. 保存并重启服务

### 方法 2：通过 CLI 命令部署

1. 安装微信云托管 CLI：
```bash
npm install -g @cloudbase/cli
```

2. 登录：
```bash
cloudbase login
```

3. 部署：
```bash
wxcloud services:deploy \
  --service skin-detection-serve \
  --env-vars 'COZE_API_KEY=ea77474e-46bb-4f4e-a42f-99dedce29678' \
  --env-vars 'COZE_MODEL=ep-20260324135258-7shrd' \
  --env-vars 'COZE_API_BASE=https://ark.cn-beijing.volces.com/api/v3/responses' \
  --env-vars 'COZE_USE_MOCK=false' \
  --env-vars 'CLOUDBASE_ENV_ID=cloud1-6gzezzskad9fed0b' \
  --env-vars 'WECHAT_APPID=wxa1c57025b508e913' \
  --env-vars 'WECHAT_APPSECRET=056dc956b934bf58fc659c4b08bfa16e' \
  --env-vars 'COZE_SUPABASE_URL=https://pacqfzvxkiobtxbjubil.supabase.co' \
  --env-vars 'COZE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhY3FmenZ4a2lvYnR4Ymp1YmlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODM1ODYsImV4cCI6MjA4ODk1OTU4Nn0.CZoSjahWflEy3vhj_Ya9ddYhie9BtmvRxhNaN8JdZs4' \
  --env-vars 'NODE_ENV=production' \
  --env-vars 'PORT=3000'
```

### 方法 3：通过 Docker 容器配置

如果使用 Docker，可以在 `Dockerfile` 或 `docker-compose.yml` 中配置：

```yaml
version: '3.8'
services:
  skin-detection-serve:
    environment:
      - COZE_API_KEY=ea77474e-46bb-4f4e-a42f-99dedce29678
      - COZE_MODEL=ep-20260324135258-7shrd
      - COZE_API_BASE=https://ark.cn-beijing.volces.com/api/v3/responses
      - COZE_USE_MOCK=false
      - CLOUDBASE_ENV_ID=cloud1-6gzezzskad9fed0b
      - WECHAT_APPID=wxa1c57025b508e913
      - WECHAT_APPSECRET=056dc956b934bf58fc659c4b08bfa16e
      - COZE_SUPABASE_URL=https://pacqfzvxkiobtxbjubil.supabase.co
      - COZE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhY3FmenZ4a2lvYnR4Ymp1YmlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODM1ODYsImV4cCI6MjA4ODk1OTU4Nn0.CZoSjahWflEy3vhj_Ya9ddYhie9BtmvRxhNaN8JdZs4
      - NODE_ENV=production
      - PORT=3000
```

## 验证配置

配置完成后，可以通过以下方式验证：

1. 查看服务日志：
```
SkinService 初始化完成，使用模型: doubao-seed-1-6-vision-250815
```

2. 访问健康检查接口：
```
https://your-service-url/api/config-check
```

3. 查看返回的配置：
```json
{
  "status": "success",
  "data": {
    "cozeModel": "doubao-seed-1-6-vision-250815",
    "cozeApiBase": "https://ark.cn-beijing.volces.com/api/v3/responses",
    "cozeApiKey": "ea77474e-4...",
    "useMock": "false",
    "nodeEnv": "production"
  }
}
```

## 注意事项

⚠️ **安全提示**：
- 请勿将包含真实 API Key 的配置文件提交到公共仓库
- 定期更换 API Key 以提高安全性
- 生产环境务必使用 `COZE_USE_MOCK=false`

⚠️ **配置更新**：
- 更新环境变量后需要重启服务才能生效
- 建议在低峰时段更新配置
- 更新后务必进行功能测试

⚠️ **版本兼容性**：
- 新的 `doubao-seed-1-6-vision-250815` 模型使用 Responses API
- 与旧模型 (`doubao-1-5-vision-pro-32k-250115`) 的请求格式不同
- 已在代码中实现兼容处理，但建议全面测试

## 相关文档

- [微信云托管官方文档](https://cloud.tencent.com/document/product/1243)
- [环境变量配置指南](CLOUD_HOSTING_ENV_SETUP.md)
- [部署详细指南](WECHAT_CLOUD_HOSTING_DETAILED_GUIDE.md)

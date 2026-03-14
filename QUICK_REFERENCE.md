# 🎯 快速配置参考表

## 配置文件位置速查

| 配置项 | 文件路径 | 配置方式 | 优先级 |
|-------|---------|---------|-------|
| 环境变量 | `server/.env.production` | 编辑文件 | ⭐⭐⭐⭐⭐ |
| 小程序 API 地址 | `src/network/index.ts` | 编辑文件 | ⭐⭐⭐⭐ |
| 数据库集合 | 云开发控制台 | 网页操作 | ⭐⭐⭐⭐⭐ |
| 数据库权限 | 云开发控制台 | 网页操作 | ⭐⭐⭐⭐ |
| 云存储权限 | 云开发控制台 | 网页操作 | ⭐⭐⭐⭐ |
| 云托管环境变量 | 云开发控制台 | 网页操作 | ⭐⭐⭐⭐⭐ |
| 小程序服务器域名 | 微信公众平台 | 网页操作 | ⭐⭐⭐⭐⭐ |

---

## 📝 配置内容速查

### 1. `server/.env.production` 配置内容

```bash
# 豆包视觉模型配置
COZE_API_KEY=pat_ShNM7FfPFQdTtQ8cTfpOzo3W0eMeMrBYLvJArawGAm6gwUC9hiBoHZbd2xDs1iZh
COZE_MODEL=doubao-vision

# 微信云开发环境配置（👈 必须修改）
CLOUDBASE_ENV_ID=你的环境ID

# 其他配置
NODE_ENV=production
PORT=3000
```

### 2. 数据库权限配置

**skin_history 集合**：
```json
{
  "read": "doc.userId == auth.openid",
  "write": "doc.userId == auth.openid"
}
```

**users 集合**：
```json
{
  "read": "doc._openid == auth.openid",
  "write": "doc._openid == auth.openid"
}
```

### 3. 云存储权限配置

```json
{
  "read": true,
  "write": true
}
```

### 4. 云托管环境变量

| 变量名 | 变量值 |
|-------|--------|
| `COZE_API_KEY` | `pat_ShNM7FfPFQdTtQ8cTfpOzo3W0eMeMrBYLvJArawGAm6gwUC9hiBoHZbd2xDs1iZh` |
| `COZE_MODEL` | `doubao-vision` |
| `CLOUDBASE_ENV_ID` | `你的环境ID` |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |

### 5. 小程序 API 地址配置

```typescript
// 修改前
const PROJECT_DOMAIN = 'http://localhost:3000';

// 修改后（👈 必须修改）
const PROJECT_DOMAIN = 'https://你的服务ID.tcb.qcloud.la';
```

### 6. 小程序服务器域名

| 域名类型 | 域名地址 |
|---------|---------|
| request | `https://你的服务ID.tcb.qcloud.la` |
| uploadFile | `https://你的服务ID.tcb.qcloud.la` |
| downloadFile | `https://你的服务ID.tcb.qcloud.la` |

---

## 🔗 重要链接

| 链接 | 用途 |
|------|------|
| https://console.cloud.tencent.com/tcb | 微信云开发控制台 |
| https://mp.weixin.qq.com/ | 微信公众平台 |
| https://docs.cloudbase.net/ | 云开发文档 |

---

## ⚠️ 关键注意事项

### ⭐ 必须修改的配置

1. **`server/.env.production` 中的 `CLOUDBASE_ENV_ID`**
   - 必须替换为你的实际环境 ID
   - 否则无法连接云数据库和云存储

2. **小程序 API 地址**
   - 必须替换为云托管服务地址
   - 否则小程序无法调用后端

3. **云托管环境变量中的 `CLOUDBASE_ENV_ID`**
   - 必须与文件中的环境 ID 一致
   - 否则云托管无法连接云数据库

4. **小程序服务器域名**
   - 必须配置云托管服务地址
   - 否则小程序无法发起网络请求

### ⚡ 配置生效时间

| 配置项 | 生效时间 |
|-------|---------|
| `.env.production` 文件 | 重启服务后生效 |
| 数据库权限 | 立即生效 |
| 云存储权限 | 立即生效 |
| 云托管环境变量 | 重新部署后生效 |
| 小程序服务器域名 | 5-10 分钟后生效 |
| 小程序 API 地址 | 重新编译后生效 |

---

## 🔍 配置验证方法

### 1. 验证环境变量

```bash
# 查看环境变量文件
cat server/.env.production

# 确认 CLOUDBASE_ENV_ID 已修改
```

### 2. 验证数据库集合

1. 登录云开发控制台
2. 进入数据库
3. 确认 `skin_history` 和 `users` 集合已创建

### 3. 验证云托管服务

1. 登录云开发控制台
2. 进入云托管
3. 确认服务已创建并运行

### 4. 验证小程序域名

1. 登录微信公众平台
2. 进入开发设置
3. 确认服务器域名已配置

### 5. 验证服务连接

```bash
# 测试云托管服务
curl https://你的服务ID.tcb.qcloud.la/api/health

# 预期返回
{
  "status": "success",
  "data": "2026-03-14T..."
}
```

---

## 📞 配置帮助

如果配置过程中遇到问题：

1. **查看详细指南**：`DETAILED_CONFIG_GUIDE.md`
2. **查看部署指南**：`CLOUD_BASE_DEPLOYMENT_GUIDE.md`
3. **查看云开发文档**：https://docs.cloudbase.net/
4. **联系微信云开发技术支持**

---

**快速配置完成后，记得对照检查清单确认所有配置项！** ✅

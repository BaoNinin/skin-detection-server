# 🌐 自定义域名快速配置模板

## 📋 告诉我你的域名

请告诉我你的自定义域名，格式如：

```
api.yourdomain.com
或
backend.yourdomain.com
```

我会帮你：
1. ✅ 更新小程序配置文件
2. ✅ 提供详细的 DNS 配置说明
3. ✅ 提供验证方法

---

## 🚀 配置流程（快速版）

### 1. 在云托管添加域名（1 分钟）

```
云托管控制台 → 流量管理 → 域名管理 → 添加域名
```

输入域名：`api.yourdomain.com`

### 2. 配置 DNS 解析（2 分钟）

在域名注册商处添加 CNAME 记录：

| 主机记录 | 记录类型 | 记录值 | TTL |
|---------|---------|--------|-----|
| api | CNAME | skin-detection-serve-235668-9-1411837125.sh.run.tcloudbase.com | 600 |

### 3. 等待 DNS 生效（10-30 分钟）

检查方法：
```powershell
nslookup api.yourdomain.com
```

### 4. 在云托管验证并申请 HTTPS 证书（5 分钟）

云托管控制台 → 域名管理 → 验证 → 申请证书

### 5. 更新小程序配置（我会帮你）

我会更新：
- `config/index.ts` 中的 PROJECT_DOMAIN
- `.env.local` 中的 PROJECT_DOMAIN

### 6. 重新编译小程序

```bash
pnpm build:weapp
```

### 7. 测试验证

浏览器访问：
```
https://api.yourdomain.com/api/health
```

---

## ⏱️ 预计时间

| 步骤 | 时间 | 说明 |
|-----|------|------|
| 添加域名 | 1 分钟 | 云托管操作 |
| 配置 DNS | 2 分钟 | 域名注册商操作 |
| DNS 生效 | 10-30 分钟 | 国内域名通常较快 |
| 验证域名 | 1 分钟 | 云托管操作 |
| 申请 HTTPS | 5 分钟 | 自动申请免费证书 |
| 更新小程序配置 | 2 分钟 | 我会帮你 |
| 重新编译 | 1 分钟 | 本地操作 |
| 测试验证 | 2 分钟 | 确认正常工作 |

**总计：约 25-45 分钟**

---

## 💡 域名建议

### 推荐的二级域名

| 用途 | 域名示例 | 优先级 |
|-----|---------|--------|
| API 服务器 | `api.yourdomain.com` | ⭐⭐⭐⭐⭐ 最推荐 |
| 后端服务 | `backend.yourdomain.com` | ⭐⭐⭐⭐ |
| 服务端 | `server.yourdomain.com` | ⭐⭐⭐ |
| 云服务 | `cloud.yourdomain.com` | ⭐⭐ |

### 不推荐的域名

| 域名 | 原因 |
|-----|------|
| `yourdomain.com` | 主域名应保留给官网 |
| `www.yourdomain.com` | 通常用于前端页面 |
| `m.yourdomain.com` | 通常用于移动端网页 |

---

## 🔍 DNS 生效检查方法

### 方法 1：Windows 命令行

```powershell
# 使用 nslookup
nslookup api.yourdomain.com

# 或使用 ping
ping api.yourdomain.com
```

**成功标志：**
```
服务器:  UnKnown
Address:  xxx.xxx.xxx.xxx

名称:    api.yourdomain.com
Address:  xxx.xxx.xxx.xxx
```

### 方法 2：在线工具

访问：
- https://tool.chinaz.com/dns/
- https://dnspod.cn/QueryPages/Result.aspx

**成功标志：**
解析记录显示云托管的 CNAME 值

### 方法 3：浏览器访问

直接访问：
```
http://api.yourdomain.com/api/health
```

**成功标志：**
返回 JSON 数据：
```json
{
  "status": "success",
  "data": "2025-01-22T..."
}
```

---

## ⚠️ 重要提示

### 1. 域名白名单（微信小程序）

配置自定义域名后，需要在微信小程序后台添加域名到服务器域名白名单：

```
小程序后台 → 开发 → 开发管理 → 开发设置 → 服务器域名
```

添加：
```
https://api.yourdomain.com
```

### 2. HTTPS 证书

- 云托管会自动申请免费证书（Let's Encrypt）
- 证书有效期：90 天（自动续期）
- 申请时间：约 1-5 分钟

### 3. DNS 生效时间

- **国内域名**：通常 10-30 分钟
- **国外域名**：可能需要 24 小时

---

## ✅ 配置完成检查清单

- [ ] ✅ 在云托管添加了自定义域名
- [ ] ✅ 配置了 DNS CNAME 记录
- [ ] ✅ DNS 解析已生效（nslookup 验证）
- [ ] ✅ 云托管域名验证成功
- [ ] ✅ HTTPS 证书已申请
- [ ] ✅ 小程序配置已更新
- [ ] ✅ 重新编译了小程序
- [ ] ✅ 浏览器可以访问 `https://api.yourdomain.com/api/health`
- [ ] ✅ API 接口返回正常
- [ ] ✅ 小程序功能测试通过
- [ ] ✅ 域名已添加到微信小程序白名单

---

## 🎯 告诉我你的域名

现在请告诉我你的自定义域名，格式如：

```
api.yourdomain.com
```

我会立即帮你：
1. ✅ 更新所有配置文件
2. ✅ 提供详细的 DNS 配置说明
3. ✅ 提供测试验证方法

---

**准备好了吗？告诉我你的域名吧！** 🚀

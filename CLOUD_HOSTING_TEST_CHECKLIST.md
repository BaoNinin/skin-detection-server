# 🌐 云托管自定义域名配置指南

## 📋 前置条件

- [x] ✅ 云托管服务正常运行
- [x] ✅ 小程序功能测试通过
- [ ] ⬜ 自定义域名已注册
- [ ] ⬜ 域名 DNS 解析权限

---

## 🚀 配置步骤

### 步骤 1：准备自定义域名

**确认你的域名：**
- 例如：`api.yourdomain.com`
- 或：`backend.yourdomain.com`

**要求：**
- 域名已完成注册
- 可以在域名注册商处管理 DNS 解析
- 推荐使用二级域名（如 api.*）

---

### 步骤 2：在云托管添加自定义域名

1. **登录云托管控制台**
   - 访问：https://console.cloud.tencent.com/tcb/service
   - 选择环境：`prod-3gbk859ae18cc611`
   - 选择服务：`skin-detection-server`

2. **进入域名管理**
   - 在左侧菜单中找到「流量管理」
   - 点击「域名管理」

3. **添加自定义域名**
   - 点击「添加域名」
   - 输入你的域名（例如：`api.yourdomain.com`）
   - 点击「确认」

4. **等待 DNS 记录生成**
   - 系统会自动生成 CNAME 记录
   - 格式类似：`your-service-id.tcb.qcloud.la`
   - 记录这个 CNAME 值（下一步需要）

---

### 步骤 3：配置 DNS 解析

1. **登录域名注册商后台**
   - 例如：阿里云、腾讯云、新网等

2. **进入 DNS 解析管理**
   - 找到「DNS 解析」或「域名解析」
   - 选择你的域名

3. **添加 CNAME 记录**

   **记录类型**：CNAME
   **主机记录**：二级域名前缀（如 `api`）
   **记录值**：云托管提供的 CNAME 值
   **TTL**：600（或默认值）

   **示例：**

   | 主机记录 | 记录类型 | 记录值 | TTL |
   |---------|---------|--------|-----|
   | api | CNAME | skin-detection-serve-235668-9-1411837125.sh.run.tcloudbase.com | 600 |

4. **保存 DNS 记录**

---

### 步骤 4：等待 DNS 生效

DNS 解析通常需要 10 分钟到 24 小时生效：
- **国内域名**：通常 10-30 分钟
- **国外域名**：可能需要 24 小时

**如何检查 DNS 是否生效：**

**方法 1：使用命令行（Windows）**
```powershell
# 使用 nslookup 查询
nslookup api.yourdomain.com

# 或使用 ping
ping api.yourdomain.com
```

**方法 2：使用在线工具**
- https://tool.chinaz.com/dns/
- https://dnspod.cn/QueryPages/Result.aspx

**方法 3：在浏览器访问**
- 访问：`http://api.yourdomain.com/api/health`
- 如果能正常访问，说明 DNS 已生效

---

### 步骤 5：在云托管验证域名

1. **回到云托管控制台**
   - 流量管理 → 域名管理
   - 找到你添加的域名

2. **点击「验证」**
   - 系统会检查 DNS 解析是否生效
   - 如果显示「验证成功」，可以继续

3. **启用 HTTPS（推荐）**

   点击「申请证书」：
   - 系统会自动申请免费证书（Let's Encrypt）
   - 证书签发时间：约 1-5 分钟
   - 证书有效期：90 天（自动续期）

   **或上传自有证书：**
   - 如果你有自己的证书
   - 点击「上传证书」
   - 上传证书文件和私钥

---

### 步骤 6：更新小程序配置

DNS 生效并 HTTPS 证书申请成功后，更新小程序配置。

#### 1. 更新 `config/index.ts`

```typescript
defineConstants: {
  PROJECT_DOMAIN: JSON.stringify('https://api.yourdomain.com'), // 替换为你的域名
  TARO_ENV: JSON.stringify(process.env.TARO_ENV),
  TARO_APP_WEAPP_APPID: JSON.stringify('wx8826c7b681ec3c65'),
},
```

#### 2. 更新 `.env.local`

```bash
PROJECT_DOMAIN=https://api.yourdomain.com
```

#### 3. 重新编译小程序

```bash
pnpm build:weapp
```

#### 4. 在开发者工具中重新加载项目

---

## 🔍 步骤 7：测试自定义域名

### 测试 API 接口

```bash
# 测试健康检查
curl https://api.yourdomain.com/api/health

# 预期返回：
# {"status":"success","data":"2025-01-22T..."}
```

### 测试浏览器访问

访问以下 URL：

```
https://api.yourdomain.com/api/health
https://api.yourdomain.com/api/hello
```

应该能看到正常的 JSON 响应。

### 测试小程序

1. 重新编译小程序
2. 在开发者工具中清除缓存
3. 重新加载项目
4. 测试登录、拍照分析等功能

---

## ✅ 验证清单

配置完成后，请确认：

- [ ] ✅ 自定义域名已在云托管添加
- [ ] ✅ DNS CNAME 记录已配置
- [ ] ✅ DNS 解析已生效（nslookup 或在线工具验证）
- [ ] ✅ 云托管域名验证成功
- [ ] ✅ HTTPS 证书已申请（或上传自有证书）
- [ ] ✅ 浏览器可以访问 `https://api.yourdomain.com/api/health`
- [ ] ✅ API 接口返回正常
- [ ] ✅ 小程序配置已更新
- [ ] ✅ 小程序功能测试通过

---

## ⚠️ 常见问题

### Q1: DNS 解析一直不生效？

**可能原因：**
1. DNS 传播需要时间
2. DNS 记录配置错误
3. 域名注册商的 DNS 服务器故障

**解决方法：**
1. 等待更长时间（最多 24 小时）
2. 检查 DNS 记录是否正确
3. 使用在线工具查询不同地区的 DNS 解析

### Q2: 域名验证失败？

**可能原因：**
1. DNS 记录配置错误
2. DNS 还未生效
3. 域名已被云托管占用

**解决方法：**
1. 检查 CNAME 记录是否正确
2. 使用 nslookup 验证 DNS
3. 联系云托管技术支持

### Q3: HTTPS 证书申请失败？

**可能原因：**
1. DNS 未生效
2. 域名未备案（如果使用国内服务器）
3. 证书申请频率过高

**解决方法：**
1. 确认 DNS 已生效
2. 如果是境内域名，确保已备案
3. 等待 1-2 小时后重试

### Q4: 小程序连接失败？

**可能原因：**
1. 域名未在微信小程序后台白名单中
2. HTTPS 证书无效
3. DNS 解析异常

**解决方法：**
1. 在微信小程序后台添加域名到服务器域名白名单
2. 检查 HTTPS 证书是否有效
3. 使用 nslookup 检查 DNS

---

## 📋 域名白名单配置（微信小程序）

如果小程序访问自定义域名失败，需要在微信小程序后台添加域名：

1. **登录微信小程序后台**
   - 访问：https://mp.weixin.qq.com/
   - 开发 → 开发管理 → 开发设置

2. **配置服务器域名**

   在「服务器域名」中添加：
   ```
   https://api.yourdomain.com
   ```

3. **保存配置**

4. **重新编译小程序**

---

## 🎯 域名类型建议

### 推荐的二级域名

| 用途 | 域名示例 | 说明 |
|-----|---------|------|
| API 服务器 | `api.yourdomain.com` | 最常用 |
| 后端服务 | `backend.yourdomain.com` | 明确用途 |
| 服务端 | `server.yourdomain.com` | 简洁 |
| 云服务 | `cloud.yourdomain.com` | 云端服务 |

### 不推荐的域名

| 域名 | 原因 |
|-----|------|
| `yourdomain.com` | 主域名应保留给官网 |
| `www.yourdomain.com` | 通常用于前端页面 |
| `m.yourdomain.com` | 通常用于移动端网页 |

---

## 🎉 完成！

配置完成后，你将拥有：

- ✅ 自定义域名访问
- ✅ 自动 HTTPS
- ✅ 更专业的品牌形象
- ✅ 更快的访问速度（CDN 加速）

---

**开始配置吧！** 🚀

# 📋 gaodiai.cn 域名配置快速参考

## ✅ 已完成

### 配置文件已更新

**1. .env.local** ✅
```bash
PROJECT_DOMAIN=https://api.gaodiai.cn
```

**2. config/index.ts** ✅
```typescript
defineConstants: {
  PROJECT_DOMAIN: JSON.stringify('https://api.gaodiai.cn'),
  ...
}
```

**3. 配置文档** ✅
- `GAODIAI_DOMAIN_CONFIG.md` - 完整配置指南
- `NFC_CONFIG_GUIDE.md` - NFC 配置指南（已更新）

---

## 📋 待完成

### 步骤 1：在云托管添加自定义域名 ⭐⭐⭐

**操作：**
1. 登录云托管控制台：https://console.cloud.tencent.com/tcb/service
2. 选择环境：`prod-3gbk859ae18cc611`
3. 选择服务：`skin-detection-server`
4. 流量管理 → 域名管理
5. 点击「添加域名」
6. 输入：`api.gaodiai.cn`
7. 点击「确认」
8. ✅ 复制 CNAME 记录

---

### 步骤 2：配置 DNS 解析 ⭐⭐⭐

**DNS 记录：**

| 主机记录 | 记录类型 | 记录值 | TTL |
|---------|---------|--------|-----|
| api | CNAME | skin-detection-api-237195-6-1414623738.sh.run.tcloudbase.com | 600 |

**操作：**
1. 登录域名注册商后台
2. 进入 DNS 解析管理
3. 添加 CNAME 记录
4. 保存

---

### 步骤 3：验证自定义域名 ⭐⭐

**验证 DNS 生效：**

```bash
# Windows
nslookup api.gaodiai.cn

# macOS/Linux
dig api.gaodiai.cn
```

**在云托管验证：**
1. 流量管理 → 域名管理
2. 找到 `api.gaodiai.cn`
3. 点击「验证」
4. 确认显示「验证成功」

---

### 步骤 4：申请 HTTPS 证书 ⭐⭐

**操作：**
1. 在域名管理页面，找到 `api.gaodiai.cn`
2. 点击「申请证书」
3. 选择「免费证书」（Let's Encrypt）
4. 点击「申请」
5. 等待 1-5 分钟

**测试 HTTPS 访问：**
```
https://api.gaodiai.cn
```

---

### 步骤 5：测试自定义域名 ⭐⭐⭐

**重启开发服务器：**
```bash
cd /workspace/projects
coze dev
```

**测试 API：**
```bash
# 测试健康检查
curl https://api.gaodiai.cn/api/health

# 测试皮肤分析
curl -X POST https://api.gaodiai.cn/api/skin/analyze \
  -H "Content-Type: application/json" \
  -d '{"imageUrl":"test.jpg"}'
```

**重新编译小程序：**
```bash
pnpm build:weapp
```

**测试小程序：**
1. 微信开发者工具
2. 重新编译
3. 测试 API 调用
4. 真机测试

---

### 步骤 6：配置小程序服务器域名 ⭐

**操作：**
1. 登录微信小程序后台：https://mp.weixin.qq.com/
2. 开发 → 开发管理 → 开发设置
3. 找到「服务器域名」
4. 在 request 合法域名中添加：
   ```
   https://api.gaodiai.cn
   ```
5. 保存

---

### 步骤 7：配置 NFC 芯片 ⭐

**参考文档：** `NFC_CONFIG_GUIDE.md`

**关键步骤：**
1. 获取小程序 URL Scheme（30 天有效）
2. 修改 `server/nfc-redirect.html` 中的 `MINIPRAM_URL`
3. 部署 `nfc-redirect.html` 到云托管
4. 将网页 URL 写入 NFC 芯片：
   ```
   https://api.gaodiai.cn/nfc-redirect.html
   ```

---

## 📊 配置进度

| 步骤 | 状态 | 说明 |
|-----|------|------|
| 更新配置文件 | ✅ 完成 | .env.local 和 config/index.ts |
| 云托管添加域名 | ⏳ 待操作 | 需要在云托管控制台操作 |
| DNS 解析配置 | ⏳ 待操作 | 需要在域名注册商后台操作 |
| 验证自定义域名 | ⏳ 待操作 | DNS 生效后验证 |
| 申请 HTTPS 证书 | ⏳ 待操作 | 需在云托管操作 |
| 测试自定义域名 | ⏳ 待操作 | 测试 API 和小程序 |
| 配置小程序域名 | ⏳ 待操作 | 在微信小程序后台配置 |
| 配置 NFC 芯片 | ⏳ 待操作 | 参考 NFC_CONFIG_GUIDE.md |

---

## 🚀 快速开始

### 现在就可以开始：

1. **第一步**（最重要）：
   - 登录云托管控制台
   - 添加自定义域名 `api.gaodiai.cn`
   - 复制 CNAME 记录

2. **第二步**：
   - 登录域名注册商后台
   - 添加 DNS CNAME 记录

3. **第三步**：
   - 等待 10-30 分钟
   - 验证 DNS 生效

4. **第四步**：
   - 在云托管申请 HTTPS 证书

5. **第五步**：
   - 重启开发服务器
   - 测试 API 和小程序

---

## 💡 提示

1. **DNS 生效时间**
   - 通常 10-30 分钟
   - 最长可能 24 小时

2. **HTTPS 证书**
   - Let's Encrypt 免费证书
   - 有效期 90 天，自动续期

3. **配置文件已就绪**
   - `.env.local` 和 `config/index.ts` 已更新
   - DNS 生效后即可使用

4. **测试时**
   - 确认 DNS 生效后再测试
   - HTTPS 证书签发后才能访问

---

## 📞 需要帮助？

如果在任何步骤遇到问题：
1. 告诉我是哪个步骤
2. 提供错误信息或截图
3. 我会帮你解决

---

**开始配置吧！** 🚀

第一步：登录云托管控制台，添加自定义域名 `api.gaodiai.cn`

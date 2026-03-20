# 🌐 gaodiai.cn 域名配置指南

## 📋 配置概览

- **域名**：`gaodiai.cn`
- **云托管服务**：`skin-detection-server`
- **环境**：`prod-3gbk859ae18cc611`
- **当前默认域名**：`https://skin-detection-serve-235668-9-1411837125.sh.run.tcloudbase.com`
- **目标自定义域名**：`https://api.gaodiai.cn`

---

## 🚀 配置步骤（6 步）

### 步骤 1：在云托管添加自定义域名 ⭐

**1.1 登录腾讯云云托管控制台**
```
访问：https://console.cloud.tencent.com/tcb/service
```

**1.2 进入服务管理**
1. 选择环境：`prod-3gbk859ae18cc611`
2. 选择服务：`skin-detection-server`

**1.3 进入域名管理**
1. 在左侧菜单中找到「流量管理」
2. 点击「域名管理」

**1.4 添加自定义域名**
1. 点击「添加域名」
2. 输入：`api.gaodiai.cn`
   - ⚠️ **注意**：使用 `api` 二级域名，不要直接用 `gaodiai.cn`（根域名通常用于官网）
3. 点击「确认」

**1.5 获取 CNAME 记录**
系统会自动生成 CNAME 记录，格式类似：
```
skin-detection-serve-235668-9-1411837125.sh.run.tcloudbase.com
```

✅ **复制这个 CNAME 值**（下一步 DNS 解析需要用到）

---

### 步骤 2：配置域名 DNS 解析 ⭐⭐⭐

**2.1 登录域名注册商后台**

根据你的域名注册商选择：
- 腾讯云：https://console.cloud.tencent.com/cns
- 阿里云：https://dns.console.aliyun.com
- 新网：http://dnp.xinnet.com
- 其他：登录你的域名管理后台

**2.2 进入 DNS 解析管理**
找到「DNS 解析」或「域名解析」管理页面

**2.3 添加 CNAME 记录**

**记录信息：**

| 主机记录 | 记录类型 | 记录值 | TTL |
|---------|---------|--------|-----|
| api | CNAME | skin-detection-serve-235668-9-1411837125.sh.run.tcloudbase.com | 600 |

**操作步骤：**
1. 点击「添加记录」
2. 填写：
   - **主机记录**：`api`
   - **记录类型**：`CNAME`
   - **记录值**：粘贴上一步复制的 CNAME 值
   - **TTL**：`600`（或默认值）
3. 点击「确认」或「保存」

**2.4 保存 DNS 记录**

---

### 步骤 3：验证自定义域名 ⭐

**3.1 等待 DNS 生效**

DNS 解析通常需要 **10-30 分钟** 生效，最长可能需要 24 小时。

**3.2 检查 DNS 是否生效**

**方法 1：命令行查询（推荐）**

**Windows:**
```powershell
nslookup api.gaodiai.cn
```

**macOS/Linux:**
```bash
dig api.gaodiai.cn
# 或
nslookup api.gaodiai.cn
```

**方法 2：在线工具**
- https://tool.chinaz.com/dns/
- https://dnspod.cn/QueryPages/Result.aspx

**成功标志：**
```
api.gaodiai.cn canonical name = skin-detection-serve-xxx.tcb.qcloud.la
```

**3.3 在云托管验证域名**

1. 回到云托管控制台
2. 流量管理 → 域名管理
3. 找到 `api.gaodiai.cn`
4. 点击「验证」
5. 系统会检查 DNS 解析
6. 显示「验证成功」即可

---

### 步骤 4：申请 HTTPS 证书 ⭐

**4.1 在云托管申请证书**

1. 在域名管理页面，找到 `api.gaodiai.cn`
2. 点击「申请证书」
3. 选择证书类型：
   - **免费证书**：Let's Encrypt（推荐）
   - **自有证书**：如果你有购买的证书

**4.2 使用 Let's Encrypt 免费证书**

1. 选择「免费证书」
2. 点击「申请」
3. 系统会自动：
   - 验证域名所有权
   - 申请证书
   - 部署证书

**4.3 等待证书签发**

- **签发时间**：通常 1-5 分钟
- **有效期**：90 天（自动续期）
- 状态变为「已启用」表示成功

**4.4 测试 HTTPS 访问**

在浏览器中访问：
```
https://api.gaodiai.cn/api/health
```

或直接访问根域名：
```
https://api.gaodiai.cn
```

---

### 步骤 5：更新项目配置文件 ⭐⭐⭐

DNS 生效和 HTTPS 证书申请成功后，更新项目配置。

**5.1 更新 .env.local 文件**

**文件位置：** 项目根目录下的 `.env.local`

**修改内容：**

```bash
# 修改前
PROJECT_DOMAIN=https://skin-detection-serve-235668-9-1411837125.sh.run.tcloudbase.com

# 修改后
PROJECT_DOMAIN=https://api.gaodiai.cn
```

**操作：**
1. 打开 `.env.local` 文件
2. 将 `PROJECT_DOMAIN` 改为 `https://api.gaodiai.cn`
3. 保存文件

**5.2 更新 config/index.ts 文件**

**文件位置：** `config/index.ts`

**修改内容：**

找到第 63 行左右的 `defineConstants` 部分：

```typescript
// 修改前
defineConstants: {
  PROJECT_DOMAIN: JSON.stringify('https://skin-detection-serve-235668-9-1411837125.sh.run.tcloudbase.com'),
  TARO_ENV: JSON.stringify(process.env.TARO_ENV),
  TARO_APP_WEAPP_APPID: JSON.stringify('wx8826c7b681ec3c65'),
},
```

```typescript
// 修改后
defineConstants: {
  PROJECT_DOMAIN: JSON.stringify('https://api.gaodiai.cn'),
  TARO_ENV: JSON.stringify(process.env.TARO_ENV),
  TARO_APP_WEAPP_APPID: JSON.stringify('wx8826c7b681ec3c65'),
},
```

**操作：**
1. 打开 `config/index.ts` 文件
2. 找到 `defineConstants` 部分
3. 将 `PROJECT_DOMAIN` 的值改为 `https://api.gaodiai.cn`
4. 保存文件

---

### 步骤 6：测试和验证 ⭐⭐⭐

**6.1 本地开发测试**

**重启开发服务器：**
```bash
cd /workspace/projects
coze dev
```

**测试 API 调用：**
- 小程序中调用接口
- 查看浏览器控制台
- 确认请求发送到 `https://api.gaodiai.cn`

**6.2 重新编译小程序**

```bash
pnpm build:weapp
```

**6.3 使用微信开发者工具测试**

1. 打开微信开发者工具
2. 重新编译小程序
3. 测试所有 API 功能
4. 检查网络请求
5. 确认所有请求都使用新域名

**6.4 真机测试**

1. 预览二维码
2. 用微信扫码
3. 测试核心功能
4. 检查 API 调用

**6.5 测试关键接口**

```bash
# 测试健康检查
curl https://api.gaodiai.cn/api/health

# 测试皮肤分析接口
curl -X POST https://api.gaodiai.cn/api/skin/analyze \
  -H "Content-Type: application/json" \
  -d '{"imageUrl":"test.jpg"}'
```

---

## ✅ 配置完成检查清单

完成所有步骤后，请确认：

- [ ] ✅ 已在云托管添加自定义域名 `api.gaodiai.cn`
- [ ] ✅ 已配置 DNS 解析（CNAME 记录）
- [ ] ✅ DNS 解析已生效（nslookup 验证通过）
- [ ] ✅ 在云托管验证域名成功
- [ ] ✅ 已申请 HTTPS 证书（Let's Encrypt）
- [ ] ✅ 可以通过 HTTPS 访问新域名
- [ ] ✅ 已更新 `.env.local` 文件
- [ ] ✅ 已更新 `config/index.ts` 文件
- [ ] ✅ 本地开发测试通过
- [ ] ✅ 小程序编译成功
- [ ] ✅ 开发者工具测试通过
- [ ] ✅ 真机测试通过
- [ ] ✅ 所有 API 接口正常工作

---

## 🔧 常见问题排查

### Q1: DNS 解析不生效？

**症状：**
- nslookup 查询不到解析记录
- ping 域名无法连接

**原因：**
- DNS 传播时间未到
- DNS 记录配置错误

**解决方法：**
1. 等待 10-30 分钟后重试
2. 检查 DNS 记录是否正确
3. 使用 `ipconfig /flushdns`（Windows）或 `sudo dscacheutil -flushcache`（macOS）清除本地 DNS 缓存

### Q2: HTTPS 证书申请失败？

**症状：**
- 证书申请一直失败
- 提示域名验证失败

**原因：**
- DNS 解析未生效
- 域名所有权验证失败

**解决方法：**
1. 确认 DNS 解析已生效
2. 检查域名解析是否指向正确的 CNAME
3. 等待 DNS 完全生效后重试

### Q3: 域名访问 404？

**症状：**
- 访问 `https://api.gaodiai.cn` 返回 404
- API 接口无法访问

**原因：**
- 域名未正确绑定到服务
- 路由配置问题

**解决方法：**
1. 确认云托管域名绑定成功
2. 检查服务是否正常运行
3. 使用云托管默认域名测试

### Q4: 小程序网络请求失败？

**症状：**
- 小程序无法调用 API
- 报错 "request:fail"

**原因：**
- 新域名未配置服务器域名白名单
- HTTPS 证书问题

**解决方法：**
1. 在小程序后台配置服务器域名
2. 确认 HTTPS 证书有效
3. 检查小程序网络请求配置

### Q5: 本地开发仍然使用旧域名？

**症状：**
- 修改配置后，请求仍然发送到旧域名

**原因：**
- 开发服务器未重启
- 浏览器缓存

**解决方法：**
1. 重启开发服务器：`coze dev`
2. 清除浏览器缓存
3. 硬刷新：Ctrl + F5

---

## 📝 配置记录模板

```
自定义域名配置记录

配置时间：2025-01-22

域名信息：
- 域名：api.gaodiai.cn
- 根域名：gaodiai.cn
- DNS 注册商：[填写]

云托管信息：
- 环境：prod-3gbk859ae18cc611
- 服务：skin-detection-server
- 原默认域名：https://skin-detection-serve-235668-9-1411837125.sh.run.tcloudbase.com

DNS 配置：
- 记录类型：CNAME
- 主机记录：api
- 记录值：skin-detection-serve-235668-9-1411837125.sh.run.tcloudbase.com
- TTL：600

HTTPS 证书：
- 类型：Let's Encrypt
- 申请时间：2025-01-22
- 到期时间：2025-04-22（90天）

配置文件更新：
- .env.local：PROJECT_DOMAIN=https://api.gaodiai.cn
- config/index.ts：defineConstants PROJECT_DOMAIN=https://api.gaodiai.cn

测试结果：
- DNS 生效：✅
- HTTPS 访问：✅
- 本地开发：✅
- 小程序编译：✅
- 开发者工具：✅
- 真机测试：✅
- API 接口：✅
```

---

## 🎯 下一步

域名配置完成后：

1. **配置小程序服务器域名**
   - 登录微信小程序后台
   - 开发 → 开发管理 → 开发设置 → 服务器域名
   - 将 `https://api.gaodiai.cn` 添加到 request 合法域名

2. **更新 NFC 跳转配置**
   - 修改 `nfc-redirect.html`
   - 更新网页 URL

3. **监控域名健康**
   - 定期检查 HTTPS 证书
   - 监控 API 可用性

---

**开始配置域名吧！** 🚀

按照步骤操作，有任何问题随时告诉我！

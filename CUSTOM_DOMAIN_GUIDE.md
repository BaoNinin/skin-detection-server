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
   | api | CNAME | skin-detection-api-237195-6-1414623738.sh.run.tcloudbase.com | 600 |

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

#### 1. 更新 `config/index.ts`<tool_call>edit_file<arg_key>file_path</arg_key><arg_value>config/index.ts
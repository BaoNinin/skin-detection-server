# 🎉 微信云托管部署配置已完成！

## ✅ 配置状态

所有配置文件已准备完成，你只需要执行部署操作即可。

### 已配置的信息

| 配置项 | 值 |
|--------|-----|
| 微信小程序 AppID | `wxa1c57025b508e913` |
| 微信小程序 AppSecret | `056dc956b934bf58fc659c4b08bfa16e` |
| Supabase URL | `https://pacqfzvxkiobtxbjubil.supabase.co` |
| Supabase Anon Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhY3FmenZ4a2lvYnR4Ymp1YmlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODM1ODYsImV4cCI6MjA4ODk1OTU4Nn0.CZoSjahWflEy3vhj_Ya9ddYhie9BtmvRxhNaN8JdZs4` |

---

## 🚀 立即开始部署（5分钟完成）

### 第一步：打包代码

#### 如果你是 Windows 用户：

```cmd
cd server
package.bat
```

#### 如果你是 Mac/Linux 用户：

```bash
cd server
chmod +x package.sh
./package.sh
```

打包完成后，会生成 `skin-analysis-api.zip` 文件。

---

### 第二步：上传到微信云托管

1. **访问云托管控制台**
   - 打开浏览器，访问：https://console.cloud.tencent.com/tcb
   - 使用微信扫码登录

2. **创建环境（第一次使用）**
   - 点击"新建环境"
   - 填写：
     - 环境名称：`skin-analysis-env`
     - 环境规格：按量计费（基础版 0.5核 1GB）
   - 点击"新建"

3. **创建服务**
   - 进入刚创建的环境
   - 点击"服务" → "新建服务"
   - 填写：
     - 服务名称：`skin-analysis-api`
   - 选择"从代码包上传"
   - 上传 `skin-analysis-api.zip` 文件

4. **配置环境变量**
   - 在服务详情中，点击"环境变量"
   - 点击"添加环境变量"，逐个添加：

   ```
   COZE_SUPABASE_URL=https://pacqfzvxkiobtxbjubil.supabase.co
   COZE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhY3FmenZ4a2lvYnR4Ymp1YmlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODM1ODYsImV4cCI6MjA4ODk1OTU4Nn0.CZoSjahWflEy3vhj_Ya9ddYhie9BtmvRxhNaN8JdZs4
   WECHAT_APPID=wxa1c57025b508e913
   WECHAT_APPSECRET=056dc956b934bf58fc659c4b08bfa16e
   NODE_ENV=production
   PORT=3000
   ```

5. **部署服务**
   - 回到"基本信息"标签页
   - 点击"部署"按钮
   - 等待 2-5 分钟，直到状态变为"运行中"

6. **获取服务地址**
   - 在服务详情中找到"访问地址"
   - 复制地址，格式类似：
     ```
     https://skin-analysis-api-xxxx.service.tcloudbase.com
     ```

---

### 第三步：配置微信小程序域名

1. **访问微信公众平台**
   - 打开：https://mp.weixin.qq.com
   - 扫码登录

2. **配置服务器域名**
   - 进入"开发" → "开发管理" → "开发设置"
   - 找到"服务器域名"
   - 在"request 合法域名"中，添加你的服务地址
   - 点击"保存"
   - 等待审核通过（通常几分钟）

---

### 第四步：测试服务

在浏览器中访问：

```
https://your-service-url/api/skin/history?userId=1
```

如果返回 JSON 数据，说明部署成功！

---

## 📚 详细文档

如果你需要更详细的说明，请查看：

| 文档 | 说明 |
|------|------|
| `DEPLOY_README.md` | 部署文件说明和配置汇总 |
| `QUICK_DEPLOY.md` | 5分钟快速部署指南 |
| `DEPLOY_WECHAT_CLOUD.md` | 完整部署指南（包含常见问题） |

---

## 💰 成本估算

微信云托管按量计费（参考价格）：

- **CPU (0.5核)**：¥0.007/小时
- **内存 (1GB)**：¥0.007/小时
- **流量**：¥0.8/GB

**每月成本（24小时运行）**：
- CPU + 内存：约 ¥10/月
- 流量：约 ¥5-20/月（取决于用户访问量）
- **总计：约 ¥15-30/月**

**省钱技巧**：
- 设置最小副本数为 0（无请求时不收费）
- 使用自动扩缩容

---

## 🎯 部署完成后的架构

```
┌─────────────────┐
│  微信小程序     │
│  (用户端)       │
└────────┬────────┘
         │ HTTPS
         ↓
┌─────────────────┐
│  微信云托管     │
│  后端服务       │
│  NestJS API     │
│  0.5核 1GB      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Supabase       │
│  云数据库       │
│  PostgreSQL     │
│  项目: pacqfzvx │
└─────────────────┘
```

**✅ 数据存储在云端，永不丢失**
**✅ 后端自动扩缩容，按需计费**
**✅ 无需备案域名**
**✅ 与微信小程序深度集成**

---

## 📞 需要帮助？

如果遇到问题：

1. **查看日志**
   - 在云托管控制台查看服务日志
   - 确认是否有错误信息

2. **查看文档**
   - 阅读详细部署指南：`QUICK_DEPLOY.md`
   - 查看常见问题：`DEPLOY_WECHAT_CLOUD.md`

3. **技术支持**
   - 腾讯云文档：https://cloud.tencent.com/document/product/1243
   - Supabase 文档：https://supabase.com/docs

---

## ✨ 开始部署吧！

按照上面的步骤，你只需要 5 分钟就能完成部署！

祝你部署顺利！🚀

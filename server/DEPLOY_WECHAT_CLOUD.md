# 微信云托管部署指南

## 前置准备

### 1. Supabase 配置信息

请访问 [Supabase 控制台](https://supabase.com/dashboard) 获取以下信息：

- **Project URL**：Settings → API → Project URL
- **anon public key**：Settings → API → anon public key

### 2. 微信小程序信息

- ✅ AppID：`wxa1c57025b508e913`
- ✅ AppSecret：`056dc956b934bf58fc659c4b08bfa16e`

### 3. 微信云托管账号

访问 [腾讯云云托管控制台](https://cloud.tencent.com/product/tcb) 并登录

---

## 部署步骤

### 步骤 1：配置环境变量

在 `cloudbaserc.json` 文件中，替换以下变量的值：

```json
{
  "env": {
    "variables": {
      "COZE_SUPABASE_URL": "https://your-project.supabase.co",        // 替换为你的 Supabase URL
      "COZE_SUPABASE_ANON_KEY": "your-anon-key-here",                  // 替换为你的 Supabase Anon Key
      "WECHAT_APPID": "wxa1c57025b508e913",
      "WECHAT_APPSECRET": "056dc956b934bf58fc659c4b08bfa16e"
    }
  }
}
```

### 步骤 2：创建微信云托管环境

1. 访问 [腾讯云云托管控制台](https://cloud.tencent.com/product/tcb)
2. 点击"新建环境"
3. 选择"按量计费"（适合测试和小规模使用）
4. 选择环境规格（推荐：基础版 0.5核 1GB）
5. 填写环境名称，例如：`skin-analysis-env`
6. 点击"新建"完成创建

### 步骤 3：上传代码

有两种方式上传代码：

#### 方式 A：通过控制台上传（推荐）

1. 进入刚创建的环境
2. 点击"服务" → "新建服务"
3. 选择"从代码包上传"
4. 上传以下文件和文件夹：
   - `server/Dockerfile`
   - `server/cloudbaserc.json`
   - `server/package.json`
   - `server/pnpm-lock.yaml`
   - `server/src/` 文件夹
   - `server/tsconfig.json`
   - `server/nest-cli.json`
   - `server/.dockerignore`

#### 方式 B：通过 CLI 部署

安装腾讯云 CLI：

```bash
npm install -g @cloudbase/cli
```

登录：

```bash
cloudbase login
```

部署：

```bash
cd server
cloudbase functions:deploy
```

### 步骤 4：配置环境变量

在微信云托管控制台中：

1. 进入你的服务
2. 点击"环境变量"
3. 添加以下环境变量：

| 变量名 | 变量值 |
|--------|--------|
| COZE_SUPABASE_URL | 你的 Supabase URL |
| COZE_SUPABASE_ANON_KEY | 你的 Supabase Anon Key |
| WECHAT_APPID | wxa1c57025b508e913 |
| WECHAT_APPSECRET | 056dc956b934bf58fc659c4b08bfa16e |
| NODE_ENV | production |
| PORT | 3000 |

### 步骤 5：启动服务

1. 在服务列表中，找到你的服务
2. 点击"部署"
3. 等待部署完成（通常需要 2-5 分钟）
4. 部署成功后，点击"访问"获取服务地址

服务地址格式类似：
```
https://xxx-service-xxx.tcb.qcloud.la
```

### 步骤 6：配置微信小程序服务器域名

1. 登录 [微信公众平台](https://mp.weixin.qq.com)
2. 进入"开发" → "开发管理" → "开发设置"
3. 找到"服务器域名"
4. 在"request 合法域名"中，添加你的服务地址
5. 保存并等待审核（通常几分钟）

### 步骤 7：更新小程序代码

在小程序前端代码中，配置 `PROJECT_DOMAIN` 环境变量：

```typescript
// src/app.config.ts 或相关配置文件
export default defineAppConfig({
  // ...
})
```

在前端请求时使用：

```typescript
await Network.request({
  url: '/api/skin/analyze',
  method: 'POST'
})
```

微信小程序会自动将 `/api/...` 转发到你配置的服务器地址。

---

## 验证部署

### 1. 测试后端服务

在浏览器或使用 curl 测试：

```bash
curl https://your-service-url/api/skin/history?userId=1
```

应该返回 JSON 格式的历史记录数据。

### 2. 测试小程序

1. 在微信开发者工具中打开小程序
2. 点击"编译"
3. 进行皮肤检测
4. 查看历史记录
5. 查看产品推荐

---

## 常见问题

### Q1: 部署失败，提示端口冲突

**A**: 确保 `cloudbaserc.json` 中配置的端口（3000）与 Dockerfile 中的端口一致。

### Q2: 小程序请求失败，提示不在合法域名列表

**A**:
1. 确保已在微信小程序后台配置服务器域名
2. 等待域名审核通过（通常几分钟）
3. 如果是开发环境，可以勾选"不校验合法域名"进行调试

### Q3: 数据库连接失败

**A**:
1. 检查 Supabase URL 和 Anon Key 是否正确
2. 确保环境变量已正确配置
3. 查看云托管日志，确认具体错误信息

### Q4: 如何查看日志？

**A**:
1. 进入微信云托管控制台
2. 点击"服务" → 你的服务 → "日志"
3. 可以查看实时日志和历史日志

### Q5: 如何扩容？

**A**:
1. 进入服务详情
2. 点击"更多" → "配置"
3. 调整 CPU 和内存配置
4. 调整最小/最大副本数

---

## 成本估算

微信云托管按量计费（参考价格，具体以官方为准）：

| 配置 | CPU | 内存 | 价格（小时） |
|------|-----|------|-------------|
| 基础版 | 0.5核 | 1GB | ¥0.007 |
| 标准版 | 1核 | 2GB | ¥0.014 |
| 高级版 | 2核 | 4GB | ¥0.028 |

每月成本估算（假设运行 24 小时，基础版）：
```
¥0.007 × 24 × 30 = ¥5.04/月
```

**提示**：可以使用自动扩缩容，减少闲置时间，降低成本。

---

## 下一步

部署完成后，你可以：

1. ✅ 用户数据已存储在 Supabase 云数据库
2. ✅ 后端服务运行在微信云托管
3. ✅ 小程序可以正常调用后端 API
4. ✅ 实现完整的皮肤检测功能

需要帮助吗？请提供 Supabase 配置信息，我可以帮你完成剩余配置！

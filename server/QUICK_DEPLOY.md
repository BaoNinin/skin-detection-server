# 微信云托管快速部署指南

## 📋 配置信息确认

### ✅ 已配置

| 配置项 | 值 |
|--------|-----|
| Supabase URL | `https://pacqfzvxkiobtxbjubil.supabase.co` |
| Supabase Anon Key | `eyJ...JdZs4` |
| 微信小程序 AppID | `wxa1c57025b508e913` |
| 微信小程序 AppSecret | `056dc956b934bf58fc659c4b08bfa16e` |

---

## 🚀 部署步骤（5分钟完成）

### 方法一：通过腾讯云控制台部署（推荐）

#### 第一步：访问云托管控制台

1. 访问 [腾讯云云托管控制台](https://console.cloud.tencent.com/tcb)
2. 使用微信扫码登录
3. 选择或创建环境

#### 第二步：新建环境（如果是第一次）

1. 点击"新建环境"
2. 填写环境信息：
   - **环境名称**：`skin-analysis-env`
   - **环境规格**：按量计费（基础版 0.5核 1GB）
   - **付费方式**：按量付费
3. 点击"新建"并等待创建完成（约 1-2 分钟）

#### 第三步：新建服务

1. 进入刚创建的环境
2. 点击左侧菜单"服务"
3. 点击"新建服务"
4. 填写服务信息：
   - **服务名称**：`skin-analysis-api`
   - **服务类型**：Web 服务
5. 选择"从代码包上传"

#### 第四步：上传代码包

需要上传以下文件和文件夹（压缩为 zip 格式）：

```
server/
├── Dockerfile                    # ✅ 必需
├── cloudbaserc.json             # ✅ 必需
├── package.json                 # ✅ 必需
├── pnpm-lock.yaml               # ✅ 必需
├── tsconfig.json                # ✅ 必需
├── nest-cli.json                # ✅ 必需
├── src/                         # ✅ 必需（整个文件夹）
│   ├── main.ts
│   ├── app.module.ts
│   ├── skin/
│   ├── user/
│   └── ...
└── .dockerignore                # ✅ 必需
```

**打包步骤**：

1. 在本地进入 `server` 目录
2. 运行以下命令打包：

```bash
cd server
zip -r skin-analysis-api.zip \
  Dockerfile \
  cloudbaserc.json \
  package.json \
  pnpm-lock.yaml \
  tsconfig.json \
  nest-cli.json \
  src/ \
  .dockerignore
```

3. 上传 `skin-analysis-api.zip` 文件

#### 第五步：配置环境变量

在云托管控制台中：

1. 进入服务详情
2. 点击"环境变量"标签页
3. 点击"添加环境变量"
4. 逐个添加以下变量：

| 变量名 | 变量值 |
|--------|--------|
| `COZE_SUPABASE_URL` | `https://pacqfzvxkiobtxbjubil.supabase.co` |
| `COZE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhY3FmenZ4a2lvYnR4Ymp1YmlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODM1ODYsImV4cCI6MjA4ODk1OTU4Nn0.CZoSjahWflEy3vhj_Ya9ddYhie9BtmvRxhNaN8JdZs4` |
| `WECHAT_APPID` | `wxa1c57025b508e913` |
| `WECHAT_APPSECRET` | `056dc956b934bf58fc659c4b08bfa16e` |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |

5. 点击"保存"

#### 第六步：部署服务

1. 回到"基本信息"标签页
2. 点击"部署"按钮
3. 等待部署完成（约 2-5 分钟）
4. 部署状态变为"运行中"即表示成功

#### 第七步：获取服务地址

1. 在服务详情页面
2. 找到"访问地址"
3. 复制服务地址，格式类似：
   ```
   https://skin-analysis-api-xxxx.service.tcloudbase.com
   ```

#### 第八步：配置微信小程序服务器域名

1. 访问 [微信公众平台](https://mp.weixin.qq.com)
2. 登录小程序后台
3. 进入"开发" → "开发管理" → "开发设置"
4. 找到"服务器域名"
5. 在"request 合法域名"中，添加你的服务地址：
   ```
   https://skin-analysis-api-xxxx.service.tcloudbase.com
   ```
6. 点击"保存"
7. 等待审核通过（通常几分钟）

#### 第九步：测试服务

在浏览器或使用 curl 测试：

```bash
curl https://your-service-url/api/skin/history?userId=1
```

如果返回 JSON 数据，说明部署成功！

---

### 方法二：通过 CLI 部署（适合开发者）

#### 第一步：安装 CLI

```bash
npm install -g @cloudbase/cli
```

#### 第二步：登录

```bash
cloudbase login
```

#### 第三步：初始化项目

```bash
cd server
cloudbase init
```

#### 第四步：部署

```bash
cloudbase deploy
```

---

## 📱 小程序端配置

在小程序代码中，无需修改代码，只需确保使用相对路径调用 API：

```typescript
import { Network } from '@/network'

// 使用相对路径，微信小程序会自动转发到配置的服务器域名
await Network.request({
  url: '/api/skin/analyze',
  method: 'POST'
})
```

---

## ✅ 验证部署

### 1. 检查后端服务

访问服务地址的健康检查接口（如果有）或测试接口：

```bash
curl https://your-service-url/api/skin/history?userId=1
```

### 2. 测试小程序功能

在微信开发者工具中：

1. 打开小程序
2. 点击"编译"
3. 进行皮肤检测
4. 查看历史记录
5. 查看产品推荐

### 3. 查看日志

在云托管控制台中：

1. 进入服务详情
2. 点击"日志"标签页
3. 查看实时日志，确认服务正常运行

---

## 💰 成本估算

微信云托管按量计费（参考价格）：

| 项目 | 价格 |
|------|------|
| CPU (0.5核) | ¥0.007/小时 |
| 内存 (1GB) | ¥0.007/小时 |
| 流量 | ¥0.8/GB |

**每月成本估算（24小时运行）**：
```
CPU: 0.007 × 24 × 30 = ¥5.04
内存: 0.007 × 24 × 30 = ¥5.04
流量: 约 ¥5-20（取决于用户访问量）
总计: 约 ¥15-30/月
```

**节省成本的技巧**：
- 设置最小副本数为 0（无请求时不收费）
- 使用自动扩缩容
- 监控流量使用情况

---

## 🔧 常见问题

### Q1: 部署失败，提示 "Docker build failed"

**A**:
1. 检查 Dockerfile 是否存在
2. 检查 package.json 和 pnpm-lock.yaml 是否正确
3. 查看详细日志，确认具体错误

### Q2: 服务启动失败，提示端口占用

**A**:
1. 确保环境变量 `PORT` 设置为 `3000`
2. 检查 Dockerfile 中的 `EXPOSE` 端口是否为 `3000`

### Q3: 小程序请求失败，提示不在合法域名列表

**A**:
1. 确认已在微信小程序后台配置服务器域名
2. 等待域名审核通过
3. 如果是开发环境，可以在开发者工具中勾选"不校验合法域名"

### Q4: 数据库连接失败

**A**:
1. 检查 Supabase URL 和 Anon Key 是否正确
2. 确认环境变量已正确配置
3. 查看云托管日志，确认具体错误信息

### Q5: 如何更新服务？

**A**:
1. 修改代码
2. 重新打包
3. 上传新版本
4. 点击"部署"即可

---

## 📞 技术支持

如果遇到问题：

1. 查看云托管日志
2. 查看详细部署指南：`DEPLOY_WECHAT_CLOUD.md`
3. 访问 [腾讯云文档](https://cloud.tencent.com/document/product/1243)

---

## 🎉 部署完成后的架构

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

## 🚀 下一步

部署完成后，你可以：

1. ✅ 开始推广小程序
2. ✅ 监控用户使用情况
3. ✅ 根据需求优化功能
4. ✅ 扩容服务以支持更多用户

需要帮助？随时联系！

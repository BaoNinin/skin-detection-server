# 📝 微信云开发详细配置指南

本文档将手把手教你如何配置每个环境变量和配置项。

---

## 🎯 配置概览

需要配置的文件和位置：

| 文件路径 | 配置内容 | 配置方式 |
|---------|---------|---------|
| `server/.env.production` | 云开发环境 ID、API Key | 编辑文件 |
| 微信云开发控制台 | 数据库集合、权限设置 | 网页操作 |
| 微信云开发控制台 | 云存储权限 | 网页操作 |
| 微信云开发控制台 | 云托管环境变量 | 网页操作 |
| 微信公众平台 | 小程序服务器域名 | 网页操作 |

---

## Step 1️⃣：配置 `server/.env.production` 文件

### 📍 文件位置
```
/workspace/projects/server/.env.production
```

### 🔧 如何打开文件

**方式一：使用命令行**
```bash
cd /workspace/projects/server
nano .env.production
# 或者
vim .env.production
```

**方式二：使用文本编辑器**
1. 打开你的代码编辑器（如 VSCode）
2. 打开项目文件夹：`/workspace/projects`
3. 找到 `server` 文件夹
4. 打开 `.env.production` 文件

### 📝 配置内容详解

打开文件后，你会看到以下内容：

```bash
# 豆包视觉模型配置
COZE_API_KEY=8f38a8d0-b6d4-481c-8e15-b93bb30c7444
COZE_MODEL=doubao-vision

# 微信云开发环境配置
CLOUDBASE_ENV_ID=your-env-id-here

# 其他配置
NODE_ENV=production
PORT=3000

# Supabase 配置（已弃用，使用云数据库替代）
# SUPABASE_URL=
# SUPabase_ANON_KEY=
```

### ✏️ 修改步骤

#### 1. 获取云开发环境 ID

**步骤**：
1. 打开浏览器，访问：https://console.cloud.tencent.com/tcb
2. 登录你的微信账号
3. 找到你的环境（如果没有，点击"新建环境"创建一个）
4. 点击环境名称进入详情页
5. 在页面顶部可以看到"环境ID"，格式如：`skin-analysis-prod-8j7k9l`
6. 复制这个 ID

#### 2. 修改配置文件

将以下内容中的 `your-env-id-here` 替换为你的实际环境 ID：

```bash
# 微信云开发环境配置
CLOUDBASE_ENV_ID=skin-analysis-prod-8j7k9l  # 👈 改成你的环境 ID
```

**完整示例**（修改后）：
```bash
# 豆包视觉模型配置
COZE_API_KEY=8f38a8d0-b6d4-481c-8e15-b93bb30c7444
COZE_MODEL=doubao-vision

# 微信云开发环境配置
CLOUDBASE_ENV_ID=skin-analysis-prod-8j7k9l

# 其他配置
NODE_ENV=production
PORT=3000

# Supabase 配置（已弃用，使用云数据库替代）
# SUPABASE_URL=
# SUPabase_ANON_KEY=
```

#### 3. 保存文件

- **VSCode**：按 `Ctrl + S`（Windows）或 `Cmd + S`（Mac）
- **Nano**：按 `Ctrl + O`，按回车，然后按 `Ctrl + X`
- **Vim**：按 `Esc`，输入 `:wq`，按回车

### 📋 配置项说明

| 配置项 | 说明 | 是否必须修改 | 示例值 |
|-------|------|------------|--------|
| `COZE_API_KEY` | 豆包视觉模型的 API Key | ❌ 已配置好 | `pat_xxxxx` |
| `COZE_MODEL` | 豆包模型名称 | ❌ 已配置好 | `doubao-vision` |
| `CLOUDBASE_ENV_ID` | 微信云开发环境 ID | ✅ **必须修改** | `skin-analysis-prod-8j7k9l` |
| `NODE_ENV` | 运行环境 | ❌ 无需修改 | `production` |
| `PORT` | 服务端口 | ❌ 无需修改 | `3000` |

---

## Step 2️⃣：配置云数据库

### 📍 操作位置
微信云开发控制台：https://console.cloud.tencent.com/tcb

### 🔧 配置步骤

#### 2.1 创建数据库集合

**步骤**：

1. **登录云开发控制台**
   - 打开：https://console.cloud.tencent.com/tcb
   - 登录微信账号

2. **选择环境**
   - 在左侧找到你的环境
   - 点击环境名称进入

3. **进入数据库**
   - 在左侧菜单找到"数据库"
   - 点击进入

4. **创建集合**
   - 点击页面右上角的"添加集合"按钮
   - 输入集合名称：`skin_history`
   - 点击"确定"

5. **重复步骤**
   - 再次点击"添加集合"
   - 输入集合名称：`users`
   - 点击"确定"

#### 2.2 配置数据库权限

**步骤**：

1. **找到权限设置**
   - 在数据库页面，找到刚创建的集合 `skin_history`
   - 点击集合名称右侧的"权限"图标（🔐）

2. **设置权限规则**
   - 选择"自定义规则"
   - 在文本框中输入以下内容：

```json
{
  "read": "doc.userId == auth.openid",
  "write": "doc.userId == auth.openid"
}
```

   - **说明**：
     - `doc.userId == auth.openid`：用户只能读写自己的记录
     - 如果需要更宽松的权限，可以使用：
     ```json
     {
       "read": true,
       "write": true
     }
     ```

3. **保存权限**
   - 点击"保存"按钮

4. **配置 users 集合**
   - 找到 `users` 集合
   - 点击"权限"图标
   - 输入以下内容：

```json
{
  "read": "doc._openid == auth.openid",
  "write": "doc._openid == auth.openid"
}
```

   - 点击"保存"

### 📋 数据库集合说明

| 集合名称 | 用途 | 字段说明 |
|---------|------|---------|
| `skin_history` | 存储皮肤检测历史记录 | `userId`, `skinType`, `concerns`, `moisture`, `oiliness`, `sensitivity`, `recommendations`, `imageUrl`, `createdAt` |
| `users` | 存储用户信息 | `_openid`, `detectionCount`, `createdAt` |

---

## Step 3️⃣：配置云存储权限

### 📍 操作位置
微信云开发控制台：https://console.cloud.tencent.com/tcb

### 🔧 配置步骤

1. **进入云存储**
   - 登录云开发控制台
   - 选择你的环境
   - 在左侧菜单找到"云存储"
   - 点击进入

2. **打开权限设置**
   - 点击页面右上角的"权限设置"按钮

3. **设置权限规则**
   - 选择"自定义规则"
   - 输入以下内容：

```json
{
  "read": true,
  "write": true
}
```

   **或者更严格的规则（推荐）**：
   ```json
   {
     "read": "auth.openid != null",
     "write": "auth.openid != null"
   }
   ```

4. **保存权限**
   - 点击"保存"按钮

### 📋 权限说明

| 规则 | 说明 |
|------|------|
| `read: true, write: true` | 任何人都可以读写（开发测试用） |
| `read: auth.openid != null` | 只有登录用户可以读取 |
| `write: auth.openid != null` | 只有登录用户可以写入 |

---

## Step 4️⃣：配置云托管环境变量

### 📍 操作位置
微信云开发控制台：https://console.cloud.tencent.com/tcb

### 🔧 配置步骤

1. **进入云托管**
   - 登录云开发控制台
   - 选择你的环境
   - 在左侧菜单找到"云托管"
   - 点击进入

2. **创建服务**
   - 点击"新建服务"按钮
   - 填写服务信息：
     ```
     服务名称：nestjs-server
     服务描述：智能皮肤检测后端
     ```

3. **配置基本信息**
   - 容器端口：`3000`
   - CPU：`0.5`
   - 内存：`1.0GB`
   - 最小实例数：`0`
   - 最大实例数：`10`

4. **配置环境变量**
   - 在"环境变量"部分，点击"添加变量"
   - 逐个添加以下变量：

   | 变量名 | 变量值 | 说明 |
   |-------|--------|------|
   | `COZE_API_KEY` | `8f38a8d0-b6d4-481c-8e15-b93bb30c7444` | 豆包 API Key |
   | `COZE_MODEL` | `doubao-vision` | 豆包模型名称 |
   | `CLOUDBASE_ENV_ID` | `skin-analysis-prod-8j7k9l` | 云开发环境 ID（替换成你的） |
   | `NODE_ENV` | `production` | 运行环境 |
   | `PORT` | `3000` | 服务端口 |

5. **保存配置**
   - 点击"保存"按钮

---

## Step 5️⃣：配置小程序服务器域名

### 📍 操作位置
微信公众平台：https://mp.weixin.qq.com/

### 🔧 配置步骤

1. **登录微信公众平台**
   - 打开：https://mp.weixin.qq.com/
   - 扫码登录

2. **进入开发设置**
   - 在左侧菜单找到"开发"
   - 点击"开发管理"
   - 点击"开发设置"

3. **找到服务器域名**
   - 向下滚动，找到"服务器域名"部分

4. **配置 request 合法域名**
   - 在"request 合法域名"输入框中，输入：
     ```
     https://your-service-id.tcb.qcloud.la
     ```
   - 替换 `your-service-id` 为你的云托管服务 ID

5. **配置 uploadFile 合法域名**
   - 在"uploadFile 合法域名"输入框中，输入：
     ```
     https://your-service-id.tcb.qcloud.la
     ```

6. **配置 downloadFile 合法域名**
   - 在"downloadFile 合法域名"输入框中，输入：
     ```
     https://your-service-id.tcb.qcloud.la
     ```

7. **保存配置**
   - 点击"保存"按钮

### ⚠️ 注意事项

- 域名必须使用 HTTPS
- 域名必须已备案（云托管自动提供已备案域名）
- 配置后需要等待 5-10 分钟生效

---

## Step 6️⃣：修改小程序 API 地址

### 📍 文件位置
`src/network/index.ts` 或 `src/config/index.ts`

### 🔧 如何找到文件

**方式一：使用命令行**
```bash
find /workspace/projects/src -name "*.ts" -type f | grep -E "(network|config)"
```

**方式二：手动查找**
1. 打开项目文件夹：`/workspace/projects`
2. 打开 `src` 文件夹
3. 查找 `network` 或 `config` 文件夹
4. 打开 `index.ts` 文件

### 📝 配置内容

找到类似以下内容的代码：

```typescript
// 旧的配置（本地开发）
const PROJECT_DOMAIN = 'http://localhost:3000';

// 或者
const API_BASE_URL = 'http://localhost:3000';
```

修改为：

```typescript
// 新的配置（云托管）
const PROJECT_DOMAIN = 'https://your-service-id.tcb.qcloud.la';

// 或者
const API_BASE_URL = 'https://your-service-id.tcb.qcloud.la';
```

**替换 `your-service-id` 为你的云托管服务 ID**。

---

## 📋 配置检查清单

完成所有配置后，使用以下清单检查：

### ✅ 文件配置
- [ ] `server/.env.production` 中的 `CLOUDBASE_ENV_ID` 已修改
- [ ] 小程序 API 地址已修改为云托管地址

### ✅ 云开发控制台配置
- [ ] 已创建 `skin_history` 数据库集合
- [ ] 已创建 `users` 数据库集合
- [ ] 数据库权限已配置
- [ ] 云存储权限已配置
- [ ] 云托管服务已创建
- [ ] 云托管环境变量已配置

### ✅ 微信公众平台配置
- [ ] request 合法域名已配置
- [ ] uploadFile 合法域名已配置
- [ ] downloadFile 合法域名已配置

---

## 🚀 配置完成后的下一步

1. **部署到云托管**
   - 参考主文档 `CLOUD_BASE_DEPLOYMENT_GUIDE.md`

2. **测试服务**
   - 访问云托管服务地址
   - 测试 API 是否正常

3. **测试小程序**
   - 在小程序中进行皮肤检测
   - 确认数据保存到云数据库
   - 确认图片上传到云存储

---

## ❓ 常见问题

### Q1：找不到 `server/.env.production` 文件怎么办？
**A**：文件已经创建在 `/workspace/projects/server/.env.production`，如果没有：
```bash
cd /workspace/projects/server
cat .env.production
```

### Q2：云开发环境 ID 在哪里找？
**A**：
1. 登录云开发控制台
2. 点击环境名称
3. 在页面顶部可以看到"环境ID"
4. 格式如：`skin-analysis-prod-8j7k9l`

### Q3：如何获取云托管服务 ID？
**A**：
1. 部署云托管服务后
2. 在云托管控制台找到你的服务
3. 点击服务名称
4. 在"访问地址"中可以看到，格式如：`https://xxx.tcb.qcloud.la`

### Q4：小程序配置域名后还是报错怎么办？
**A**：
1. 确认域名配置正确（使用 HTTPS）
2. 等待 5-10 分钟让配置生效
3. 清除小程序缓存
4. 重新编译小程序

---

**如果还有任何配置问题，随时告诉我！** 🎯

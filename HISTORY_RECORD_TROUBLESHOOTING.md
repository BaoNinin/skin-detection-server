# 历史记录无法显示 - 完整排查指南

## 🔍 问题症状

用户已登录，但历史记录页面无法显示数据

---

## 🛠️ 排查步骤（按顺序执行）

### 步骤 1：检查登录状态 ✅（最关键）

#### 操作方法

在微信开发者工具中：

1. 打开"调试器"（点击右上角"调试器"按钮）
2. 点击"Console"标签
3. 在 Console 中输入以下命令并回车：

```javascript
Taro.getStorageSync('userId')
```

#### 判断结果

**情况 A：返回数字（如 `1`、`123` 等）**
- ✅ 登录状态正常
- 继续执行步骤 2

**情况 B：返回 `undefined` 或 `null`**
- ❌ 登录状态丢失
- **解决方案**：
  1. 进入"我的"页面
  2. 点击"登录"按钮
  3. 授权登录
  4. 重新查看历史记录

---

### 步骤 2：检查网络请求

#### 操作方法

1. 在微信开发者工具中，点击"调试器"
2. 点击"Network"标签
3. 点击底部"历史"Tab，进入历史记录页面
4. 在 Network 列表中找到 `/api/skin/history` 请求

#### 查看请求详情

点击该请求，查看以下信息：

**2.1 检查请求是否发出**

**情况 A：有请求记录**
- ✅ 请求已发出
- 继续检查响应

**情况 B：没有请求记录**
- ❌ 请求未发出
- **可能原因**：
  - userId 不存在（步骤 1 已检查）
  - 前端代码问题
  - 网络配置问题

**2.2 检查请求状态码**

**情况 A：状态码 200**
- ✅ 请求成功
- 继续检查响应数据

**情况 B：状态码 401**
- ❌ 未登录或登录过期
- **解决方案**：
  1. 重新登录
  2. 检查后端登录逻辑

**情况 C：状态码 500**
- ❌ 服务器错误
- **解决方案**：
  1. 查看后端日志
  2. 检查数据库连接

**情况 D：其他状态码（404、400 等）**
- ❌ 请求错误
- **解决方案**：
  1. 检查 URL 是否正确
  2. 检查请求参数

**2.3 检查响应数据**

点击请求的"Response"标签，查看响应内容。

**情况 A：返回正确数据**
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": [
    {
      "id": 1,
      "skin_type": "干性肌肤",
      "concerns": ["缺水", "暗沉"],
      "moisture": 45,
      "oiliness": 30,
      "sensitivity": 20,
      "created_at": "2026-03-15T10:00:00.000Z"
    }
  ]
}
```
- ✅ 数据正常
- 问题在前端渲染
- 继续步骤 3

**情况 B：返回空数据**
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": []
}
```
- ✅ 接口正常，但数据库没有数据
- **解决方案**：
  1. 进行一次皮肤检测
  2. 检测完成后会自动保存历史记录

**情况 C：返回错误**
```json
{
  "code": 500,
  "msg": "查询失败",
  "data": null
}
```
- ❌ 后端错误
- **解决方案**：
  1. 查看后端日志
  2. 检查数据库配置

---

### 步骤 3：检查数据库

#### 操作方法

1. 登录 [微信云开发控制台](https://console.cloud.tencent.com/tcb/env)
2. 选择环境：`prod-8g240dlc83819a5b`
3. 进入"数据库"
4. 查找 `skin_analysis_history` 表

#### 检查数据

**情况 A：表存在，有数据**
- ✅ 数据库正常
- 问题在前端或接口

**情况 B：表存在，但数据为空**
- ✅ 表结构正常，但没有历史记录
- **解决方案**：
  1. 进行一次皮肤检测
  2. 检测完成后会自动保存历史记录

**情况 C：表不存在**
- ❌ 数据库表未创建
- **解决方案**：
  ```sql
  -- 创建表
  CREATE TABLE skin_analysis_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    image_url TEXT,
    skin_type TEXT NOT NULL,
    concerns TEXT[],
    moisture INTEGER NOT NULL,
    oiliness INTEGER NOT NULL,
    sensitivity INTEGER NOT NULL,
    acne INTEGER,
    wrinkles INTEGER,
    spots INTEGER,
    pores INTEGER,
    blackheads INTEGER,
    recommendations TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```

**情况 D：表存在，但没有 `user_id` 字段**
- ❌ 表结构不正确
- **解决方案**：
  ```sql
  -- 添加 user_id 字段
  ALTER TABLE skin_analysis_history ADD COLUMN user_id INTEGER;
  ```

---

### 步骤 4：测试后端接口

#### 操作方法

在浏览器或 Postman 中测试接口。

**使用本地开发环境**：
```bash
# 替换 userId 为实际的用户 ID
curl -X GET "http://localhost:3000/api/skin/history?userId=1"
```

**使用云托管环境**：
```bash
# 替换 userId 为实际的用户 ID
curl -X GET "https://<云托管服务地址>/api/skin/history?userId=1"
```

#### 查看响应

**情况 A：返回数据**
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": [...]
}
```
- ✅ 后端接口正常
- 问题在前端

**情况 B：返回 401**
- ❌ 未登录
- **解决方案**：
  1. 检查后端登录逻辑
  2. 确认 userId 是否正确

**情况 C：返回 500**
- ❌ 服务器错误
- **解决方案**：
  1. 查看后端日志
  2. 检查数据库连接

**情况 D：返回 404**
- ❌ 接口不存在
- **解决方案**：
  1. 检查路由配置
  2. 确认 URL 是否正确

---

### 步骤 5：检查网络配置

#### 操作方法

**开发环境（coze dev）**：

1. 检查 `.env.local` 文件：
```bash
cat .env.local
```

**应该看到**：
```bash
PROJECT_DOMAIN=http://localhost:3000
# 或
PROJECT_DOMAIN=https://xxx.tcb.qcloud.la
```

**配置不正确？**：
```bash
# 修改 .env.local
PROJECT_DOMAIN=http://localhost:3000

# 重启开发环境
pnpm kill:all
coze dev
```

**云托管环境**：

1. 检查小程序域名白名单
2. 确认服务地址配置正确
3. 重新编译小程序

---

### 步骤 6：查看控制台日志

#### 操作方法

在微信开发者工具中：

1. 打开"调试器"
2. 点击"Console"标签
3. 刷新历史记录页面
4. 查看日志输出

#### 查找关键日志

**日志 1：用户未登录**
```
用户未登录，跳转到登录页面
```
- ❌ userId 不存在
- **解决方案**：重新登录

**日志 2：加载失败**
```
加载历史记录失败: [错误信息]
```
- ❌ 网络请求失败
- **解决方案**：检查网络配置

**日志 3：接口返回错误**
```
[code]: [msg]: [data]
```
- ❌ 后端错误
- **解决方案**：检查后端日志

---

## 💡 常见问题和解决方案

### 问题 1：登录后 userId 没有保存

**症状**：
- 登录成功，但 `Taro.getStorageSync('userId')` 返回 `undefined`

**解决方案**：

检查登录代码（`src/pages/profile/index.tsx`）：

```typescript
// 登录成功后
if (res.data.code === 200) {
  const userData = res.data.data
  Taro.setStorageSync('userId', userData.id)  // ← 检查这一行
  Taro.setStorageSync('userInfo', userData)
  setUserInfo(userData)
}
```

**如果这一行缺失或有问题**：
```typescript
// 添加或修复
Taro.setStorageSync('userId', userData.id)
```

---

### 问题 2：数据库没有数据

**症状**：
- 接口返回 200，但 `data` 为空数组

**解决方案**：

1. 进行一次完整的皮肤检测流程
2. 确保检测结果保存到数据库
3. 检查后端保存历史记录的代码

---

### 问题 3：接口返回 401

**症状**：
- 已登录，但接口返回 401

**解决方案**：

检查后端代码（`server/src/skin/history.service.ts`）：

```typescript
async getHistory(userId: number) {
  // 检查 userId 是否有效
  if (!userId) {
    throw new UnauthorizedException('未登录')
  }

  // 查询数据库
  const result = await this.database
    .select()
    .from(skinAnalysisHistory)
    .where(eq(skinAnalysisHistory.userId, userId))

  return result
}
```

---

### 问题 4：网络请求失败

**症状**：
- Console 显示"加载失败"
- Network 显示请求失败

**解决方案**：

1. 检查网络配置（`.env.local`）
2. 检查小程序域名白名单
3. 检查后端服务是否运行

---

## 🎯 快速诊断流程

### 诊断清单

按照以下顺序检查：

- [ ] 步骤 1：检查登录状态（userId 是否存在）
- [ ] 步骤 2：检查网络请求（请求是否发出、状态码、响应数据）
- [ ] 步骤 3：检查数据库（表是否存在、是否有数据）
- [ ] 步骤 4：测试后端接口（接口是否正常）
- [ ] 步骤 5：检查网络配置（PROJECT_DOMAIN 是否正确）
- [ ] 步骤 6：查看控制台日志（是否有错误信息）

---

## 📝 请告诉我

完成上述排查后，请告诉我：

1. **userId 的值是什么？**
   ```javascript
   Taro.getStorageSync('userId')
   ```

2. **Network 中 `/api/skin/history` 请求的状态码是多少？**

3. **Network 中 `/api/skin/history` 请求的响应数据是什么？**

4. **数据库中 `skin_analysis_history` 表有多少条数据？**

5. **Console 中是否有错误信息？**

根据您的回答，我可以提供更具体的解决方案！

# 微信小程序手机号快速登录功能说明

## 📱 功能概述

本功能实现了微信小程序获取用户手机号进行快速登录的功能，用户可以通过授权手机号快速完成登录和注册。

## 🔧 技术实现

### 1. 数据库修改

#### Schema 变更
```sql
-- 添加 phone_number 字段
ALTER TABLE users ADD COLUMN phone_number TEXT UNIQUE;

-- 修改 openid 字段为可选
ALTER TABLE users ALTER COLUMN openid DROP NOT NULL;
```

#### 新增字段说明
- `phone_number`: 用户手机号（唯一），用于手机号登录
- `openid`: 改为可选字段，支持 openid 登录和手机号登录两种方式

### 2. 后端实现

#### 新增 API 接口
- `POST /api/user/login/phone`: 手机号登录接口

#### 请求参数
```typescript
{
  code: string;           // 微信登录 code
  encryptedData: string;  // 加密的手机号数据
  iv: string;            // 加密算法的初始向量
}
```

#### 响应示例
```typescript
{
  code: 200,
  msg: "登录成功",
  data: {
    id: 1,
    openid: null,
    phoneNumber: "138****8888",
    nickname: "用户8888",
    avatarUrl: null,
    detectionCount: 0,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z"
  }
}
```

#### 服务逻辑
1. 接收前端传来的 code、encryptedData 和 iv
2. 使用 code 调用微信 API 获取 session_key
3. 使用 session_key 解密加密的手机号数据
4. 根据手机号查询用户是否已存在
5. 如果存在，更新用户信息；如果不存在，创建新用户
6. 返回用户信息

### 3. 前端实现

#### 新增组件
```tsx
<Button
  openType="getPhoneNumber"
  onGetPhoneNumber={handleGetPhoneNumber}
  className="bg-rose-400 text-white rounded-xl w-full"
>
  📱 手机号快速登录
</Button>
```

#### 处理函数
```typescript
const handleGetPhoneNumber = async (e: any) => {
  // 1. 检查用户是否授权
  if (e.detail.errMsg !== 'getPhoneNumber:ok') {
    // 处理拒绝授权情况
    return
  }

  // 2. 获取微信登录 code
  const loginRes = await Taro.login()

  // 3. 发送请求到后端
  const res = await Network.request({
    url: '/api/user/login/phone',
    method: 'POST',
    data: {
      code: loginRes.code,
      encryptedData: e.detail.encryptedData,
      iv: e.detail.iv
    }
  })

  // 4. 保存用户信息
  if (res.data.code === 200) {
    Taro.setStorageSync('userId', res.data.data.id)
    Taro.setStorageSync('userInfo', res.data.data)
  }
}
```

## 📋 部署步骤

### 1. 执行数据库迁移

在 Supabase SQL 编辑器中执行以下 SQL：

```sql
-- 迁移文件：server/migrations/add_phone_number_to_users.sql

-- 1. 添加 phone_number 字段
ALTER TABLE users ADD COLUMN phone_number TEXT UNIQUE;

-- 2. 修改 openid 字段为非必需
ALTER TABLE users ALTER COLUMN openid DROP NOT NULL;

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);
```

### 2. 配置微信小程序

#### 小程序后台配置
1. 登录微信小程序后台
2. 进入「开发」→「开发管理」→「接口设置」
3. 开启「获取手机号」权限

#### app.json 配置
确保在 `app.json` 中声明必要的权限：

```json
{
  "permission": {
    "scope.userLocation": {
      "desc": "您的位置信息将用于提供更好的服务"
    }
  }
}
```

### 3. 环境变量配置

在 `.env` 文件中添加微信小程序配置：

```env
# 微信小程序 AppID（需要在微信小程序后台获取）
WECHAT_APP_ID=your_wechat_app_id

# 微信小程序 AppSecret（需要在微信小程序后台获取）
WECHAT_APP_SECRET=your_wechat_app_secret
```

### 4. 重新部署

```bash
# 1. 安装依赖
cd server && pnpm install

# 2. 构建后端
cd server && pnpm build

# 3. 构建前端
cd .. && pnpm build:weapp

# 4. 上传代码到微信小程序开发者工具
# 5. 提交审核
```

## 🎯 使用流程

### 用户操作流程

1. 用户进入「我的」页面
2. 点击「📱 手机号快速登录」按钮
3. 微信弹出授权窗口
4. 用户点击「允许」
5. 系统自动获取手机号并完成登录
6. 进入已登录状态

### 首次登录
- 用户首次授权手机号后，系统自动创建新账号
- 昵称默认为「用户XXXX」（手机号后四位）
- 用户可以进入「完善信息」页面修改昵称和头像

### 已登录用户
- 如果手机号已注册，直接登录
- 如果未注册，自动创建新账号

## ⚠️ 注意事项

### 1. 微信 API 调用

**重要**：当前代码中的 `loginWithPhoneNumber` 方法有一个 TODO 注释，需要实现真实的微信 API 调用：

```typescript
// TODO: 调用微信接口，使用 code 换取 session_key
// 实际需要调用微信 API 获取 session_key
// 暂时使用 code 作为 session_key（测试环境）
const sessionKey = code
```

**实际实现需要**：
1. 配置微信小程序 AppID 和 AppSecret
2. 调用微信 API：`https://api.weixin.qq.com/sns/jscode2session`
3. 获取 session_key
4. 使用 session_key 解密手机号

### 2. 手机号解密

使用 `miniprogram-sm-crypto` 库进行解密：

```typescript
import * as crypto from 'miniprogram-sm-crypto'

const decrypted = crypto.decrypt(encryptedData, sessionKey, iv, 'aes-256-cbc')
const phoneInfo = JSON.parse(decrypted)
const phoneNumber = phoneInfo.phoneNumber
```

### 3. 跨端兼容性

- 手机号登录功能仅支持微信小程序
- H5 端会显示提示：「手机号登录仅在小程序中可用」
- 前端代码已做平台检测：

```typescript
const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP

if (!isWeapp) {
  Taro.showToast({
    title: '手机号登录仅在小程序中可用',
    icon: 'none'
  })
  return
}
```

### 4. 数据隐私

- 手机号数据仅在用户授权后获取
- 加密传输和解密处理
- 手机号存储在数据库中，不暴露给前端

### 5. 错误处理

#### 常见错误
1. `getPhoneNumber:fail user deny`: 用户拒绝授权
   - 提示：「您取消了授权」

2. `getPhoneNumber:fail`: 获取失败
   - 提示：「获取手机号失败，请重试」

3. 解密失败
   - 记录错误日志
   - 提示：「登录失败，请重试」

## 🔄 兼容性说明

### 登录方式对比

| 登录方式 | 实现方式 | 数据来源 | 适用场景 |
|---------|---------|---------|---------|
| **微信登录** | openid | 微信授权 | 传统登录方式 |
| **手机号登录** | phone_number | 手机号授权 | 快速登录，更精准 |

### 数据库兼容性

- 现有用户不受影响
- openid 字段改为可选，支持两种登录方式
- phone_number 字段添加后，新用户可以使用手机号登录

## 📊 测试建议

### 1. 功能测试
- [ ] 首次手机号登录（新用户）
- [ ] 再次手机号登录（已注册用户）
- [ ] 拒绝授权处理
- [ ] 网络异常处理
- [ ] 跨端兼容性测试

### 2. 界面测试
- [ ] 登录按钮样式
- [ ] 授权弹窗显示
- [ ] 登录成功提示
- [ ] 错误提示文案
- [ ] 用户信息展示（手机号显示）

### 3. 性能测试
- [ ] 登录响应时间
- [ ] 数据库查询性能
- [ ] 并发登录测试

## 📚 参考资料

- [微信小程序获取手机号文档](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/getPhoneNumber.html)
- [miniprogram-sm-crypto 文档](https://github.com/wechat-miniprogram/miniprogram-sm-crypto)
- [Taro 框架文档](https://taro.jd.com/)

## 🆘 常见问题

### Q1: 为什么手机号登录失败？
A: 检查以下几点：
1. 微信小程序后台是否开启「获取手机号」权限
2. code 是否有效（code 有效期为 5 分钟）
3. session_key 是否正确获取
4. 加密解密参数是否正确

### Q2: 如何在本地测试手机号登录？
A: 手机号登录功能仅支持真实微信小程序环境，无法在开发工具中完全测试。建议：
1. 使用真机调试
2. 在微信开发者工具中点击「预览」
3. 使用微信扫码在真机上测试

### Q3: 如何获取用户的真实手机号？
A: 需要完成以下步骤：
1. 配置微信小程序 AppID 和 AppSecret
2. 实现微信 API 调用获取 session_key
3. 使用 session_key 解密加密的手机号数据

当前代码中的 session_key 获取逻辑需要根据实际配置完善。

## 📝 更新日志

### 2025-01-15
- ✅ 添加数据库 phone_number 字段
- ✅ 实现后端手机号登录接口
- ✅ 实现前端手机号授权组件
- ✅ 更新用户信息展示（显示手机号）
- ✅ 添加跨端兼容性处理
- ⚠️ 待完成：实现真实的微信 API 调用（session_key 获取）

---

如有问题，请联系开发团队。

# 微信小程序 URL Scheme 使用指南

## 📱 什么是 URL Scheme？

URL Scheme 是一种从外部（短信、邮件、其他 App、H5 页面）拉起小程序的方式。

**格式示例**：
```
weixin://dl/business/?t=TICKET
```

---

## 🎯 使用场景

1. **短信营销**：发送短信，用户点击链接直接打开小程序
2. **邮件推广**：邮件中嵌入小程序链接
3. **H5 页面跳转**：从网页跳转到小程序
4. **其他 App 跳转**：从其他应用拉起小程序
5. **二维码**：生成二维码，扫码打开小程序

---

## 📋 配置步骤

### 步骤 1：配置环境变量

在 `server/.env.local` 中添加：

```bash
# 微信小程序配置
WECHAT_APP_ID=wx1234567890abcdef  # 你的小程序 AppID
WECHAT_APP_SECRET=your_app_secret  # 你的 AppSecret
```

**获取 AppID 和 AppSecret**：
1. 登录微信小程序后台：https://mp.weixin.qq.com/
2. 进入"开发" → "开发设置"
3. 复制 AppID 和 AppSecret

---

### 步骤 2：重启服务

```bash
cd /workspace/projects
coze dev
```

---

## 🚀 使用方法

### 方法 1：生成自定义 URL Scheme

**接口**：`POST /api/wechat/url-scheme`

**请求示例**：

```bash
curl -X POST http://localhost:80/api/wechat/url-scheme \
  -H "Content-Type: application/json" \
  -d '{
    "path": "pages/camera/index",
    "query": {
      "userId": "123",
      "from": "sms"
    },
    "isExpire": false,
    "expireTime": 2592000
  }'
```

**响应示例**：

```json
{
  "code": 200,
  "msg": "生成成功",
  "data": {
    "urlScheme": "weixin://dl/business/?t=TICKET",
    "path": "pages/camera/index",
    "query": {
      "userId": "123",
      "from": "sms"
    },
    "expireTime": 2592000,
    "isExpire": false
  }
}
```

---

### 方法 2：生成 URL Link（H5 专用）

**接口**：`POST /api/wechat/url-link`

**请求示例**：

```bash
curl -X POST http://localhost:80/api/wechat/url-link \
  -H "Content-Type: application/json" \
  -d '{
    "path": "pages/history/index",
    "query": {
      "userId": "123"
    }
  }'
```

**响应示例**：

```json
{
  "code": 200,
  "msg": "生成成功",
  "data": {
    "urlLink": "https://wxaurl.cn/xxxxx",
    "path": "pages/history/index",
    "query": {
      "userId": "123"
    },
    "expireTime": 2592000,
    "isExpire": false
  }
}
```

---

### 方法 3：使用预设场景（快速生成）

**接口**：`GET /api/wechat/scheme/preset?scene=xxx`

**可用场景**：
- `camera` - 相机页面
- `history` - 历史记录页面
- `profile` - 个人中心
- `mall` - 商城

**请求示例**：

```bash
# 生成相机页面的 URL Scheme
curl http://localhost:80/api/wechat/scheme/preset?scene=camera

# 生成历史记录页面的 URL Scheme
curl http://localhost:80/api/wechat/scheme/preset?scene=history
```

**响应示例**：

```json
{
  "code": 200,
  "msg": "生成成功",
  "data": {
    "urlScheme": "weixin://dl/business/?t=TICKET",
    "path": "pages/camera/index",
    "query": {
      "from": "external_link"
    },
    "scene": "camera"
  }
}
```

---

## 📖 页面路径配置

### 所有可用的页面路径

```javascript
// 首页
pages/index/index

// 相机（拍照）
pages/camera/index

// 分析中
pages/analyzing/index

// 结果详情
pages/result/index

// 结果详细分析
pages/result-detail/index

// 历史记录
pages/history/index

// 历史记录详情
pages/history-detail/index

// 推荐
pages/recommend/index

// 商城
pages/mall/index

// 个人中心
pages/profile/index

// 落地页
pages/landing/index
```

---

## 🔧 参数说明

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| path | string | 是 | 小程序页面路径 |
| query | object | 否 | 查询参数（键值对） |
| isExpire | boolean | 否 | 是否永久有效（默认 false） |
| expireTime | number | 否 | 有效期（秒），最长 30 天 |

### query 参数示例

```javascript
{
  "userId": "123",           // 用户 ID
  "from": "sms",             // 来源标识
  "deviceId": "abc123",      // 设备 ID
  "campaign": "promo_2024"   // 活动标识
}
```

**在小程序中获取参数**：

```javascript
// pages/camera/index.tsx
export default function CameraPage() {
  // 获取启动参数
  const instance = Taro.getCurrentInstance()
  const params = instance.router?.params || {}

  console.log('userId:', params.userId)
  console.log('from:', params.from)

  return <View>...</View>
}
```

---

## ⚠️ 注意事项

### 1. 有效期限制
- **默认有效期**：30 天（2592000 秒）
- **永久有效**：需要小程序已认证（需要付费）
- **一次性使用**：每个 URL Scheme 只能使用一次

### 2. 域名白名单
如果使用 URL Link（H5 专用），需要在微信小程序后台配置业务域名：

1. 登录微信小程序后台
2. 进入"开发" → "开发设置"
3. 找到"业务域名"
4. 添加你的域名（如 `https://yourdomain.com`）

### 3. 路径限制
- 路径必须以 `pages/` 开头
- 路径必须在 `app.config.ts` 中注册
- 路径区分大小写

### 4. 参数限制
- URL 长度不能超过 1024 字节
- 参数建议使用 URL 编码
- 避免使用特殊字符

---

## 🎨 实际应用场景

### 场景 1：短信营销

```javascript
// 后端生成 URL Scheme
const response = await fetch('/api/wechat/url-scheme', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    path: 'pages/landing/index',
    query: { campaign: 'sms_promo_2024', userId: '123' }
  })
})

const { urlScheme } = await response.json()

// 发送短信
const smsContent = `点击链接，免费体验皮肤分析：${urlScheme}`
```

### 场景 2：H5 页面跳转

```html
<!-- H5 页面 -->
<a href="weixin://dl/business/?t=TICKET">
  打开小程序
</a>

<!-- 或使用 JavaScript -->
<script>
function openMiniProgram() {
  window.location.href = 'weixin://dl/business/?t=TICKET'
}
</script>
```

### 场景 3：其他 App 跳转

```java
// Android
String urlScheme = "weixin://dl/business/?t=TICKET";
Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(urlScheme));
startActivity(intent);
```

```swift
// iOS
if let url = URL(string: "weixin://dl/business/?t=TICKET") {
    UIApplication.shared.open(url)
}
```

---

## 📊 测试

### 测试 URL Scheme

```bash
# 生成 URL Scheme
curl -X POST http://localhost:80/api/wechat/url-scheme \
  -H "Content-Type: application/json" \
  -d '{"path":"pages/camera/index","query":{"from":"test"}}'

# 复制返回的 urlScheme
# 在微信中发送给自己，然后点击测试
```

### 测试 URL Link

```bash
# 生成 URL Link
curl -X POST http://localhost:80/api/wechat/url-link \
  -H "Content-Type: application/json" \
  -d '{"path":"pages/camera/index","query":{"from":"test"}}'

# 在浏览器中打开返回的 URL Link
# 会提示打开微信小程序
```

---

## 🔍 常见问题

### Q1: URL Scheme 无效？

**原因**：
- 已过期（超过 30 天）
- 已被使用过一次
- AppID 配置错误

**解决**：
- 重新生成 URL Scheme
- 检查环境变量配置

### Q2: H5 页面无法跳转？

**原因**：
- 未配置业务域名白名单
- URL Link 过期

**解决**：
- 在微信小程序后台添加业务域名
- 重新生成 URL Link

### Q3: 参数传递失败？

**原因**：
- 参数未 URL 编码
- 参数包含特殊字符

**解决**：
- 对参数进行 URL 编码
- 避免使用特殊字符

---

## 📞 技术支持

如有问题，请查看：
- 微信官方文档：https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/url-link/urlscheme.generate.html
- 后端日志：`tail -f /tmp/coze-logs/dev.log`

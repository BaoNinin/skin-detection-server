# NFC 直接打开小程序实现指南

## 方案选择

### 方案 1：微信官方 NFC 跳转（推荐）

**优点**：
- ✅ 官方支持，稳定可靠
- ✅ 用户无需授权即可打开
- ✅ 支持直接跳转到指定页面

**缺点**：
- ❌ 需要在微信公众平台配置
- ❌ 需要微信公众号认证

### 方案 2：自定义 NFC 数据 + 小程序监听

**优点**：
- ✅ 无需微信公众平台配置
- ✅ 灵活性高，可以传递自定义数据
- ✅ 适合个人开发者

**缺点**：
- ❌ 用户需要授予 NFC 权限
- ❌ 需要小程序在前台运行才能检测

---

## 推荐方案：微信官方 NFC 跳转

### 步骤 1：在微信公众平台配置

1. 登录微信公众平台：https://mp.weixin.qq.com/
2. 进入你的小程序后台
3. 找到"开发" → "开发管理" → "接口设置"
4. 找到"NFC"相关的配置（如果有的话）
5. 配置 NFC 跳转规则

### 步骤 2：获取小程序 URL Scheme

小程序的 URL Scheme 格式：
```
weixin://dl/business/?t=TICKET
```

其中 `TICKET` 需要通过微信接口生成。

### 步骤 3：生成跳转 Ticket

```javascript
// 使用微信接口生成 Ticket
// 需要调用 weapp.addUrlScheme 接口
```

### 步骤 4：写入 NFC 芯片

使用 NFC 写入工具（如 NFC Tools）写入以下数据：

**NDEF 格式 - URI Record**:
```
URI: weixin://dl/business/?t=YOUR_TICKET_HERE
```

---

## 备选方案：自定义 NFC 数据

### 步骤 1：编写 NFC 写入数据

**NDEF 格式 - Text Record**:
```
Type: application/vnd.coze.skin-analyzer
Payload: {"action":"open","page":"index","deviceId":"DEVICE_001"}
```

### 步骤 2：在小程序中添加 NFC 监听

### 步骤 3：实现 NFC 数据解析和跳转

---

## NFC 芯片写入方法

### 方法 1：使用手机 App（推荐）

**Android**:
1. 下载 "NFC Tools" 或 "NFC Writer"
2. 选择 "Write" → "Add a record" → "URL/URI"
3. 输入小程序跳转链接
4. 靠近 NFC 芯片完成写入

**iOS**:
1. 下载 "NFC Tools" 或 "NFC Writer"
2. 同样的操作步骤

### 方法 2：使用 NFC 写卡器

1. 连接 NFC 写卡器到电脑
2. 使用写卡软件（如 MifareOne Tool）
3. 按照 NDEF 格式写入数据

---

## 测试验证

### 测试步骤

1. **写入 NFC 芯片**
2. **使用手机靠近芯片**
3. **观察是否自动打开小程序**
4. **检查是否跳转到指定页面**

---

## 注意事项

1. **NFC 功能限制**：
   - iOS 需要小程序在前台才能检测
   - Android 支持后台检测（需要配置）

2. **NDEF 记录限制**：
   - 不同的 NFC 芯片容量不同
   - 一般 144 字节到 4KB 不等

3. **安全性**：
   - 避免在 NFC 数据中写入敏感信息
   - 可以考虑加密 NFC 数据

---

## 常见问题

### Q: iOS 无法检测到 NFC？
A: iOS 需要用户授权，并且小程序必须在前台运行。

### Q: Android 无法检测到 NFC？
A: 检查是否在 `app.json` 中配置了 NFC 权限。

### Q: 写入失败？
A: 检查 NFC 芯片是否已锁定，尝试解锁或更换芯片。

---

## 下一步

选择适合你的方案，然后：
1. 配置相应的权限和设置
2. 编写小程序 NFC 监听代码
3. 测试 NFC 功能

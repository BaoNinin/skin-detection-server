# NFC 功能使用指南

## 🎯 功能概述

本小程序支持通过 NFC 芯片直接打开并自动开始皮肤分析。

## 📱 使用方法

### 方法 1：使用内置 NFC 写入工具

#### 步骤 1：打开 NFC 写入工具

在小程序中：
1. 进入"我的"页面
2. 找到"NFC 设置"或"NFC 工具"
3. 点击进入

或者在地址栏访问：
```
/pages/nfc-writer/index
```

#### 步骤 2：配置 NFC 参数

**设备 ID**：
- 输入设备唯一标识（如：`DEVICE_001`）
- 用于区分不同的 NFC 芯片

**跳转页面**：
- 默认：`/pages/camera/index`（相机页面）
- 可以修改为其他页面路径

**操作类型**：
- **自动分析**：靠近芯片后自动开始皮肤检测
- **打开页面**：靠近芯片后只打开指定页面，不自动开始

#### 步骤 3：生成 NFC 数据

点击"生成 NFC 数据"按钮，系统会生成类似以下格式的数据：

```json
{
  "action": "analyze",
  "page": "/pages/camera/index",
  "deviceId": "DEVICE_001",
  "timestamp": 1712345678901
}
```

#### 步骤 4：写入 NFC 芯片

**Android 设备**：

1. 下载 "NFC Tools" 或 "NFC Writer" App
2. 打开 App，选择 "Write"
3. 点击 "Add a record" → "Text"
4. 粘贴生成的 NFC 数据
5. 靠近空白 NFC 芯片完成写入

**iOS 设备**：

1. 下载 "NFC Tools" 或 "NFC Writer" App
2. 同样的操作步骤

#### 步骤 5：测试

1. 关闭小程序（确保不在后台运行）
2. 打开手机 NFC 功能
3. 将手机靠近 NFC 芯片
4. 应该自动打开小程序并跳转到相机页面
5. 如果选择了"自动分析"，会自动开始检测

---

### 方法 2：手动写入（高级用户）

#### NFC 数据格式

使用 NDEF Text Record 格式：

**类型**：`application/vnd.coze.skin-analyzer`
**数据**：JSON 字符串

**示例数据**：
```json
{
  "action": "analyze",
  "page": "/pages/camera/index",
  "deviceId": "SKIN_ANALYZER_001",
  "timestamp": 1712345678901
}
```

#### 使用 NFC 写入工具

**推荐工具**：
- **Android**: NFC Tools, MifareOne Tool
- **iOS**: NFC Tools, NFC Writer

**写入步骤**：
1. 选择 NDEF 格式
2. 添加 Text Record
3. 输入 JSON 数据
4. 靠近芯片完成写入

---

## 🎯 支持的 NFC 动作

### 1. 自动分析（`analyze`）

靠近 NFC 芯片后：
- ✅ 自动打开相机页面
- ✅ 自动开始皮肤分析流程
- ✅ 显示已连接的设备 ID

**适用场景**：
- 固定位置的皮肤检测仪
- 智能镜子
- 自动售货机

### 2. 打开页面（`open`）

靠近 NFC 芯片后：
- ✅ 自动打开指定页面
- ✅ 不自动开始分析
- ✅ 显示已连接的设备 ID

**适用场景**：
- 展示屏
- 产品说明
- 导览系统

---

## 🔧 配置参数说明

### deviceId（设备 ID）
- **类型**：字符串
- **必填**：否
- **说明**：用于标识 NFC 芯片对应的设备
- **示例**：`DEVICE_001`, `SKIN_MIRROR_01`

### page（跳转页面）
- **类型**：字符串
- **必填**：是
- **说明**：NFC 触发后跳转的页面路径
- **示例**：`/pages/camera/index`, `/pages/landing/index`

### action（操作类型）
- **类型**：字符串
- **必填**：是
- **可选值**：
  - `analyze`：自动分析
  - `open`：打开页面

### timestamp（时间戳）
- **类型**：数字
- **必填**：否
- **说明**：自动生成，记录数据生成时间

---

## 🚀 高级用法

### 1. 多设备管理

为每个 NFC 芯片配置不同的 deviceId，可以在小程序中识别不同的设备：

```javascript
// 在相机页面获取设备 ID
const deviceId = Taro.getStorageSync('nfc_device_id')

// 根据设备 ID 显示不同的提示
if (deviceId === 'DEVICE_001') {
  setGuideText('已连接：智能镜子 A')
} else if (deviceId === 'DEVICE_002') {
  setGuideText('已连接：智能镜子 B')
}
```

### 2. 自定义页面跳转

除了相机页面，还可以跳转到其他页面：

```json
{
  "action": "open",
  "page": "/pages/history/index",
  "deviceId": "HISTORY_VIEWER_001"
}
```

### 3. 链接到特定功能

跳转到产品推荐页面：

```json
{
  "action": "open",
  "page": "/pages/recommend/index",
  "deviceId": "PRODUCT_DISPLAY_001"
}
```

---

## ⚠️ 注意事项

### iOS 限制

- iOS 需要小程序在前台运行才能检测 NFC
- 用户需要授予 NFC 权限
- 建议在页面中添加 NFC 权限申请提示

### Android 优势

- Android 支持后台检测
- 即使小程序关闭，NFC 也能自动启动

### NFC 芯片容量

- 大多数 NTAG213 芯片：180 字节
- NTAG215 芯片：504 字节
- NTAG216 芯片：888 字节

**建议**：使用 NTAG215 或 NTAG216，容量足够存储 NFC 数据

---

## 🐛 常见问题

### Q: NFC 无法触发？

**A: 检查以下几点**：
1. NFC 功能是否开启
2. 小程序是否有 NFC 权限
3. NFC 芯片是否正确写入数据
4. 设备是否支持 NFC

### Q: iOS 无法检测到 NFC？

**A:** iOS 需要小程序在前台，并且用户已授权 NFC 权限。

### Q: 写入失败？

**A:**
1. 检查 NFC 芯片是否已锁定
2. 尝试解锁或更换芯片
3. 确保写入工具支持该芯片类型

### Q: 数据格式错误？

**A:**
1. 确保 JSON 格式正确
2. 检查必需字段是否存在
3. 使用 NFC 写入工具的验证功能

---

## 📞 技术支持

如果遇到问题：
1. 查看控制台日志
2. 检查 NFC 数据格式
3. 测试其他 NFC 芯片
4. 联系技术支持

---

## 🎉 开始使用

现在你可以：

1. ✅ 使用 NFC 写入工具生成数据
2. ✅ 写入到空白 NFC 芯片
3. ✅ 测试 NFC 触发功能
4. ✅ 体验自动皮肤分析

祝你使用愉快！🚀

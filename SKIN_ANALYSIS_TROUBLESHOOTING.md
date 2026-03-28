# 皮肤分析数据相同问题排查指南

## 问题描述
每次进行皮肤识别时，返回的数据都一模一样，没有变化。

## 已修复内容

### 1. 前端修复 (`src/pages/index/index.tsx`)

#### 问题原因
- 每次拍照返回的临时文件路径可能相同
- 没有时间戳参数确保每次请求唯一
- 缺少日志来追踪问题

#### 修复方案
```typescript
// 1. 添加时间戳参数
const timestamp = Date.now()
const res = await Network.uploadFile({
  url: `/api/skin/analyze?t=${timestamp}`,
  filePath: imagePath,
  name: 'image',
  formData: {
    timestamp: String(timestamp)
  }
})

// 2. 添加文件信息日志
console.log('拍照成功，临时文件路径:', res.tempImagePath)
console.log('文件大小:', res.tempFilePaths?.[0] || '未知')

// 3. 延迟上传确保文件准备就绪
setTimeout(() => {
  analyzeSkin(res.tempFilePath)
}, 500)
```

### 2. 后端修复 (`server/src/skin/skin.service.ts`)

#### 问题原因
- 缺少详细日志追踪每次分析
- 无法验证每次上传的图片是否真的不同
- 无法追踪API调用和响应

#### 修复方案
```typescript
// 1. 添加时间戳日志
const timestamp = Date.now()
console.log(`\n========== [${timestamp}] 开始新的皮肤分析 ==========`)

// 2. 记录文件标识
const fileHash = file.path ? file.path.slice(-20) : file.buffer?.slice(0, 20).toString('hex') || 'unknown'
console.log('文件标识:', fileHash)

// 3. 打印buffer前10字节验证图片不同
console.log(`[${imageTimestamp}] Buffer 前10字节:`, imageBuffer.slice(0, 10).toString('hex'))

// 4. 打印完整分析结果
console.log(`[${imageTimestamp}] === 豆包模型分析结果 ===`)
console.log(`[${imageTimestamp}] 皮肤类型:`, result.skinType)
console.log(`[${imageTimestamp}] 水分:`, result.moisture)
// ... 其他指标

console.log(`[${imageTimestamp}] === 最终返回结果 ===`)
console.log(`[${imageTimestamp}]`, JSON.stringify(finalResult, null, 2))
```

---

## 如何验证修复

### 方法1：查看后端日志

1. **访问微信云托管控制台**
   - 进入「日志」页面
   - 查看最新日志

2. **关键日志点**
   ```
   ========== [1234567890] 开始新的皮肤分析 ==========
   文件路径: /tmp/upload_xxx.jpg
   文件大小: 123456
   文件标识: upload_xxx.jpg
   [1234567891] Buffer 前10字节: ffd8ffe000104a4649
   [1234567895] === 豆包模型分析结果 ===
   [1234567895] 皮肤类型: 油性皮肤
   [1234567895] 水分: 65
   [1234567895] 油性: 72
   [1234567895] 敏感度: 45
   ```

3. **验证要点**
   - ✅ 每次分析的时间戳都不同
   - ✅ 每次分析的文件标识都不同
   - ✅ 每次分析的Buffer前10字节都不同
   - ✅ 每次分析的结果数值都不同

### 方法2：真机测试

1. **清除小程序缓存**
   - 关闭小程序
   - 长按小程序图标→删除
   - 重新扫描预览二维码

2. **多次拍照测试**
   - 拍照1次 → 记录结果
   - 拍照2次 → 对比结果
   - 拍照3次 → 对比结果

3. **检查结果**
   - ✅ 皮肤类型应该有变化
   - ✅ 数值（水分、油性、敏感度）应该不同
   - ✅ 如果数据相同，查看后端日志

### 方法3：检查前端console

1. **打开微信开发者工具**
   - 点击「调试器」
   - 切换到「Console」标签

2. **查看日志**
   ```
   拍照成功，临时文件路径: tmp_123.jpg
   文件大小: 234567
   上传图片路径: tmp_123.jpg
   请求时间戳: 1712345678901
   API响应: {code: 200, data: {...}}
   解析后的数据: {skinType: "...", moisture: 75, ...}
   ```

3. **验证要点**
   - ✅ 每次的临时文件路径应该不同
   - ✅ 每次的请求时间戳都不同
   - ✅ 每次的API响应数据都不同

---

## 如果问题仍然存在

### 检查1：环境变量是否正确

查看 `server/.env.wechat-cloud`：
```bash
COZE_USE_MOCK=false  # 必须为false
COZE_API_KEY=654a810c-bc85-44b1-8d21-ab53cbdf5d26
COZE_MODEL=doubao-1-5-vision-pro-32k-250115
```

### 检查2：后端日志是否显示"使用模拟数据模式"

如果看到以下日志：
```
=== 使用模拟数据模式 ===
```

说明环境变量 `COZE_USE_MOCK` 被设置为 `true`，需要改为 `false`。

### 检查3：豆包API调用是否成功

查看后端日志：
```
调用豆包端点模型...
API Key: 654a810c-...
模型: doubao-1-5-vision-pro-32k-250115
API Base: https://ark.cn-beijing.volces.com/api/v3/chat/completions
```

如果看到这些日志，说明API调用已启动。

### 检查4：API响应是否正常

查看后端日志：
```
豆包模型响应状态: {...}
API 响应结构: {has_id: true, has_object: true, ...}
响应内容长度: 1234
响应前 200 字符: {"skinType": "..."
```

如果看到这些日志，说明API响应正常。

### 检查5：是否真的调用豆包API

查看后端日志中是否有：
```
=== 模拟分析结果 ===
```

如果有这个日志，说明调用了模拟数据而不是真实的豆包API。

可能原因：
1. `COZE_USE_MOCK` 环境变量设置为 `true`
2. 豆包API调用失败，fallback到模拟数据
3. 豆包API返回了无效结果

---

## 常见问题

### Q1: 每次拍照的图片路径都相同怎么办？

**解决方案**：
- 前端已添加500ms延迟确保文件准备就绪
- 前端已添加时间戳参数确保请求唯一
- 后端已添加文件标识追踪每次上传

### Q2: 后端日志显示"文件标识"相同怎么办？

**可能原因**：
- 图片真的相同（拍摄同一张脸）
- 小程序缓存了相同的图片文件

**解决方案**：
- 拍摄不同的角度或不同的脸
- 清除小程序缓存重新测试
- 检查后端日志中的"Buffer前10字节"是否相同

### Q3: 豆包API调用失败怎么办？

**错误信息示例**：
```
API 调用失败: 401 - Unauthorized
```

**解决方案**：
1. 检查 API Key 是否正确
2. 检查 API Key 是否过期
3. 检查网络连接是否正常
4. 查看微信云托管控制台的详细日志

---

## 修改文件清单

| 文件 | 修改内容 |
|------|---------|
| `src/pages/index/index.tsx` | 添加时间戳参数、文件信息日志、延迟上传 |
| `server/src/skin/skin.service.ts` | 添加详细时间戳日志、文件标识、buffer验证、完整结果打印 |

---

## 下一步操作

1. **重新部署后端服务**
   ```bash
   # 在微信云托管控制台
   # 选择环境: prod-3gbk859ae18cc611
   # 选择服务: skin-detection-serve
   # 点击「部署」重新部署
   ```

2. **重新编译小程序**
   ```bash
   pnpm build:weapp
   ```

3. **清除缓存并测试**
   - 关闭小程序
   - 删除小程序
   - 重新扫描预览二维码
   - 进行多次拍照测试

4. **查看日志验证**
   - 检查前端console日志
   - 检查后端服务日志
   - 对比每次的分析结果

---

**更新时间**: 2026-03-28
**维护者**: 开发团队

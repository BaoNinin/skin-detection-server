# 豆包模型调用失败排查指南

## 问题现象

- 面部识别每次返回相同的数据
- 皮肤指标都是 0：`{brightness: 0, texture: 0, pores: 0, moisture: 0, tone: "中性", …}`
- 没有看到后端的 API 调用日志

---

## 排查步骤

### Step 1: 确认是否真的触发了皮肤分析

从日志来看，可能只是打开了页面，但还没有真正上传图片进行分析。

**操作步骤**：
1. 打开小程序
2. 点击"开始检测"或"上传照片"按钮
3. 选择一张照片上传
4. 等待分析结果

**关键**：只有上传照片后才会调用豆包 API。

---

### Step 2: 查看完整的服务器日志

**在 PowerShell 中执行**：

```powershell
# 查看最新日志（最近 200 行）
tcb logs --service-name skin-detection-server --latest --lines 200
```

**重点查找以下内容**：

#### ✅ 正常的 API 调用日志（成功）：
```
开始分析皮肤图像...
文件路径: /tmp/xxx
文件大小: 123456
MIME 类型: image/jpeg
调用豆包端点模型...
API Key: 8f60880a-1...
模型: doubao-1-5-vision-pro-32k-250115
豆包模型响应状态: {...}
响应内容长度: xxx
皮肤类型: xxx
```

#### ❌ 使用模拟数据的日志（问题）：
```
=== 使用模拟数据模式 ===
```

#### ❌ API 调用失败的日志（问题）：
```
API 调用失败: 401 Unauthorized
```
或
```
API 调用失败: 404 Not Found
```
或
```
API 调用失败: model not found
```

---

### Step 3: 检查微信云托管环境变量

#### 3.1 访问控制台

1. 访问：https://console.cloud.tencent.com/tcb/env
2. 选择环境：`cloud1-9gz0vft7d1ddce7f`
3. 进入「云托管」→「服务管理」
4. 选择服务：`skin-detection-server`
5. 点击「环境变量」查看配置

#### 3.2 确认关键环境变量

确认以下环境变量**完全一致**：

| 环境变量 | 正确值 | 必须一致 |
|---------|--------|----------|
| `COZE_API_KEY` | `654a810c-bc85-44b1-8d21-ab53cbdf5d26` | ✅ |
| `COZE_MODEL` | `doubao-1-5-vision-pro-32k-250115` | ✅ |
| `COZE_API_BASE` | `https://ark.cn-beijing.volces.com/api/v3/chat/completions` | ✅ |
| `COZE_USE_MOCK` | `false` | ✅ **重要** |

**特别注意**：
- `COZE_USE_MOCK` 必须设置为 `false`，否则会使用模拟数据
- `COZE_MODEL` 必须完全匹配，不能有空格或拼写错误

#### 3.3 如果环境变量不正确

**更新步骤**：

1. 在控制台修改环境变量
2. 点击「保存」
3. **必须重新部署服务**（修改环境变量不会自动生效）
4. 等待部署完成（3-5 分钟）

---

### Step 4: 手动测试 API

在本地测试豆包 API 是否正常工作：

```bash
# 设置 API Key
export ARK_API_KEY="654a810c-bc85-44b1-8d21-ab53cbdf5d26"

# 测试 API
curl https://ark.cn-beijing.volces.com/api/v3/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ARK_API_KEY" \
  -d '{
    "model": "doubao-1-5-vision-pro-32k-250115",
    "messages": [
      {
        "content": [
          {
            "type": "text",
            "text": "你好"
          }
        ],
        "role": "user"
      }
    ]
  }'
```

**期望结果**：返回正常的 JSON 响应

**可能的问题**：
- 如果返回 `401 Unauthorized`：API Key 错误
- 如果返回 `404 Not Found`：API 端点错误
- 如果返回 `model not found`：模型名称错误

---

### Step 5: 测试图片上传功能

#### 5.1 打开浏览器开发者工具

1. 在微信开发者工具中打开小程序
2. 点击「调试器」→「Network」
3. 清空日志

#### 5.2 上传一张照片

1. 点击「上传照片」
2. 选择一张照片
3. 观察网络请求

#### 5.3 查看请求和响应

**查找以下请求**：
- `POST /api/skin/analyze` - 皮肤分析接口
- `POST /api/skin/upload` - 图片上传接口

**检查请求参数**：
- 请求方法：`POST`
- Content-Type：`multipart/form-data`
- 是否包含图片文件

**检查响应数据**：
- 状态码：`200`
- 响应体是否包含分析结果
- 检查 `skinType`、`moisture`、`oiliness` 等字段

---

### Step 6: 检查前端网络请求代码

查看前端代码中的网络请求部分：

**文件位置**：`src/pages/index/index.tsx`

**关键代码**：
```typescript
const result = await Network.uploadFile({
  url: '/api/skin/analyze',
  filePath: tempFilePath,
  name: 'file',
  formData: {
    userId: userInfo.id
  }
})
```

**检查点**：
- URL 路径是否正确
- 文件参数名是否为 `file`
- 是否正确处理响应数据

---

## 常见问题及解决方案

### 问题 1：环境变量未生效

**症状**：
- 日志显示使用旧模型或模拟数据
- 每次返回相同结果

**原因**：
- 修改环境变量后没有重新部署

**解决方案**：
1. 在控制台修改环境变量
2. 点击「保存」
3. 重新部署服务
4. 等待部署完成

---

### 问题 2：API Key 无效

**症状**：
- 后端日志显示 `401 Unauthorized`
- API 调用失败

**原因**：
- API Key 错误或过期

**解决方案**：
1. 确认 API Key：`654a810c-bc85-44b1-8d21-ab53cbdf5d26`
2. 更新环境变量
3. 重新部署

---

### 问题 3：模型名称错误

**症状**：
- 后端日志显示 `model not found`
- API 调用失败

**原因**：
- 模型名称拼写错误

**解决方案**：
1. 确认模型名称：`doubao-1-5-vision-pro-32k-250115`
2. 检查是否有空格或拼写错误
3. 更新环境变量
4. 重新部署

---

### 问题 4：COZE_USE_MOCK 设置为 true

**症状**：
- 日志显示 `=== 使用模拟数据模式 ===`
- 每次返回相同的随机数据

**原因**：
- 环境变量 `COZE_USE_MOCK` 设置为 `true`

**解决方案**：
1. 在控制台将 `COZE_USE_MOCK` 改为 `false`
2. 重新部署服务
3. 等待部署完成

---

### 问题 5：前端没有发送请求

**症状**：
- 查看后端日志，没有任何 API 调用记录
- 前端点击按钮后没有反应

**原因**：
- 前端代码有问题
- 网络请求失败

**解决方案**：
1. 打开浏览器开发者工具
2. 查看 Network 标签
3. 检查是否有请求发出
4. 查看前端控制台是否有错误

---

## 诊断流程图

```
开始
  ↓
是否上传了照片？
  否 → 上传照片并等待分析
  是 → 继续
  ↓
查看后端日志
  ↓
是否有 API 调用日志？
  否 → 前端未发送请求，检查前端代码
  是 → 继续
  ↓
是否有错误信息？
  是 → 根据错误信息修复
  否 → 检查响应内容
  ↓
响应内容是否是分析结果？
  否 → API 调用失败，检查环境变量
  是 → 检查是否每次都相同
  ↓
每次都相同？
  是 → 检查模型配置或提高 temperature
  否 → 功能正常
```

---

## 快速检查清单

请按以下顺序检查：

- [ ] **是否上传了照片？**（必须操作）
- [ ] **查看后端日志**（必须）
- [ ] **确认环境变量**（必须）
- [ ] **手动测试 API**（可选）
- [ ] **查看前端网络请求**（推荐）
- [ ] **检查前端代码**（如有问题）

---

## 下一步操作

1. **立即操作**：上传一张照片，触发皮肤分析
2. **查看日志**：`tcb logs --service-name skin-detection-server --latest --lines 200`
3. **发送日志**：把完整的后端日志发给我分析

**重点**：需要看到后端的 API 调用日志，而不是前端的页面日志。

---

**更新时间**: 2025-03-24
**版本**: 1.0.0
**状态**: 🔍 等待用户提供更多信息

# 皮肤分析数据相同问题排查

## 问题描述

每次皮肤分析返回的数据都一模一样，没有根据实际图片内容进行识别。

## 可能的原因

### 1. 微信云托管环境变量未正确配置

**检查点**：微信云托管的环境变量中 `COZE_USE_MOCK` 可能设置为 `true`

**解决方法**：
1. 登录微信云托管控制台
2. 进入服务配置 → 环境变量
3. 确认 `COZE_USE_MOCK` 设置为 `false`

### 2. API 调用失败，每次都 fallback 到模拟数据

**检查点**：查看服务器日志，确认是否有 API 调用失败的错误

**可能的错误**：
- API Key 无效或过期
- 网络连接问题
- 模型端点不可用
- 图片上传失败

**查看日志方法**：
```bash
tcb logs --env-id cloud1-9gz0vft7d1ddce7f --service-name skin-detection-server --latest
```

**期望看到的日志**（成功）：
```
开始分析皮肤图像...
文件路径: /tmp/xxx
文件大小: 123456
调用豆包端点模型...
API Key: 8f60880a-1...
模型: ep-20260324135258-7shrd
豆包模型响应状态: {...}
API 响应结构: {...}
响应内容长度: 500
皮肤类型: 油性皮肤
```

**可能看到的日志**（失败）：
```
API 调用失败: 401 Unauthorized
=== 豆包模型返回无效结果，使用模拟数据 ===
```

### 3. 模拟数据生成逻辑问题

**检查点**：如果使用模拟数据，每次应该生成不同的随机数

**模拟数据代码**：
```typescript
const moisture = Math.floor(Math.random() * 30) + 50; // 50-80
const oiliness = Math.floor(Math.random() * 40) + 30; // 30-70
```

**如果每次都一样，说明**：
- 没有真正调用这个函数
- 或者使用了固定的随机种子

### 4. API 调用成功，但 LLM 返回的结果一致

**检查点**：豆包模型可能对不同的图片返回了相似的分析结果

**解决方法**：
1. 尝试使用明显不同的图片测试
2. 调整 `temperature` 参数（当前 0.7）以提高随机性
3. 添加更多样化的图片进行测试

## 排查步骤

### Step 1: 检查微信云托管环境变量

```bash
# 查看服务配置
tcb services get skin-detection-server --env-id cloud1-9gz0vft7d1ddce7f
```

确认以下环境变量正确：
- `COZE_API_KEY=654a810c-bc85-44b1-8d21-ab53cbdf5d26`
- `COZE_MODEL=ep-20260324135258-7shrd`
- `COZE_API_BASE=https://ark.cn-beijing.volces.com/api/v3/chat/completions`
- `COZE_USE_MOCK=false`

### Step 2: 查看服务器日志

```bash
# 查看最新日志
tcb logs --env-id cloud1-9gz0vft7d1ddce7f --service-name skin-detection-server --latest

# 查看最近 100 行
tcb logs --env-id cloud1-9gz0vft7d1ddce7f --service-name skin-detection-server --latest --lines 100
```

### Step 3: 测试不同图片

使用明显不同的图片进行测试：
- 油性皮肤 vs 干性皮肤
- 年轻皮肤 vs 老化皮肤
- 有痘痘的皮肤 vs 无痘痘的皮肤

### Step 4: 检查 API 调用

手动测试 API 是否正常：

```bash
export ARK_API_KEY="654a810c-bc85-44b1-8d21-ab53cbdf5d26"

curl https://ark.cn-beijing.volces.com/api/v3/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ARK_API_KEY" \
  -d '{
    "model": "ep-20260324135258-7shrd",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "image_url",
            "image_url": {
              "url": "https://ark-project.tos-cn-beijing.ivolces.com/images/view.jpeg"
            }
          },
          {
            "type": "text",
            "text": "图片主要讲了什么?"
          }
        ]
      }
    ],
    "max_tokens": 2000,
    "temperature": 0.7
  }'
```

## 解决方案

### 方案 1: 确保环境变量正确

在微信云托管控制台重新设置环境变量：

```json
{
  "COZE_API_KEY": "654a810c-bc85-44b1-8d21-ab53cbdf5d26",
  "COZE_MODEL": "ep-20260324135258-7shrd",
  "COZE_API_BASE": "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
  "COZE_USE_MOCK": "false"
}
```

**注意**：修改环境变量后必须重新部署服务！

### 方案 2: 重新部署服务

```bash
cd /workspace/projects/server
bash deploy-wechat-cloud.sh
```

### 方案 3: 添加更详细的日志

修改代码，在关键位置添加更多日志：

```typescript
console.log('=== 开始 API 调用 ===');
console.log('API URL:', apiUrl);
console.log('Request Body:', JSON.stringify(requestBody, null, 2));
console.log('=== API 响应 ===');
console.log('Response:', JSON.stringify(responseData, null, 2));
console.log('=== 解析结果 ===');
console.log('Parsed Result:', result);
```

### 方案 4: 提高 temperature 参数

在代码中将 `temperature` 从 0.7 提高到 0.9：

```typescript
const requestBody = {
  model: model,
  messages: [...],
  max_tokens: 2000,
  temperature: 0.9  // 从 0.7 提高到 0.9
};
```

### 方案 5: 测试真实图片

确保上传的是真实的人脸照片，而不是：
- 占位图
- 相同的图片
- 非人脸图片

## 快速检查清单

- [ ] 检查微信云托管环境变量中的 `COZE_USE_MOCK` 是否为 `false`
- [ ] 查看服务器日志，确认是否有 API 调用失败的错误
- [ ] 确认 API Key 和模型名称正确
- [ ] 测试不同图片验证是否真的相同
- [ ] 手动测试 API 是否正常工作
- [ ] 重新部署服务以确保环境变量生效

## 常见错误信息

### 错误 1: API 调用失败

```
API 调用失败: 401 Unauthorized
```

**原因**：API Key 无效或过期
**解决**：更新 `COZE_API_KEY`

### 错误 2: 使用模拟数据

```
=== 使用模拟数据模式 ===
```

**原因**：`COZE_USE_MOCK=true`
**解决**：设置为 `false` 并重新部署

### 错误 3: API 返回无效结果

```
=== 豆包模型返回无效结果，使用模拟数据 ===
```

**原因**：API 响应格式不正确或内容为空
**解决**：检查 API 响应格式，或提高模型提示词质量

## 联系支持

如果以上方案都无法解决问题，请提供：
1. 服务器日志（最近 100 行）
2. 环境变量配置（脱敏）
3. 测试图片（脱敏）
4. 前端调用的完整请求和响应

---

**更新时间**: 2025-03-24
**版本**: 1.0.0
**状态**: 🔍 需要排查

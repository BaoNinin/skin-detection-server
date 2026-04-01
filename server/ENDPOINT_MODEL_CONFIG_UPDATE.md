# 豆包端点模型配置更新总结

## 更新概述

本次更新将智能皮肤检测小程序从豆包视觉模型切换到新的豆包端点模型（Endpoint Model），并适配了标准 `chat/completions` API 格式。

## 主要变更

### 1. 环境变量配置

**所有环境变量文件已更新：**

- `server/.env.local`
- `server/.env.production`
- `server/.env.wechat-cloud`
- `server/.env.local.example`

**变更内容：**

| 配置项 | 旧值 | 新值 |
|--------|------|------|
| `COZE_API_KEY` | `ea77474e-46bb-4f4e-a42f-99dedce29678` | `654a810c-bc85-44b1-8d21-ab53cbdf5d26` |
| `COZE_MODEL` | `doubao-seed-1-6-vision-250815` | `ep-20260324135258-7shrd` |
| `COZE_API_BASE` | `https://ark.cn-beijing.volces.com/api/v3/responses` | `https://ark.cn-beijing.volces.com/api/v3/chat/completions` |

### 2. 代码更改

#### `server/src/skin/skin.service.ts`

**API 调用格式变更：**

从 Coze Responses API 格式：
```typescript
const requestBody = {
  model,
  input: messages
};
```

改为标准 chat/completions API 格式：
```typescript
const requestBody = {
  model: model,
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: { url: dataUri }
        },
        {
          type: 'text',
          text: '...'
        }
      ]
    }
  ],
  max_tokens: 2000,
  temperature: 0.7
};
```

**响应解析变更：**

从 Coze Responses API 响应：
```typescript
if (responseData.output && responseData.output.length > 0) {
  const output = responseData.output[0];
  if (output.content && output.content.length > 0) {
    responseContent = output.content[0].text;
  }
}
```

改为标准 chat/completions 响应：
```typescript
if (responseData.choices && responseData.choices.length > 0) {
  const choice = responseData.choices[0];
  if (choice.message && choice.message.content) {
    responseContent = choice.message.content;
  }
}
```

#### `server/src/skin/product.service.ts`

更新模型名称：
```typescript
const response = await this.client.invoke(messages, {
  model: 'ep-20260324135258-7shrd',  // 从 doubao-seed-1-6-vision-250815 更新
  temperature: 0.7
});
```

### 3. 部署脚本更新

**更新的文件：**
- `server/deploy-cloud-hosting.sh`
- `server/test-config.js`
- `server/verify-api-config.js`
- `server/batch-update-config.js`
- `server/CLOUD_HOSTING_ENV_SETUP.md`
- `server/WECHAT_CLOUD_HOSTING_ENV_CONFIG.md`

### 4. 构建问题修复

**问题：**
- 发现重复的 `server/main.ts` 文件，导致编译错误

**解决方案：**
- 删除了重复的 `server/main.ts` 文件
- 统一使用 `server/src/main.ts` 作为入口文件
- 修复了 TypeScript 导入路径问题

## 验证结果

### 配置验证

```bash
$ cd server && node test-config.js

=== 豆包视觉模型配置检查 ===

1. API Key: 654a810c-bc85-44b1-8d21-ab53cbdf5d26
2. 模型名称: ep-20260324135258-7shrd
3. API 地址: https://ark.cn-beijing.volces.com/api/v3/chat/completions
4. 使用模拟数据: 否

=== 配置检查结果 ===
✅ API Key 正确
✅ 模型名称正确
✅ API 地址正确
✅ 使用真实 API（非模拟数据）

🎉 所有配置检查通过！
```

### 编译验证

```bash
$ cd server && pnpm build
✅ 编译成功
```

## API 格式对比

### Coze Responses API（旧格式）

**请求格式：**
```json
{
  "model": "doubao-seed-1-6-vision-250815",
  "input": {
    "messages": [
      {
        "role": "user",
        "content": [
          { "type": "input_image", "image_url": "..." },
          { "type": "input_text", "text": "..." }
        ]
      }
    ]
  }
}
```

**响应格式：**
```json
{
  "id": "...",
  "object": "response",
  "status": "success",
  "output": [
    {
      "content": [
        { "type": "output_text", "text": "..." }
      ]
    }
  ]
}
```

### 标准 chat/completions API（新格式）

**请求格式：**
```json
{
  "model": "ep-20260324135258-7shrd",
  "messages": [
    {
      "role": "user",
      "content": [
        { "type": "image_url", "image_url": { "url": "..." } },
        { "type": "text", "text": "..." }
      ]
    }
  ],
  "max_tokens": 2000,
  "temperature": 0.7
}
```

**响应格式：**
```json
{
  "id": "...",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "ep-20260324135258-7shrd",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 100,
    "completion_tokens": 50,
    "total_tokens": 150
  }
}
```

## 部署步骤

### 1. 本地测试

```bash
cd /workspace/projects/server

# 验证配置
node test-config.js

# 启动开发服务器
pnpm dev

# 或构建生产版本
pnpm build
pnpm start:prod
```

### 2. 部署到微信云托管

```bash
cd /workspace/projects/server

# 使用更新后的部署脚本
bash deploy-cloud-hosting.sh
```

或手动部署：

```bash
tcb run service:deploy \
  --env-id cloud1-9gz0vft7d1ddce7f \
  --service-name skin-detection-server \
  --version-name latest \
  --cpu 0.5 \
  --memory 1 \
  --min-num 1 \
  --max-num 1 \
  --container-port 80 \
  --env COZE_API_KEY=654a810c-bc85-44b1-8d21-ab53cbdf5d26 \
  --env COZE_MODEL=ep-20260324135258-7shrd \
  --env COZE_API_BASE=https://ark.cn-beijing.volces.com/api/v3/chat/completions \
  --env CLOUDBASE_ENV_ID=cloud1-9gz0vft7d1ddce7f \
  --env NODE_ENV=production
```

## 关键差异说明

### 1. 模型类型

- **旧模型**：`doubao-seed-1-6-vision-250815` - 豆包视觉模型
- **新模型**：`ep-20260324135258-7shrd` - 豆包端点模型（自定义端点）

### 2. API 端点

- **旧端点**：`/api/v3/responses` - Coze Responses API
- **新端点**：`/api/v3/chat/completions` - 标准 OpenAI 兼容 API

### 3. 响应结构

- **旧格式**：嵌套在 `output.content[].text` 中
- **新格式**：嵌套在 `choices[].message.content` 中

## 注意事项

1. **向后兼容性**：新的 API 格式更符合 OpenAI 标准，更容易迁移到其他 LLM 提供商
2. **性能**：端点模型可能提供更好的性能和稳定性
3. **成本**：端点模型的计费方式可能与普通模型不同，请确认计费策略
4. **功能**：确保所有功能（多图上传、皮肤分析、产品推荐）在新模型下正常工作

## 测试建议

1. **单图测试**：测试单张图片的皮肤分析功能
2. **多图测试**：测试最多 3 张图片的皮肤分析功能
3. **产品推荐**：测试基于皮肤分析结果的产品推荐功能
4. **历史记录**：测试皮肤分析历史记录的保存和查询功能
5. **边界情况**：测试图片上传失败、API 调用失败等异常情况

## 文件清单

### 已更新的环境变量文件
- ✅ `server/.env.local`
- ✅ `server/.env.production`
- ✅ `server/.env.wechat-cloud`
- ✅ `server/.env.local.example`

### 已更新的代码文件
- ✅ `server/src/skin/skin.service.ts`
- ✅ `server/src/skin/product.service.ts`

### 已更新的脚本文件
- ✅ `server/deploy-cloud-hosting.sh`
- ✅ `server/test-config.js`
- ✅ `server/verify-api-config.js`
- ✅ `server/batch-update-config.js`

### 已更新的文档文件
- ✅ `server/CLOUD_HOSTING_ENV_SETUP.md`
- ✅ `server/WECHAT_CLOUD_HOSTING_ENV_CONFIG.md`

### 删除的文件
- ✅ `server/main.ts` (重复文件)

## 下一步

1. ✅ 完成配置更新
2. ✅ 代码适配新 API 格式
3. ✅ 修复编译问题
4. ✅ 验证配置正确性
5. ⏳ 本地功能测试
6. ⏳ 部署到微信云托管
7. ⏳ 线上功能验证

## 联系支持

如果遇到问题，请检查：

1. 环境变量是否正确配置
2. API Key 是否有效
3. 模型端点是否可用
4. 网络连接是否正常
5. 查看服务器日志获取详细错误信息

---

**更新日期：** 2025-03-24
**版本：** 1.0.0
**状态：** ✅ 已完成

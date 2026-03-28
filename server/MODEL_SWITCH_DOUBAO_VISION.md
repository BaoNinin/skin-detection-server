# 豆包模型切换总结 - doubao-1-5-vision-pro-32k-250115

## 更新概述

从豆包端点模型 `ep-20260324135258-7shrd` 切换到官方豆包视觉模型 `doubao-1-5-vision-pro-32k-250115`。

## 模型对比

| 特性 | 旧模型 (端点) | 新模型 (官方) |
|------|--------------|--------------|
| 模型名称 | `ep-20260324135258-7shrd` | `doubao-1-5-vision-pro-32k-250115` |
| 模型类型 | 自定义端点模型 | 官方视觉模型 |
| 视觉能力 | ✅ 支持图片分析 | ✅ 支持图片分析 |
| API 端点 | `/api/v3/chat/completions` | `/api/v3/chat/completions` |
| API Key | `654a810c-bc85-44b1-8d21-ab53cbdf5d26` | `654a810c-bc85-44b1-8d21-ab53cbdf5d26` |
| 测试状态 | ❌ 未测试 | ✅ 测试成功 |

## API 测试结果

### 测试命令

```bash
curl https://ark.cn-beijing.volces.com/api/v3/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 654a810c-bc85-44b1-8d21-ab53cbdf5d26" \
  -d '{
    "model": "doubao-1-5-vision-pro-32k-250115",
    "messages": [
      {
        "content": [
          {
            "image_url": {
              "url": "https://ark-project.tos-cn-beijing.ivolces.com/images/view.jpeg"
            },
            "type": "image_url"
          },
          {
            "text": "图片主要讲了什么?",
            "type": "text"
          }
        ],
        "role": "user"
      }
    ]
  }'
```

### 测试结果

✅ **测试成功**

```json
{
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "content": "这幅图主要展现了一幅户外自然美景。画面中，一个人正划着橙色皮划艇在平静的湖面上前行。远岸是茂密的森林，更远处则是巍峨连绵、覆盖着积雪的山脉，天空呈现出淡蓝色，飘着些许云彩。整体场景静谧而美好，给人一种远离喧嚣、亲近自然的感觉。",
        "role": "assistant"
      }
    }
  ],
  "created": 1774335206,
  "id": "021774335203377f74590442eab0123ecdd9df6ba66d3a9c7ff37",
  "model": "doubao-1-5-vision-pro-32k-250115",
  "object": "chat.completion",
  "usage": {
    "completion_tokens": 78,
    "prompt_tokens": 520,
    "total_tokens": 598
  }
}
```

## 配置变更

### 环境变量

| 文件 | 变更 |
|------|------|
| `.env.local` | `COZE_MODEL` → `doubao-1-5-vision-pro-32k-250115` |
| `.env.production` | `COZE_MODEL` → `doubao-1-5-vision-pro-32k-250115` |
| `.env.wechat-cloud` | `COZE_MODEL` → `doubao-1-5-vision-pro-32k-250115` |
| `.env.local.example` | `COZE_MODEL` → `doubao-1-5-vision-pro-32k-250115` |

### 代码文件

| 文件 | 变更 |
|------|------|
| `src/skin/skin.service.ts` | 默认模型 → `doubao-1-5-vision-pro-32k-250115` |
| `src/skin/product.service.ts` | 硬编码模型 → `doubao-1-5-vision-pro-32k-250115` |

### 脚本文件

| 文件 | 变更 |
|------|------|
| `deploy-cloud-hosting.sh` | 环境变量 → `doubao-1-5-vision-pro-32k-250115` |
| `deploy-wechat-cloud.sh` | 环境变量 → `doubao-1-5-vision-pro-32k-250115` |
| `test-config.js` | 验证逻辑 → `doubao-1-5-vision-pro-32k-250115` |
| `verify-api-config.js` | 验证逻辑 → `doubao-1-5-vision-pro-32k-250115` |

### 文档文件

| 文件 | 变更 |
|------|------|
| `CLOUD_HOSTING_ENV_SETUP.md` | 文档说明 → `doubao-1-5-vision-pro-32k-250115` |

## 配置验证

### 本地验证

```bash
cd server
node test-config.js
```

**输出结果**：
```
=== 豆包视觉模型配置检查 ===

1. API Key: 654a810c-bc85-44b1-8d21-ab53cbdf5d26
2. 模型名称: doubao-1-5-vision-pro-32k-250115
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
cd server
pnpm build
```

**输出结果**：
```
> server@1.0.0 build
> nest build

✅ 编译成功
```

## Git 提交

### Commit 信息

```
feat: 切换到豆包视觉模型 doubao-1-5-vision-pro-32k-250115

## 模型变更
- 旧模型: ep-20260324135258-7shrd (端点模型)
- 新模型: doubao-1-5-vision-pro-32k-250115 (官方视觉模型)

## 已测试
- ✅ API 测试成功，正常返回响应
- ✅ 配置验证通过
- ✅ 代码编译成功

## 更新文件
- 所有环境变量配置文件
- skin.service.ts 和 product.service.ts
- 部署脚本和验证脚本
- 相关文档
```

### Commit ID

```
b819532
```

## 部署状态

### 本地状态

- ✅ 代码已更新
- ✅ 配置已验证
- ✅ 编译成功
- ✅ 已推送到 GitHub

### 微信云托管状态

- ⏳ 正在自动构建新版本
- ⏳ 预计部署时间：3-5 分钟
- ⏳ 等待部署完成

## 部署后验证

### 1. 查看日志

```bash
tcb logs --service-name skin-detection-server --latest
```

**期望看到的日志**：
```
SkinService 初始化完成，使用模型: doubao-1-5-vision-pro-32k-250115
使用豆包视觉模型进行皮肤分析
使用云存储保存图片
✅ Server running on http://localhost:80
```

### 2. 测试皮肤分析功能

上传一张皮肤照片，查看分析结果是否正常。

**期望结果**：
- 服务器成功调用 API
- 返回根据图片内容不同的分析结果
- 不再出现"数据完全相同"的问题

## 可能的问题

### 问题 1：容器仍使用旧模型

**症状**：日志显示 `ep-20260324135258-7shrd`

**原因**：微信云托管还在使用旧版本镜像

**解决方案**：
- 等待 3-5 分钟让新版本部署完成
- 或在控制台手动触发重新部署

### 问题 2：API 调用失败

**症状**：返回错误 `model not found` 或 `invalid model`

**原因**：模型名称错误或模型不可用

**解决方案**：
- 确认模型名称拼写正确
- 联系豆包客服确认模型可用性

### 问题 3：结果仍相同

**症状**：每次皮肤分析返回相同数据

**原因**：可能是提示词或图片上传问题

**解决方案**：
- 查看日志确认 API 是否被调用
- 尝试使用不同的图片测试
- 增加 `temperature` 参数（已设置为 0.7）

## 技术细节

### 模型特性

**doubao-1-5-vision-pro-32k-250115**：
- 支持图像理解
- 支持 32K 上下文
- 高级视觉能力
- 稳定的 API 接口

### API 格式

**请求格式**（保持不变）：
```json
{
  "model": "doubao-1-5-vision-pro-32k-250115",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "image_url",
          "image_url": { "url": "data:image/jpeg;base64,..." }
        },
        {
          "type": "text",
          "text": "分析这张照片的皮肤状态"
        }
      ]
    }
  ],
  "max_tokens": 2000,
  "temperature": 0.7
}
```

**响应格式**（保持不变）：
```json
{
  "choices": [
    {
      "message": {
        "content": "{皮肤分析结果JSON}"
      }
    }
  ]
}
```

## 下一步

1. ✅ 代码已更新
2. ✅ 配置已验证
3. ✅ 已推送到 GitHub
4. ⏳ 等待微信云托管自动部署（3-5 分钟）
5. ⏳ 验证部署成功
6. ⏳ 测试皮肤分析功能
7. ⏳ 确认结果是否多样化

## 联系支持

如有问题，请提供：
1. 微信云托管日志
2. 环境变量配置（脱敏）
3. 测试图片（脱敏）
4. API 调用和响应内容

---

**更新时间**: 2025-03-24
**Commit**: `b819532`
**状态**: ✅ 已完成并推送

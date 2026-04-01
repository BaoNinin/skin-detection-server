# 豆包模型更换总结

## 更新内容

### 新配置信息
- **API Key**: `ea77474e-46bb-4f4e-a42f-99dedce29678`
- **模型名称**: `doubao-seed-1-6-vision-250815`
- **API 地址**: `https://ark.cn-beijing.volces.com/api/v3/responses`

### API 格式变化

#### 旧格式（Chat Completions API）
```json
{
  "model": "doubao-1-5-vision-pro-32k-250115",
  "messages": [
    {
      "role": "system",
      "content": "..."
    },
    {
      "role": "user",
      "content": [
        { "type": "text", "text": "..." },
        { "type": "image_url", "image_url": { "url": "...", "detail": "high" } }
      ]
    }
  ],
  "temperature": 0.1,
  "max_tokens": 2000
}
```

#### 新格式（Responses API）
```json
{
  "model": "doubao-seed-1-6-vision-250815",
  "input": [
    {
      "role": "user",
      "content": [
        { "type": "input_image", "image_url": "..." },
        { "type": "input_text", "text": "..." }
      ]
    }
  ]
}
```

### 已更新的文件

#### 环境变量文件
- ✅ `.env.local`
- ✅ `.env.production`
- ✅ `.env.wechat-cloud`
- ✅ `.env.local.example`

#### 代码文件
- ✅ `server/src/skin/skin.service.ts`
  - 更新 API 请求格式
  - 更新响应解析逻辑
  - 更新默认模型名称
- ✅ `server/src/skin/product.service.ts`
  - 更新模型名称

#### 测试和验证脚本
- ✅ `server/test-config.js`
- ✅ `server/verify-api-config.js`
- ✅ `server/batch-update-config.js`（新增）

#### 文档文件（需要批量更新）
运行以下命令更新所有文档：
```bash
cd E:\美容小程序1\projects\server
node batch-update-config.js
```

文档列表：
- QUICK_REFERENCE.md
- CLOUD_HOSTING_QUICK_START.md
- SIMPLE_DEPLOY_GUIDE.md
- UPDATED_CLI_COMMANDS_GUIDE.md
- GIT_DEPLOYMENT_GUIDE.md
- WECHAT_CLOUD_HOSTING_DETAILED_GUIDE.md
- DEPLOYMENT_FIX_SUMMARY.md
- GITHUB_DEPLOYMENT_CHECKLIST.md
- CLOUD_HOSTING_CLI_GUIDE.md
- DEPLOYMENT_GUIDE.md
- WECHAT_CLOUD_HOSTING_DEPLOYMENT_GUIDE.md
- UPDATED_CLOUD_HOSTING_GUIDE.md
- DETAILED_CONFIG_GUIDE.md
- PROJECT_BINDING_INFO.md
- CLOUD_BASE_DEPLOYMENT_GUIDE.md
- AI_FEATURE_COMPARISON.md
- CONFIG_SUMMARY.md
- server/CLOUD_HOSTING_ENV_SETUP.md
- server/deploy-cloud-hosting.sh
- server/CLOUD_HOSTING_DEPLOYMENT_GUIDE.md
- server/CLOUD_HOSTING_ENV_CONFIG.txt
- server/DEPLOYMENT_QUICK_REFERENCE.md

## 验证步骤

### 1. 本地配置检查
```powershell
cd E:\美容小程序1\projects\server
node test-config.js
```

预期输出：
```
✅ API Key: ea77474e-46bb-4f4e-a42f-99dedce29678
✅ 模型名称: doubao-seed-1-6-vision-250815
✅ API 地址: https://ark.cn-beijing.volces.com/api/v3/responses
✅ 使用真实 API（非模拟数据）
```

### 2. 启动开发服务器
```powershell
cd E:\美容小程序1\projects
pnpm dev
```

### 3. API 配置验证
```powershell
cd E:\美容小程序1\projects\server
node verify-api-config.js
```

### 4. 测试皮肤检测功能
- 打开微信开发者工具
- 进行皮肤检测
- 查看服务器日志，确认使用新模型

## 重要变化

### API 请求格式
1. **端点**: 从 `/api/v3/chat/completions` 改为 `/api/v3/responses`
2. **请求体结构**: 从 `messages` 改为 `input`
3. **内容类型**: 从 `image_url` 改为 `input_image`，从 `text` 改为 `input_text`
4. **移除参数**: 移除了 `temperature` 和 `max_tokens` 参数

### 响应解析
新增了对新 API 响应格式的兼容处理：
```javascript
// 尝试从新 API 格式中提取内容
if (responseData.output && responseData.output.length > 0) {
  const output = responseData.output[0];
  if (output.content && output.content.length > 0) {
    const contentItem = output.content[0];
    if (contentItem.type === 'output_text' && contentItem.text) {
      responseContent = contentItem.text;
    }
  }
}
```

## 下一步操作

1. **更新文档配置**（推荐）
   ```powershell
   cd E:\美容小程序1\projects\server
   node batch-update-config.js
   ```

2. **重启开发服务器**
   - 如果服务器正在运行，先停止（Ctrl + C）
   - 重新启动：`pnpm dev`

3. **验证配置**
   - 运行 `node test-config.js`
   - 运行 `node verify-api-config.js`

4. **测试功能**
   - 在微信开发者工具中测试皮肤检测
   - 查看服务器日志确认使用新模型

5. **提交更改**
   ```bash
   git add .
   git commit -m "feat: 更换豆包视觉模型为 doubao-seed-1-6-vision-250815"
   ```

## 注意事项

1. **API Key 安全**: 请勿将新的 API Key 提交到公共仓库
2. **响应格式变化**: 如果 API 响应格式有变，可能需要调整解析逻辑
3. **错误处理**: 已添加兼容多种响应格式的错误处理
4. **日志输出**: 保留了详细的日志输出，便于调试

## 回滚方案

如果需要回滚到旧配置：

1. 恢复环境变量文件中的 API Key 和模型名称
2. 恢复 `skin.service.ts` 中的 API 请求格式
3. 重启开发服务器

或者使用 Git 回滚：
```bash
git checkout HEAD~1 -- server/.env.local server/src/skin/skin.service.ts
```

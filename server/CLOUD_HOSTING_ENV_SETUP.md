# 微信云托管环境变量配置指南

## 📋 环境变量列表

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `COZE_API_KEY` | `ea77474e-46bb-4f4e-a42f-99dedce29678` | 豆包视觉模型 API Key |
| `COZE_MODEL` | `doubao-1-5-vision-pro-32k-250115` | 豆包视觉模型名称 |
| `WECHAT_APP_ID` | `wxf218fed093b4e374` | 微信小程序 AppID |
| `WECHAT_APP_SECRET` | `a869daf192fc52fddd1ac6269948e749` | 微信小程序密钥 |
| `CLOUDBASE_ENV_ID` | `cloud1-7gi0fykp49ab039a` | 腾讯云开发环境 ID |
| `NODE_ENV` | `production` | 运行环境 |

## 🔧 配置步骤

### 方法一：通过微信云托管控制台配置

1. **登录微信云托管控制台**
   - 访问：https://console.cloud.tencent.com/tcb/service
   - 选择环境：`prod-8g9r8x6c43dcafcb`
   - 选择服务：`skin-detection-api`

2. **进入环境变量配置页面**
   - 点击「服务配置」
   - 找到「环境变量」部分
   - 点击「编辑」或「添加」

3. **添加环境变量**
   逐个添加以下环境变量：

   ```
   COZE_API_KEY=ea77474e-46bb-4f4e-a42f-99dedce29678
   COZE_MODEL=doubao-1-5-vision-pro-32k-250115
   WECHAT_APP_ID=wxf218fed093b4e374
   WECHAT_APP_SECRET=a869daf192fc52fddd1ac6269948e749
   CLOUDBASE_ENV_ID=cloud1-7gi0fykp49ab039a
   NODE_ENV=production
   ```

4. **保存并重启服务**
   - 点击「保存」
   - 系统会自动重启服务使配置生效

### 方法二：通过 Cloud CLI 配置

使用腾讯云 CLI 工具批量配置环境变量：

```bash
# 设置服务环境变量
tcb env set \
  --env-id prod-8g9r8x6c43dcafcb \
  --service skin-detection-api \
  --env-vars 'COZE_API_KEY=ea77474e-46bb-4f4e-a42f-99dedce29678' \
  --env-vars 'COZE_MODEL=doubao-1-5-vision-pro-32k-250115' \
  --env-vars 'WECHAT_APP_ID=wxf218fed093b4e374' \
  --env-vars 'WECHAT_APP_SECRET=a869daf192fc52fddd1ac6269948e749' \
  --env-vars 'CLOUDBASE_ENV_ID=cloud1-7gi0fykp49ab039a' \
  --env-vars 'NODE_ENV=production'
```

### 方法三：通过部署脚本配置（推荐）

使用项目中的部署脚本自动配置：

```bash
cd server
./deploy-cloud-hosting.sh
```

脚本会自动读取 `CLOUD_HOSTING_ENV_CONFIG.json` 文件并配置环境变量。

## ✅ 配置验证

### 1. 检查环境变量是否生效

在服务日志中查看环境变量：

```bash
# 查看服务日志
tcb logs list \
  --env-id prod-8g9r8x6c43dcafcb \
  --service skin-detection-api \
  --limit 100
```

### 2. 测试 API 接口

访问健康检查接口：

```bash
curl https://skin-detection-api-237195-6-1414623738.sh.run.tcloudbase.com/health
```

返回 `{ "status": "ok" }` 表示服务正常运行。

### 3. 测试皮肤分析接口

```bash
curl -X POST \
  https://skin-detection-api-237195-6-1414623738.sh.run.tcloudbase.com/api/skin/analyze \
  -H "Content-Type: application/json" \
  -d '{ "imageUrl": "https://example.com/skin-image.jpg" }'
```

## ⚠️ 注意事项

### 安全提示

1. **密钥保护**
   - 不要将 `.env` 文件提交到 Git
   - 不要在公开的代码中暴露 `WECHAT_APP_SECRET` 和 `COZE_API_KEY`
   - 定期轮换 API 密钥

2. **环境隔离**
   - 开发环境、测试环境、生产环境使用不同的环境变量
   - 生产环境使用独立的密钥和配置

### 配置最佳实践

1. **使用配置管理工具**
   - 腾讯云 Secret Manager（密钥管理服务）
   - GitHub Secrets（用于 CI/CD）

2. **环境变量命名规范**
   - 使用大写字母和下划线
   - 使用前缀区分不同服务（如 `DB_`、`API_`、`AUTH_`）

3. **配置文档**
   - 保存配置变更记录
   - 维护配置文档说明每个变量的用途

## 📞 故障排查

### 问题 1：服务启动失败

**症状**：服务无法启动，日志中出现 `undefined` 错误

**解决方案**：
1. 检查所有必需的环境变量是否已配置
2. 确认环境变量名称拼写正确
3. 验证环境变量值是否正确（特别是密钥）

### 问题 2：API 调用失败

**症状**：API 返回 401 或 403 错误

**解决方案**：
1. 检查 `COZE_API_KEY` 和 `WECHAT_APP_SECRET` 是否正确
2. 确认密钥未过期
3. 查看服务日志中的详细错误信息

### 问题 3：数据库连接失败

**症状**：服务无法连接到云数据库

**解决方案**：
1. 检查 `CLOUDBASE_ENV_ID` 是否正确
2. 确认云开发环境存在且处于正常状态
3. 验证服务是否有访问云数据库的权限

## 📚 相关文档

- [微信云托管官方文档](https://cloud.tencent.com/document/product/1243)
- [环境变量配置说明](https://cloud.tencent.com/document/product/1243/44646)
- [腾讯云 CLI 工具](https://cloud.tencent.com/document/product/1103/31373)

---

**更新时间**：2026-03-21
**维护者**：开发团队
**版本**：1.0

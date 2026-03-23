# 云托管部署快速参考

## 🔑 环境变量

```bash
COZE_API_KEY=8f38a8d0-b6d4-481c-8e15-b93bb30c7444
COZE_MODEL=doubao-1-5-vision-pro-32k-250115
CLOUDBASE_ENV_ID=cloud1-9gz0vft7d1ddce7f
NODE_ENV=production
```

## 🚀 一键部署

```bash
cd server
chmod +x deploy-cloud-hosting.sh
bash deploy-cloud-hosting.sh
```

## 📝 常用 CLI 命令

### 构建 Docker 镜像
```bash
tcb run build
```

### 部署服务
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
  --env COZE_API_KEY=8f38a8d0-b6d4-481c-8e15-b93bb30c7444 \
  --env COZE_MODEL=doubao-1-5-vision-pro-32k-250115 \
  --env CLOUDBASE_ENV_ID=cloud1-9gz0vft7d1ddce7f \
  --env NODE_ENV=production
```

### 查看服务列表
```bash
tcb run service:list --env-id cloud1-9gz0vft7d1ddce7f
```

### 查看日志
```bash
tcb run logs --env-id cloud1-9gz0vft7d1ddce7f
```

### 查看环境列表
```bash
tcb env list
```

## 🌐 小程序配置

### 服务器域名配置

登录 https://mp.weixin.qq.com/，配置以下域名:

| 类型 | 域名 |
|------|------|
| request 合法域名 | `https://<云托管服务地址>.tcb.qcloud.la` |
| uploadFile 合法域名 | `https://<云托管服务地址>.tcb.qcloud.la` |
| downloadFile 合法域名 | `https://<云托管服务地址>.tcb.qcloud.la` |

### 更新小程序代码

修改 `src/network/index.ts`:
```typescript
const PROJECT_DOMAIN = 'https://<云托管服务地址>.tcb.qcloud.la'
```

## 🧪 接口测试

### 健康检查
```bash
curl https://<云托管服务地址>.tcb.qcloud.la/api
```

### 皮肤分析
```bash
curl -X POST https://<云托管服务地址>.tcb.qcloud.la/api/skin/analyze \
  -H "Content-Type: application/json" \
  -d '{"imageUrl":"https://example.com/image.jpg","userId":"test"}'
```

### 获取历史记录
```bash
curl https://<云托管服务地址>.tcb.qcloud.la/api/skin/history?userId=test
```

## 🔧 控制台地址

- 云开发控制台: https://console.cloud.tencent.com/tcb/env
- 小程序后台: https://mp.weixin.qq.com/

## 📊 监控页面

- 云托管服务: 控制台 > 云托管 > 服务
- 云数据库: 控制台 > 数据库
- 云存储: 控制台 > 云存储
- 日志查看: 控制台 > 云托管 > 服务 > 日志

## ⚠️ 常见问题

### 健康检查失败
- 检查 Dockerfile 是否暴露 80 端口
- 检查 main.ts 是否监听 80 端口
- 查看云托管日志排查错误

### 小程序请求失败
- 检查服务器域名配置
- 确认使用 HTTPS 协议
- 检查小程序是否已发布

### 豆包模型调用失败
- 检查 COZE_API_KEY 环境变量
- 查看云托管日志确认错误

### 云数据库查询失败
- 检查 CLOUDBASE_ENV_ID 环境变量
- 确认数据库集合已创建

## 📞 帮助文档

- [微信云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
- [云托管文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/run/)
- [CloudBase CLI 文档](https://docs.cloudbase.net/cli/)

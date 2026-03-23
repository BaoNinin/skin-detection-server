# 微信云托管部署完整指南

## 📋 前置条件

### 1. 开通云托管服务
- 登录[微信云开发控制台](https://console.cloud.tencent.com/tcb/env)
- 选择环境: `cloud1-9gz0vft7d1ddce7f`
- 开通"云托管"服务（首次开通可能需要实名认证）

### 2. 安装 CloudBase CLI
```bash
npm install -g @cloudbase/cli
```

### 3. 登录微信云开发
```bash
tcb login
```
扫码登录微信开发者账号

---

## 🚀 部署方式

### 方式一：CLI 一键部署（推荐）

#### 1. 修改权限
```bash
cd server
chmod +x deploy-cloud-hosting.sh
```

#### 2. 执行部署脚本
```bash
bash deploy-cloud-hosting.sh
```

#### 3. 等待部署完成
- 部署时间约 2-5 分钟
- 可以在微信云开发控制台查看实时日志

---

### 方式二：手动 CLI 命令

#### 步骤 1: 构建 Docker 镜像
```bash
cd server
tcb run build
```

#### 步骤 2: 部署服务
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

#### 步骤 3: 查看部署状态
```bash
tcb run service:list --env-id cloud1-9gz0vft7d1ddce7f
```

---

### 方式三：控制台部署（代码包）

#### 步骤 1: 打包代码
```bash
cd server
tar -czf server-deploy.tar.gz \
  --exclude=node_modules \
  --exclude=dist \
  --exclude=.git \
  --exclude=patches \
  --exclude=*.log \
  .
```

#### 步骤 2: 上传到云托管
1. 登录[微信云开发控制台](https://console.cloud.tencent.com/tcb/env)
2. 选择环境: `cloud1-9gz0vft7d1ddce7f`
3. 进入"云托管" > "服务" > "新建服务"
4. 服务名称: `skin-detection-server`
5. 上传代码包: 选择 `server-deploy.tar.gz`
6. 配置环境变量（见下方环境变量配置）
7. 点击"部署"

---

## 🔧 环境变量配置

### 必须配置的环境变量

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `COZE_API_KEY` | `8f38a8d0-b6d4-481c-8e15-b93bb30c7444` | 豆包视觉模型 API Key |
| `COZE_MODEL` | `doubao-1-5-vision-pro-32k-250115` | 豆包视觉模型名称 |
| `CLOUDBASE_ENV_ID` | `cloud1-9gz0vft7d1ddce7f` | 云开发环境 ID |
| `NODE_ENV` | `production` | 运行环境 |

### 配置方式

**CLI 命令配置**:
```bash
--env COZE_API_KEY=pat_xxx --env COZE_MODEL=doubao-1-5-vision-pro-32k-250115 ...
```

**控制台配置**:
在云托管服务设置中添加环境变量

---

## 🌐 获取云托管服务地址

部署成功后，可以在云开发控制台获取服务地址：

1. 登录[微信云开发控制台](https://console.cloud.tencent.com/tcb/env)
2. 选择环境: `cloud1-9gz0vft7d1ddce7f`
3. 进入"云托管" > "服务"
4. 找到 `skin-detection-server` 服务
5. 查看服务地址，格式为: `https://<service-name>-xxx.tcb.qcloud.la`

---

## 📱 配置小程序服务器域名

### 1. 登录微信小程序后台
访问: https://mp.weixin.qq.com/

### 2. 配置服务器域名
- 进入: 开发 > 开发管理 > 开发设置 > 服务器域名
- 添加以下域名:

| 域名类型 | 域名 |
|----------|------|
| request 合法域名 | `https://<云托管服务地址>.tcb.qcloud.la` |
| uploadFile 合法域名 | `https://<云托管服务地址>.tcb.qcloud.la` |
| downloadFile 合法域名 | `https://<云托管服务地址>.tcb.qcloud.la` |

### 3. 更新小程序代码

修改 `src/network/index.ts`:
```typescript
const PROJECT_DOMAIN = 'https://<云托管服务地址>.tcb.qcloud.la'
```

---

## 🧪 测试部署

### 1. 健康检查
```bash
curl https://<云托管服务地址>.tcb.qcloud.la/api
```

预期响应:
```json
{
  "message": "API is running",
  "timestamp": 1234567890
}
```

### 2. 皮肤分析接口测试
```bash
curl -X POST https://<云托管服务地址>.tcb.qcloud.la/api/skin/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/skin-image.jpg",
    "userId": "test-user"
  }'
```

### 3. 查看云数据库数据
1. 登录[微信云开发控制台](https://console.cloud.tencent.com/tcb/env)
2. 选择环境: `cloud1-9gz0vft7d1ddce7f`
3. 进入"数据库"
4. 查看数据是否正确保存

### 4. 查看云存储文件
1. 登录[微信云开发控制台](https://console.cloud.tencent.com/tcb/env)
2. 选择环境: `cloud1-9gz0vft7d1ddce7f`
3. 进入"云存储"
4. 查看上传的图片文件

---

## 🔍 常见问题

### Q1: 部署失败，提示"环境不存在"
**解决方法**:
1. 确认环境 ID 正确: `cloud1-9gz0vft7d1ddce7f`
2. 确认已开通云托管服务
3. 使用 `tcb env list` 查看可用环境

### Q2: 健康检查失败
**解决方法**:
1. 确认 Dockerfile 中暴露了 80 端口: `EXPOSE 80`
2. 确认应用监听在 80 端口（main.ts 中已自动处理）
3. 查看云托管日志: `tcb run logs --env-id cloud1-9gz0vft7d1ddce7f`

### Q3: 小程序请求失败（request:fail）
**解决方法**:
1. 确认已配置服务器域名（request 合法域名）
2. 确认域名使用 HTTPS 协议
3. 确认小程序已发布或使用真机调试

### Q4: 豆包模型调用失败
**解决方法**:
1. 确认 `COZE_API_KEY` 环境变量已正确配置
2. 检查 API Key 是否有效
3. 查看云托管日志，确认具体错误信息

### Q5: 云数据库查询失败
**解决方法**:
1. 确认 `CLOUDBASE_ENV_ID` 环境变量已正确配置
2. 确认数据库集合已创建（首次运行会自动创建）
3. 检查数据库权限配置

---

## 📊 监控与日志

### 查看实时日志
```bash
tcb run logs --env-id cloud1-9gz0vft7d1ddce7f
```

### 查看服务状态
```bash
tcb run service:list --env-id cloud1-9gz0vft7d1ddce7f
```

### 控制台查看
登录[微信云开发控制台](https://console.cloud.tencent.com/tcb/env):
- 云托管 > 服务 > 日志
- 数据库 > 日志
- 云存储 > 日志

---

## 🔄 更新部署

### 更新代码后重新部署
```bash
cd server
bash deploy-cloud-hosting.sh
```

### 或使用手动命令
```bash
tcb run build
tcb run service:deploy --env-id cloud1-9gz0vft7d1ddce7f ...
```

---

## 📞 技术支持

如遇到问题，请查看:
1. [微信云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
2. [云托管文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/run/)
3. [CloudBase CLI 文档](https://docs.cloudbase.net/cli/)

---

## ✅ 部署检查清单

- [ ] 已开通云托管服务
- [ ] 已安装 CloudBase CLI 并登录
- [ ] 已配置环境变量（COZE_API_KEY, COZE_MODEL, CLOUDBASE_ENV_ID）
- [ ] Dockerfile 正确配置（暴露 80 端口）
- [ ] 部署成功，服务运行正常
- [ ] 已配置小程序服务器域名
- [ ] 已更新小程序代码中的 PROJECT_DOMAIN
- [ ] 测试健康检查接口
- [ ] 测试皮肤分析接口
- [ ] 验证云数据库数据保存
- [ ] 验证云存储文件上传

---

**部署完成后，您的智能皮肤检测小程序后端将运行在微信云托管上，享受高可用、自动扩缩容、无需运维的优势！** 🎉

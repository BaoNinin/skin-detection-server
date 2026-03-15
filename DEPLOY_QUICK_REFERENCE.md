# 云托管部署 - 快速参考卡片

## 📦 代码包信息

- **文件名**：`server-deploy.zip`
- **大小**：38KB
- **位置**：项目根目录

---

## 🔧 服务配置

| 配置项 | 值 |
|--------|-----|
| 服务名称 | `skin-detection-server` |
| 运行环境 | Node.js 18.x |
| CPU | 0.5 核 |
| 内存 | 1GB |
| 实例数 | 1 |
| 容器端口 | 80 |

---

## 🔐 环境变量

| 变量名 | 变量值 |
|--------|--------|
| `COZE_API_KEY` | `pat_ShNM7FfPFQdTtQ8cTfpOzo3W0eMeMrBYLvJArawGAm6gwUC9hiBoHZbd2xDs1iZh` |
| `COZE_MODEL` | `doubao-vision` |
| `CLOUDBASE_ENV_ID` | `cloud1-9gz0vft7d1ddce7f` |
| `NODE_ENV` | `production` |

---

## 🌐 部署地址

**云开发控制台**：https://console.cloud.tencent.com/tcb/env

**环境 ID**：`cloud1-9gz0vft7d1ddce7f`

---

## 📱 小程序配置

### 1. 修改 `.env.local`

```bash
PROJECT_DOMAIN=https://<云托管服务地址>.tcb.qcloud.la
```

### 2. 配置小程序域名白名单

**小程序后台**：https://mp.weixin.qq.com/

**路径**：开发 > 开发管理 > 开发设置 > 服务器域名

**需要添加的域名**：
- request 合法域名：`https://<云托管服务地址>.tcb.qcloud.la`
- uploadFile 合法域名：`https://<云托管服务地址>.tcb.qcloud.la`
- downloadFile 合法域名：`https://<云托管服务地址>.tcb.qcloud.la`

---

## 🧪 测试接口

```bash
# 健康检查
curl https://<云托管服务地址>.tcb.qcloud.la/api

# 登录接口
curl -X POST https://<云托管服务地址>.tcb.qcloud.la/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"code":"test-code","userInfo":null}'
```

---

## ✅ 部署步骤

1. ✅ 下载代码包 `server-deploy.zip`
2. ✅ 登录云开发控制台
3. ✅ 进入云托管 > 新建服务
4. ✅ 填写服务配置（参考上方表格）
5. ✅ 上传代码包
6. ✅ 配置环境变量（参考上方表格）
7. ✅ 点击部署
8. ✅ 等待 2-5 分钟
9. ✅ 获取服务地址
10. ✅ 配置小程序域名
11. ✅ 测试接口

---

## 📞 快速帮助

- 📖 完整指南：查看 `CLOUD_HOSTING_CONSOLE_DEPLOY_GUIDE.md`
- 🌐 云开发控制台：https://console.cloud.tencent.com/tcb/env
- 📱 小程序后台：https://mp.weixin.qq.com/

---

**部署时间**：约 5-10 分钟

**预计费用**：免费额度内（每月 5000 CPU 秒，5GB 流量）

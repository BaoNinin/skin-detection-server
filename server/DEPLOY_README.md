# 微信云托管部署文件说明

## 📁 文件列表

### 核心配置文件

| 文件名 | 说明 | 用途 |
|--------|------|------|
| `Dockerfile` | Docker 容器配置 | 定义如何构建和运行后端服务 |
| `cloudbaserc.json` | 微信云托管配置 | 服务规格、环境变量、端口配置 |
| `.dockerignore` | Docker 忽略文件 | 排除不需要打包的文件 |

### 部署工具

| 文件名 | 说明 | 适用系统 |
|--------|------|----------|
| `package.sh` | 代码打包脚本 | Linux / macOS |
| `package.bat` | 代码打包脚本 | Windows |
| `verify.sh` | 服务验证脚本 | Linux / macOS |

### 文档

| 文件名 | 说明 |
|--------|------|
| `QUICK_DEPLOY.md` | 快速部署指南（5分钟完成） |
| `DEPLOY_WECHAT_CLOUD.md` | 详细部署指南 |
| `.env.wechat-cloud` | 环境变量模板（仅供参考） |

---

## 🚀 快速开始

### 1. 打包代码

**Linux / macOS**:
```bash
cd server
chmod +x package.sh
./package.sh
```

**Windows**:
```cmd
cd server
package.bat
```

### 2. 部署到微信云托管

1. 访问 [腾讯云云托管控制台](https://console.cloud.tencent.com/tcb)
2. 新建环境
3. 新建服务
4. 上传打包文件 `skin-analysis-api.zip`
5. 配置环境变量（见下方）
6. 部署服务

### 3. 配置环境变量

在微信云托管控制台添加以下环境变量：

| 变量名 | 变量值 |
|--------|--------|
| `COZE_SUPABASE_URL` | `https://pacqfzvxkiobtxbjubil.supabase.co` |
| `COZE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `WECHAT_APPID` | `wxa1c57025b508e913` |
| `WECHAT_APPSECRET` | `056dc956b934bf58fc659c4b08bfa16e` |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |

### 4. 验证服务

**Linux / macOS**:
```bash
chmod +x verify.sh
./verify.sh https://your-service-url
```

**Windows (PowerShell)**:
```powershell
curl https://your-service-url/api/skin/history?userId=1
```

### 5. 配置小程序域名

在 [微信公众平台](https://mp.weixin.qq.com) 配置服务器域名。

---

## 📊 配置信息汇总

### ✅ 已配置

| 配置项 | 值 | 状态 |
|--------|-----|------|
| 微信小程序 AppID | `wxa1c57025b508e913` | ✅ 已配置 |
| 微信小程序 AppSecret | `056dc956b934bf58fc659c4b08bfa16e` | ✅ 已配置 |
| Supabase URL | `https://pacqfzvxkiobtxbjubil.supabase.co` | ✅ 已配置 |
| Supabase Anon Key | `eyJ...JdZs4` | ✅ 已配置 |

---

## 🔧 常见问题

### Q: 如何更新服务？

A:
1. 修改代码
2. 重新打包
3. 上传新版本到云托管
4. 部署

### Q: 如何查看日志？

A:
1. 进入云托管控制台
2. 选择服务
3. 点击"日志"标签页

### Q: 如何扩容？

A:
1. 进入服务详情
2. 点击"配置"
3. 调整 CPU、内存、副本数

---

## 📞 技术支持

- 详细部署指南：`QUICK_DEPLOY.md`
- 腾讯云文档：https://cloud.tencent.com/document/product/1243
- Supabase 文档：https://supabase.com/docs

---

## 📝 更新日志

### 2026-01-XX
- ✅ 初始化微信云托管配置
- ✅ 配置 Supabase 数据库连接
- ✅ 配置微信小程序信息
- ✅ 创建部署工具和文档

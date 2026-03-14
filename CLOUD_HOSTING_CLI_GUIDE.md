# 🆕 云托管 CLI 部署完整指南（最新版）

根据最新的云开发 CLI 界面，这里提供完整的部署流程。

---

## 🚀 完整部署流程

### 前置检查

在开始之前，确保已完成：

- [x] 已注册/登录微信云开发控制台
- [x] 已创建云开发环境
- [x] 已获取环境 ID
- [x] 已配置 `server/.env.production` 文件
- [x] 已创建数据库集合（`skin_history`、`users`）

---

## 步骤 1️⃣：安装 CLI 工具

```bash
npm install -g @cloudbase/cli
```

验证安装：
```bash
cloudbase -v
```

应该显示版本号，如：
```
@cloudbase/cli@x.x.x
```

---

## 步骤 2️⃣：登录云开发

```bash
cloudbase login
```

会打开浏览器，扫码登录微信账号。

登录成功后，会显示：
```
✓ 登录成功
```

---

## 步骤 3️⃣：确认环境变量已配置

```bash
cd /workspace/projects/server
cat .env.production
```

应该看到：
```bash
COZE_API_KEY=pat_ShNM7FfPFQdTtQ8cTfpOzo3W0eMeMrBYLvJArawGAm6gwUC9hiBoHZbd2xDs1iZh
COZE_MODEL=doubao-vision
CLOUDBASE_ENV_ID=你的环境ID  # 👈 确认已配置
NODE_ENV=production
PORT=3000
```

**如果没有配置 `CLOUDBASE_ENV_ID`，先修改文件：**

```bash
nano .env.production
# 或使用其他编辑器
```

将 `CLOUDBASE_ENV_ID=your-env-id-here` 改为你的实际环境 ID。

---

## 步骤 4️⃣：进入 server 目录

```bash
cd /workspace/projects/server
```

---

## 步骤 5️⃣：初始化项目（可选）

**如果目录中已有 `cloudbaserc.json` 文件，可以跳过此步骤！**

### 情况 A：已有配置文件

检查是否已有配置文件：
```bash
ls cloudbaserc.json
```

如果存在，说明已经配置好了，直接跳到"步骤 6️⃣：部署"。

### 情况 B：没有配置文件

如果不存在，需要初始化：

```bash
cloudbase init
```

**根据实际界面选择**（可能的方式）：

#### 方式 1：选择环境后自动完成
1. 选择环境：选择你的云开发环境
2. 确认信息，按回车完成

#### 方式 2：输入项目信息
1. 选择环境：选择你的云开发环境
2. 项目名称：`nestjs-server`（或按回车使用默认）
3. 项目目录：`.`（当前目录）

#### 方式 3：跳过初始化
如果界面让你选择模板但没有"自定义"选项，可以：
- 选择"空项目"（如果有）
- 或按 `Ctrl + C` 取消
- 手动创建 `cloudbaserc.json` 文件

---

## 步骤 6️⃣：手动创建配置文件（如果初始化失败）

如果 `cloudbase init` 不成功，可以手动创建配置文件：

### 创建 `cloudbaserc.json` 文件

在 `server` 目录下创建 `cloudbaserc.json` 文件：

```bash
nano cloudbaserc.json
```

输入以下内容：

```json
{
  "envId": "你的环境ID",
  "version": "2.0",
  "$schema": "https://framework-1258016615.tcloudbaseapp.com/schema/latest.json",
  "framework": {
    "name": "nestjs-server",
    "plugins": {}
  },
  "services": [
    {
      "name": "nestjs-server",
      "type": "container",
      "containerPort": 3000,
      "cpu": 0.5,
      "mem": 1.0,
      "minNum": 0,
      "maxNum": 10,
      "dockerfile": "./Dockerfile",
      "envVariables": {
        "COZE_API_KEY": "pat_ShNM7FfPFQdTtQ8cTfpOzo3W0eMeMrBYLvJArawGAm6gwUC9hiBoHZbd2xDs1iZh",
        "COZE_MODEL": "doubao-vision",
        "CLOUDBASE_ENV_ID": "你的环境ID",
        "NODE_ENV": "production",
        "PORT": "3000"
      },
      "customLogs": "./logs",
      "volumeMounts": []
    }
  ]
}
```

**重要**：将所有的 `你的环境ID` 替换为你的实际环境 ID。

保存文件：
- Nano：`Ctrl + O` → 回车 → `Ctrl + X`
- Vim：`Esc` → `:wq` → 回车

---

## 步骤 7️⃣：确认 Dockerfile 存在

检查 Dockerfile 是否存在：
```bash
ls Dockerfile
```

如果不存在，创建一个：

```bash
nano Dockerfile
```

输入以下内容：

```dockerfile
# 使用官方 Node.js 18 镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建项目
RUN pnpm build

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["pnpm", "start:prod"]
```

保存文件。

---

## 步骤 8️⃣：确认配置文件正确

检查配置文件：
```bash
cat cloudbaserc.json
```

确认以下内容正确：
- `envId`: 你的环境 ID
- `containerPort`: 3000
- `envVariables.CLOUDBASE_ENV_ID`: 你的环境 ID

---

## 步骤 9️⃣：部署

```bash
cloudbase deploy
```

等待部署完成，会看到类似输出：

```
正在部署服务 nestjs-server...
✓ 构建镜像成功
✓ 推送镜像成功
✓ 部署服务成功

服务地址：
https://xxx-xxx.tcb.qcloud.la
```

**首次部署可能需要 5-10 分钟**，请耐心等待。

---

## 🔟：验证部署

### 1. 获取服务地址

部署成功后，CLI 会显示服务地址，格式如：
```
https://xxx-xxx.tcb.qcloud.la
```

或者在云开发控制台的云托管页面查看。

### 2. 测试服务

```bash
curl https://你的服务ID.tcb.qcloud.la/api/health
```

预期返回：
```json
{
  "status": "success",
  "data": "2026-03-14T..."
}
```

### 3. 查看服务状态

登录云开发控制台：
1. 进入云托管页面
2. 找到你的服务 `nestjs-server`
3. 确认状态为"运行中"

---

## 📝 常见问题

### Q1：`cloudbase init` 提示没有"自定义"选项怎么办？

**A**：
- 检查是否已有 `cloudbaserc.json` 文件
- 如果有，直接跳到部署步骤
- 如果没有，手动创建配置文件（见步骤 6️⃣）

### Q2：部署时提示找不到 Dockerfile 怎么办？

**A**：
- 确认 Dockerfile 在 `server` 目录下
- 如果不存在，手动创建（见步骤 7️⃣）

### Q3：部署失败怎么办？

**A**：
1. 查看错误信息
2. 检查环境变量配置
3. 确认 Dockerfile 格式正确
4. 检查网络连接

### Q4：如何查看部署日志？

**A**：
1. 登录云开发控制台
2. 进入云托管页面
3. 点击服务名称
4. 查看"日志"标签页

### Q5：如何更新服务？

**A**：
```bash
cloudbase deploy
```

重新部署即可。

---

## 🎯 快速部署检查清单

完成以下检查后再部署：

- [x] 已安装 CLI 工具
- [x] 已登录云开发
- [x] `server/.env.production` 中 `CLOUDBASE_ENV_ID` 已配置
- [x] `cloudbaserc.json` 文件已创建
- [x] `Dockerfile` 文件已创建
- [x] 环境变量配置正确
- [x] 端口配置为 3000

---

## 📚 相关文档

- **详细配置指南**：`DETAILED_CONFIG_GUIDE.md`
- **快速参考表**：`QUICK_REFERENCE.md`
- **完整部署指南**：`CLOUD_BASE_DEPLOYMENT_GUIDE.md`
- **云托管部署指南（更新版）**：`UPDATED_CLOUD_HOSTING_GUIDE.md`
- **CLI 部署完整指南（最新版）**：`CLOUD_HOSTING_CLI_GUIDE.md`（本文档）

---

## 🚀 一键部署脚本

如果想更简单，可以创建一个部署脚本：

创建 `deploy.sh` 文件：

```bash
#!/bin/bash

echo "开始部署到云托管..."

# 进入 server 目录
cd /workspace/projects/server

# 部署
cloudbase deploy

echo "部署完成！"
```

使用：
```bash
chmod +x deploy.sh
./deploy.sh
```

---

**如果还有任何问题，随时告诉我！** 🎯

推荐使用 CLI 方式，最简单最稳定！ 🚀

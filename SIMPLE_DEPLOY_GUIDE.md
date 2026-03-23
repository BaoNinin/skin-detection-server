# 🚀 云托管一键部署方案

**跳过初始化，直接手动创建配置文件！**

---

## 💡 最简单的方法

如果 `cloudbase init` 没有合适的选项，直接跳过初始化，手动创建配置文件即可！

---

## ✅ 完整步骤（简化版）

### 步骤 1：安装 CLI（如果还没安装）

```bash
npm install -g @cloudbase/cli
```

### 步骤 2：登录（如果还没登录）

```bash
cloudbase login
```

### 步骤 3：进入 server 目录

```bash
cd /workspace/projects/server
```

### 步骤 4：检查配置文件是否存在

```bash
ls cloudbaserc.json
```

### 步骤 5：创建配置文件（如果不存在）

如果提示文件不存在，执行：

```bash
cat > cloudbaserc.json << 'EOF'
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
        "COZE_API_KEY": "8f38a8d0-b6d4-481c-8e15-b93bb30c7444",
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
EOF
```

**⚠️ 重要**：将文件中的两个 `你的环境ID` 替换为你的实际环境 ID！

**手动替换方法**：

```bash
nano cloudbaserc.json
```

找到 `你的环境ID`，改成你的实际环境 ID，然后保存：
- 按 `Ctrl + O`，按回车
- 按 `Ctrl + X` 退出

### 步骤 6：确认 Dockerfile 存在

```bash
ls Dockerfile
```

如果不存在，创建：

```bash
cat > Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start:prod"]
EOF
```

### 步骤 7：确认环境变量已配置

```bash
cat .env.production
```

确认 `CLOUDBASE_ENV_ID=你的环境ID` 已配置。

如果没有，修改：

```bash
nano .env.production
```

将 `CLOUDBASE_ENV_ID=your-env-id-here` 改为你的实际环境 ID。

### 步骤 8：部署！

```bash
cloudbase deploy
```

等待 5-10 分钟，部署完成！

---

## 🔍 验证部署

部署成功后，会显示服务地址：

```
https://xxx-xxx.tcb.qcloud.la
```

测试服务：

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

---

## 📝 关键点

### ❌ 不要运行

```bash
cloudbase init  # ❌ 跳过这个！
```

### ✅ 直接创建配置文件

```bash
# 1. 检查文件是否存在
ls cloudbaserc.json

# 2. 如果不存在，创建
cat > cloudbaserc.json << 'EOF'
{
  ...
}
EOF

# 3. 修改环境 ID
nano cloudbaserc.json

# 4. 部署
cloudbase deploy
```

---

## 🆘 常见问题

### Q1：如何获取环境 ID？

**A**：
1. 访问：https://console.cloud.tencent.com/tcb
2. 点击你的环境名称
3. 在页面顶部看到"环境ID"
4. 格式如：`skin-analysis-prod-8j7k9l`

### Q2：部署时提示环境 ID 错误怎么办？

**A**：
1. 检查 `cloudbaserc.json` 中的 `envId` 是否正确
2. 检查 `.env.production` 中的 `CLOUDBASE_ENV_ID` 是否正确
3. 两者必须一致

### Q3：部署超时怎么办？

**A**：
1. 等待更长时间（首次部署可能需要 10-15 分钟）
2. 检查网络连接
3. 查看云开发控制台的部署日志

### Q4：部署失败怎么办？

**A**：
1. 查看错误信息
2. 确认 Dockerfile 格式正确
3. 确认 `package.json` 和 `pnpm-lock.yaml` 存在
4. 检查是否有语法错误

---

## 📋 完整命令复制粘贴版

```bash
# 1. 进入目录
cd /workspace/projects/server

# 2. 创建配置文件（手动修改环境 ID）
cat > cloudbaserc.json << 'EOF'
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
        "COZE_API_KEY": "8f38a8d0-b6d4-481c-8e15-b93bb30c7444",
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
EOF

# 3. 修改环境 ID（重要！）
nano cloudbaserc.json

# 4. 创建 Dockerfile（如果不存在）
cat > Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start:prod"]
EOF

# 5. 确认环境变量已配置
cat .env.production

# 6. 部署
cloudbase deploy
```

---

## ⚠️ 重要提醒

1. **必须修改环境 ID**：
   - `cloudbaserc.json` 中的 `envId`
   - `cloudbaserc.json` 中的 `envVariables.CLOUDBASE_ENV_ID`
   - `.env.production` 中的 `CLOUDBASE_ENV_ID`

2. **三个地方的环境 ID 必须一致**！

3. **跳过 `cloudbase init`**，直接手动创建配置文件。

---

## 🎯 总结

**最简单的部署流程**：

```bash
cd /workspace/projects/server

# 创建配置文件（记得改环境 ID）
cat > cloudbaserc.json << 'EOF'
{...配置内容...}
EOF

# 修改环境 ID
nano cloudbaserc.json

# 部署
cloudbase deploy
```

**就这么简单！** 🚀

---

**如果还有问题，告诉我错误信息，我会帮你解决！** 💪

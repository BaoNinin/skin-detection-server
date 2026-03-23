# 🆕 云托管部署指南（最新 CLI 版本）

**CLI 命令已更新！使用 `tcb` 命令代替 `cloudbase`**

---

## 🚀 正确的部署流程

### 步骤 1：检查 CLI 版本

```bash
tcb -v
```

应该显示版本号，如：
```
CloudBase CLI 2.12.7
```

### 步骤 2：查看所有可用命令

```bash
tcb -h
```

会显示所有可用命令，找到云托管相关的命令。

### 步骤 3：登录（如果还没登录）

```bash
tcb login
```

或

```bash
tcb auth login
```

扫码登录微信账号。

---

## 🔍 云托管部署命令

### 方式一：使用 services 命令

```bash
tcb services deploy
```

或

```bash
tcb services:deploy
```

### 方式二：使用 container 命令

```bash
tcb container deploy
```

或

```bash
tcb container:deploy
```

### 方式三：指定配置文件

```bash
tcb services deploy --config ./cloudbaserc.json
```

### 方式四：指定环境

```bash
tcb services deploy --envId 你的环境ID
```

---

## ✅ 完整部署步骤

### 步骤 1：进入 server 目录

```bash
cd /path/to/your/projects/server
```

### 步骤 2：确认配置文件存在

```bash
ls cloudbaserc.json
```

### 步骤 3：查看配置内容

```bash
cat cloudbaserc.json
```

### 步骤 4：确认环境 ID 已配置

在 `cloudbaserc.json` 中，确认 `envId` 已设置为你的环境 ID：

```json
{
  "envId": "你的环境ID",
  ...
}
```

### 步骤 5：部署

**尝试以下命令（逐个尝试）：**

#### 命令 1：
```bash
tcb services deploy
```

#### 命令 2：
```bash
tcb container deploy
```

#### 命令 3：
```bash
tcb deploy
```

#### 命令 4：
```bash
tcb services deploy --envId 你的环境ID
```

#### 命令 5：
```bash
tcb services deploy --config ./cloudbaserc.json
```

---

## 🔧 如果以上命令都不行

### 方案 1：查看帮助信息

```bash
tcb -h
```

查找和部署相关的命令。

### 方案 2：查看 services 相关命令

```bash
tcb services -h
```

查看 services 子命令的详细信息。

### 方案 3：查看 container 相关命令

```bash
tcb container -h
```

查看 container 子命令的详细信息。

### 方案 4：使用网页部署

如果 CLI 命令不工作，可以使用网页控制台部署：

1. 登录云开发控制台：https://console.cloud.tencent.com/tcb
2. 选择你的环境
3. 进入"云托管"
4. 点击"新建服务"
5. 上传代码包或配置 Git 仓库

---

## 📝 创建代码包部署

如果需要使用网页部署，先创建代码包：

```bash
# 在项目根目录
cd /path/to/your/projects

# 打包 server 目录
zip -r server-deploy.zip server/
```

然后在云开发控制台上传 `server-deploy.zip` 文件。

---

## 🆘 常见错误和解决方案

### 错误 1：`deploy 不是有效的命令`

**原因**：CLI 命令已更新，不再使用 `cloudbase deploy`

**解决方案**：
```bash
# 使用新的命令
tcb services deploy

# 或
tcb container deploy
```

### 错误 2：`tcb 不是有效的命令`

**原因**：CLI 工具未安装或未正确安装

**解决方案**：
```bash
# 重新安装
npm install -g @cloudbase/cli

# 或使用新的安装包
npm install -g @tencent/cloudbase-cli
```

### 错误 3：`未找到配置文件`

**原因**：`cloudbaserc.json` 文件不存在或路径不正确

**解决方案**：
```bash
# 检查文件是否存在
ls cloudbaserc.json

# 如果不存在，创建（见下方）
```

创建配置文件：

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
        "COZE_MODEL": "doubao-1-5-vision-pro-32k-250115",
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

### 错误 4：`环境 ID 错误`

**原因**：配置文件中的环境 ID 不正确

**解决方案**：
```bash
# 修改配置文件
nano cloudbaserc.json

# 将 envId 改为你的实际环境 ID
```

---

## 🎯 推荐的部署流程

### 使用 CLI（推荐）

```bash
# 1. 进入 server 目录
cd /path/to/your/projects/server

# 2. 查看可用命令
tcb -h

# 3. 尝试部署（逐个尝试以下命令）
tcb services deploy
# 或
tcb container deploy
# 或
tcb deploy
```

### 使用网页控制台（备选）

```bash
# 1. 打包代码
cd /path/to/your/projects
zip -r server-deploy.zip server/

# 2. 登录云开发控制台
# https://console.cloud.tencent.com/tcb

# 3. 进入云托管
# 4. 点击"新建服务"
# 5. 上传 server-deploy.zip
# 6. 配置环境变量
```

---

## 📋 快速故障排除

### 检查清单

- [x] CLI 版本是否最新：`tcb -v`
- [x] 是否已登录：`tcb login`
- [x] 配置文件是否存在：`ls cloudbaserc.json`
- [x] 环境 ID 是否正确：查看 `cloudbaserc.json`
- [x] Dockerfile 是否存在：`ls Dockerfile`

### 调试步骤

```bash
# 1. 检查 CLI 版本
tcb -v

# 2. 查看所有命令
tcb -h

# 3. 查看特定命令的帮助
tcb services -h

# 4. 检查配置文件
cat cloudbaserc.json

# 5. 尝试部署
tcb services deploy
```

---

## 💡 最佳实践

1. **查看帮助信息**
   - 在不确定时，先查看帮助：`tcb -h`
   - 查看特定命令帮助：`tcb services -h`

2. **使用网页部署作为备选**
   - 如果 CLI 命令不工作，使用网页控制台
   - 网页部署更直观，适合初学者

3. **保留配置文件**
   - 确保 `cloudbaserc.json` 和 `Dockerfile` 存在
   - 这些文件是部署必需的

4. **确认环境 ID**
   - 确保 `cloudbaserc.json` 中的 `envId` 正确
   - 可以在云开发控制台查看环境 ID

---

## 📞 获取帮助

如果遇到问题：

1. **查看官方文档**
   - https://docs.cloudbase.net/

2. **查看 CLI 帮助**
   ```bash
   tcb -h
   tcb services -h
   tcb container -h
   ```

3. **使用网页控制台**
   - https://console.cloud.tencent.com/tcb

---

## 🎉 总结

**关键点**：
- ❌ 不要使用 `cloudbase deploy`
- ✅ 使用 `tcb services deploy` 或 `tcb container deploy`
- ✅ 如果 CLI 不行，使用网页控制台
- ✅ 确保配置文件正确

**快速部署**：
```bash
cd /path/to/your/projects/server
tcb services deploy
```

**如果报错，尝试其他命令或使用网页部署！** 🚀

---

**把错误信息告诉我，我会帮你找到正确的命令！** 💪

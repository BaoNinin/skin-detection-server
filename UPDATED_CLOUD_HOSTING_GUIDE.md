# 🆕 云托管服务创建指南（更新版）

根据最新的微信云开发控制台界面，这里提供两种创建服务的方式。

---

## 方式一：使用云开发 CLI 部署（推荐 ⭐⭐⭐⭐⭐）

这种方式最简单，不需要在网页上配置太多选项。

### 步骤 1：安装 CLI 工具

```bash
npm install -g @cloudbase/cli
```

### 步骤 2：登录云开发

```bash
cloudbase login
```

会打开浏览器，扫码登录微信账号。

### 步骤 3：确认环境变量已配置

确认 `server/.env.production` 文件中 `CLOUDBASE_ENV_ID` 已配置：

```bash
cat server/.env.production
```cat E:/美容小程序1/projects/server/.env.production

应该看到：
```bash
CLOUDBASE_ENV_ID=你的环境ID
```

### 步骤 4：进入 server 目录

```bash
cd /workspace/projects/server
```

### 步骤 5：初始化项目（首次）

如果是第一次部署，需要先初始化：

```bash
cloudbase init
```

按照提示选择：
1. 选择环境：选择你的云开发环境
2. 选择模板：选择"自定义"
3. 项目名称：`nestjs-server`
4. 项目目录：当前目录（.）

### 步骤 6：配置服务

编辑 `cloudbaserc.json` 文件（已创建，确认配置正确）：

```json
{
  "envId": "你的环境ID",
  "version": "2.0",
  "framework": {
    "name": "nestjs-server"
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
      "envVariables": {
        "COZE_API_KEY": "pat_ShNM7FfPFQdTtQ8cTfpOzo3W0eMeMrBYLvJArawGAm6gwUC9hiBoHZbd2xDs1iZh",
        "COZE_MODEL": "doubao-vision",
        "CLOUDBASE_ENV_ID": "你的环境ID",
        "NODE_ENV": "production",
        "PORT": "3000"
      }
    }
  ]
}
```

### 步骤 7：部署

```bash
cloudbase deploy
```

等待部署完成（约 2-5 分钟）。

### 步骤 8：获取服务地址

部署成功后，CLI 会显示服务地址，格式如：
```
https://xxx-xxx.tcb.qcloud.la
```

或者在云开发控制台的云托管页面查看。

---

## 方式二：使用控制台手动部署

### 步骤 1：登录云开发控制台

访问：https://console.cloud.tencent.com/tcb

### 步骤 2：选择环境

选择你的云开发环境。

### 步骤 3：进入云托管

在左侧菜单找到"云托管"，点击进入。

### 步骤 4：创建服务（可能的方式）

**方式 A：直接创建**

1. 点击"新建服务"或"创建服务"按钮
2. 填写基本信息：
   - 服务名称：`nestjs-server`
   - 服务描述：`智能皮肤检测后端`（可选）

3. 选择部署方式：
   - **代码包部署**：上传 zip 文件
   - **Git 仓库部署**：连接 Git 仓库
   - **镜像部署**：使用 Docker 镜像

4. 配置容器规格：
   - CPU：0.5 核
   - 内存：1.0 GB
   - 实例数：0-10

5. 配置端口：`3000`

6. 配置环境变量：
   - 在"环境变量"或"配置"部分添加
   - 逐个添加以下变量：

   ```bash
   COZE_API_KEY=pat_ShNM7FfPFQdTtQ8cTfpOzo3W0eMeMrBYLvJArawGAm6gwUC9hiBoHZbd2xDs1iZh
   COZE_MODEL=doubao-vision
   CLOUDBASE_ENV_ID=你的环境ID
   NODE_ENV=production
   PORT=3000
   ```

7. 点击"创建"或"部署"

**方式 B：先创建服务，再配置**

1. 点击"新建服务"
2. 只填写服务名称：`nestjs-server`
3. 点击"创建"

4. 进入服务详情页
5. 点击"部署"或"发布"
6. 上传代码包或配置 Git 仓库
7. 在"配置"或"环境变量"中添加环境变量

---

## 方式三：使用代码包部署

### 步骤 1：打包代码

```bash
cd /workspace/projects
zip -r server-deploy.zip server/
```

### 步骤 2：登录云开发控制台

访问：https://console.cloud.tencent.com/tcb

### 步骤 3：选择环境

选择你的云开发环境。

### 步骤 4：进入云托管

在左侧菜单找到"云托管"，点击进入。

### 步骤 5：创建服务

1. 点击"新建服务"
2. 选择"代码包部署"
3. 上传 `server-deploy.zip` 文件
4. 配置服务名称：`nestjs-server`
5. 配置端口：`3000`
6. 配置环境变量

### 步骤 6：部署

点击"部署"，等待完成。

---

## 📊 环境变量配置（所有方式通用）

无论使用哪种方式，都需要配置以下环境变量：

| 变量名 | 变量值 | 说明 |
|-------|--------|------|
| `COZE_API_KEY` | `pat_ShNM7FfPFQdTtQ8cTfpOzo3W0eMeMrBYLvJArawGAm6gwUC9hiBoHZbd2xDs1iZh` | 豆包 API Key |
| `COZE_MODEL` | `doubao-vision` | 豆包模型名称 |
| `CLOUDBASE_ENV_ID` | `你的环境ID` | 云开发环境 ID |
| `NODE_ENV` | `production` | 运行环境 |
| `PORT` | `3000` | 服务端口 |

---

## 🔍 查找环境变量配置位置

如果在控制台找不到"环境变量"选项，可能的位置：

1. **服务详情页** → "配置" → "环境变量"
2. **服务详情页** → "设置" → "环境变量"
3. **创建服务时** → "高级配置" → "环境变量"
4. **服务详情页** → "版本管理" → "环境变量"

---

## 📞 如果界面完全不同

如果你看到的界面和文档描述的完全不一样，可以：

### 1. 截图给我
- 截图云托管创建服务的界面
- 我会根据实际界面更新文档

### 2. 使用 CLI 部署（推荐）
- CLI 方式最稳定，不受界面变化影响
- 按照"方式一"操作即可

### 3. 查看云开发官方文档
- 访问：https://docs.cloudbase.net/
- 搜索"云托管部署"

---

## ✅ 部署验证

### 1. 检查服务状态

登录云开发控制台，进入云托管页面，确认服务：
- 状态为"运行中"
- 有实例在运行

### 2. 获取服务地址

在云托管控制台，找到服务详情页，查看"访问地址"，格式如：
```
https://xxx-xxx.tcb.qcloud.la
```

### 3. 测试服务

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

## 🆘 常见问题

### Q1：找不到"新建服务"按钮怎么办？
**A**：
- 检查是否已开通云托管服务
- 检查是否有云托管权限
- 联系云开发技术支持

### Q2：部署失败怎么办？
**A**：
1. 查看部署日志，定位错误
2. 确认环境变量配置正确
3. 确认代码没有语法错误
4. 使用 CLI 方式重新部署

### Q3：服务无法启动怎么办？
**A**：
1. 查看服务日志
2. 检查端口是否配置正确（3000）
3. 检查环境变量是否配置
4. 确认依赖是否正确安装

### Q4：环境变量在哪里配置？
**A**：
- 如果使用 CLI：在 `cloudbaserc.json` 中配置
- 如果使用控制台：在服务详情页的"配置"或"环境变量"中配置

---

## 💡 推荐方案

**强烈推荐使用 CLI 方式部署**，原因：
1. 配置清晰，不受界面变化影响
2. 可以重复部署，方便更新
3. 支持版本管理和回滚
4. 自动配置环境变量

---

**如果还有问题，可以截图给我，我会根据实际界面更新文档！** 🎯

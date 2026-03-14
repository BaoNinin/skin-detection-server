# 微信云托管部署指南

本文档将指导你如何将智能皮肤检测小程序后端部署到微信云托管，并配置云数据库和云存储。

## 📋 前置准备

### 1. 微信云开发账号
- 注册/登录 [微信云开发控制台](https://console.cloud.tencent.com/tcb)
- 开通云托管服务

### 2. 创建云开发环境
1. 登录微信云开发控制台
2. 点击"新建环境"
3. 选择环境名称（例如：`skin-analysis-prod`）
4. 选择基础版（免费套餐）
5. 等待环境创建完成（约 1-2 分钟）

### 3. 获取环境信息
创建完成后，记录以下信息：
- **环境 ID**: 环境概览页面可以看到，格式如 `skin-analysis-prod-xxxxx`
- **环境 ID** 将用于配置文件

---

## 🚀 部署步骤

### Step 1：配置环境变量

编辑 `server/.env.production` 文件，填入你的环境信息：

```bash
# 豆包视觉模型配置
COZE_API_KEY=pat_ShNM7FfPFQdTtQ8cTfpOzo3W0eMeMrBYLvJArawGAm6gwUC9hiBoHZbd2xDs1iZh
COZE_MODEL=doubao-vision

# 微信云开发环境配置
CLOUDBASE_ENV_ID=your-env-id-here  # 替换为你的实际环境 ID

# 其他配置
NODE_ENV=production
PORT=3000
```

**重要**：将 `your-env-id-here` 替换为你的实际环境 ID。

---

### Step 2：初始化云数据库

#### 2.1 创建数据库集合

1. 登录微信云开发控制台
2. 选择你的环境
3. 进入"数据库"标签页
4. 点击"添加集合"，创建以下集合：

| 集合名称 | 说明 | 权限 |
|---------|------|------|
| `skin_history` | 皮肤检测历史记录 | 自定义（见下方） |
| `users` | 用户信息 | 自定义（见下方） |

#### 2.2 配置数据库权限

对于每个集合，设置以下权限规则：

**`skin_history` 集合权限**：
```json
{
  "read": "doc.userId == auth.openid",
  "write": "doc.userId == auth.openid"
}
```

**`users` 集合权限**：
```json
{
  "read": "doc._openid == auth.openid",
  "write": "doc._openid == auth.openid"
}
```

或者为了简化开发，可以暂时设置为：
```json
{
  "read": true,
  "write": true
}
```

**⚠️ 注意**：生产环境建议使用更严格的权限控制。

---

### Step 3：配置云存储权限

1. 登录微信云开发控制台
2. 选择你的环境
3. 进入"云存储"标签页
4. 点击"权限设置"
5. 选择"自定义规则"，配置如下：

```json
{
  "read": true,
  "write": true
}
```

或者使用更严格的规则（推荐）：
```json
{
  "read": "auth.openid != null",
  "write": "auth.openid != null"
}
```

---

### Step 4：部署到云托管

#### 方式 A：使用 CLI 部署（推荐）

1. 安装云开发 CLI 工具：
```bash
npm install -g @cloudbase/cli
```

2. 登录云开发：
```bash
cloudbase login
```

3. 进入 server 目录：
```bash
cd /workspace/projects/server
```

4. 部署：
```bash
cloudbase deploy
```

等待部署完成（约 2-5 分钟）。

#### 方式 B：使用控制台部署

1. 登录微信云开发控制台
2. 选择你的环境
3. 进入"云托管"标签页
4. 点击"新建服务"
5. 填写服务信息：
   - 服务名称：`nestjs-server`
   - 容器端口：`3000`
   - CPU：`0.5`
   - 内存：`1.0GB`
   - 最小实例数：`0`
   - 最大实例数：`10`
6. 上传代码包（zip 格式）：
   - 在 server 目录执行：
     ```bash
     cd /workspace/projects
     zip -r server-deploy.zip server/
     ```
   - 在控制台上传 `server-deploy.zip`
7. 配置环境变量：
   - 在控制台添加以下环境变量：
     ```bash
     COZE_API_KEY=pat_ShNM7FfPFQdTtQ8cTfpOzo3W0eMeMrBYLvJArawGAm6gwUC9hiBoHZbd2xDs1iZh
     COZE_MODEL=doubao-vision
     CLOUDBASE_ENV_ID=your-env-id-here
     NODE_ENV=production
     ```
8. 点击"部署"

---

### Step 5：获取服务访问地址

部署成功后：

1. 在云托管控制台找到你的服务
2. 点击服务名称进入详情页
3. 复制"访问地址"，格式如：
   ```
   https://your-service-id.tcb.qcloud.la
   ```
4. 保存这个地址，后续需要配置到小程序中。

---

### Step 6：配置小程序

#### 6.1 修改小程序请求地址

编辑小程序的请求配置，将 API 地址改为云托管服务的访问地址。

**修改 `src/network/index.ts` 或相关配置文件**：

```typescript
// 将 PROJECT_DOMAIN 改为云托管服务地址
const PROJECT_DOMAIN = 'https://your-service-id.tcb.qcloud.la';
```

或者在小程序配置文件中设置：

```typescript
// src/app.config.ts 或 src/config/index.ts
export const API_BASE_URL = 'https://your-service-id.tcb.qcloud.la';
```

#### 6.2 配置服务器域名

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入"开发" → "开发管理" → "开发设置"
3. 在"服务器域名"中添加：
   - request 合法域名：`https://your-service-id.tcb.qcloud.la`
   - uploadFile 合法域名：`https://your-service-id.tcb.qcloud.la`
   - downloadFile 合法域名：`https://your-service-id.tcb.qcloud.la`

**⚠️ 注意**：必须配置 HTTPS 域名，且域名必须已备案。

---

## 📊 免费额度说明

### 云托管免费额度
- **基础版**：
  - CPU：0.5 核
  - 内存：1.0 GB
  - 每月免费时长：125 小时
  - 超出后：¥0.075/小时

### 云数据库免费额度
- **存储空间**：2 GB
- **读操作**：每天 50,000 次
- **写操作**：每天 30,000 次

### 云存储免费额度
- **存储空间**：5 GB
- **下载流量**：每天 5 GB
- **上传流量**：免费

---

## 🔍 验证部署

### 1. 检查服务状态
访问云托管服务地址，确认服务正常运行：
```bash
curl https://your-service-id.tcb.qcloud.la/api/health
```

预期返回：
```json
{
  "status": "success",
  "data": "2026-03-14T..."
}
```

### 2. 测试皮肤检测
在小程序中进行一次皮肤检测，确认：
- 图片上传成功
- AI 分析正常返回
- 历史记录保存成功

### 3. 查看云数据库
在云开发控制台查看 `skin_history` 集合，确认数据已保存。

### 4. 查看云存储
在云开发控制台查看云存储，确认图片已上传。

---

## 🛠️ 常见问题

### Q1：部署失败怎么办？
**A**：
1. 检查 `server/.env.production` 文件是否正确配置
2. 检查 `CLOUDBASE_ENV_ID` 是否正确
3. 查看云托管日志，定位错误原因
4. 确认云开发账号已开通云托管服务

### Q2：数据库操作失败？
**A**：
1. 检查数据库集合是否已创建
2. 检查数据库权限配置是否正确
3. 查看云托管日志，确认错误信息

### Q3：文件上传失败？
**A**：
1. 检查云存储权限配置
2. 确认云存储空间未超出免费额度
3. 查看云托管日志，确认错误信息

### Q4：小程序调用失败？
**A**：
1. 确认服务器域名已配置
2. 检查小程序端 API 地址是否正确
3. 确认云托管服务正常运行
4. 查看小程序控制台错误信息

### Q5：如何查看日志？
**A**：
1. 登录微信云开发控制台
2. 选择你的环境
3. 进入"云托管"标签页
4. 点击服务名称
5. 查看"日志"标签页

---

## 📝 代码改动总结

本次接入微信云开发，主要进行了以下代码改动：

### 1. 安装依赖
- 添加 `wx-server-sdk`：微信云开发 SDK

### 2. 新增文件
- `server/src/config/cloud.config.ts`：云数据库配置
- `server/src/config/cloud-storage.service.ts`：云存储服务
- `server/cloudbaserc.json`：云托管配置文件
- `server/Dockerfile`：Docker 镜像配置
- `server/.dockerignore`：Docker 忽略文件
- `server/.env.production`：生产环境变量

### 3. 修改文件
- `server/src/skin/history.service.ts`：使用云数据库替代 Supabase
- `server/src/skin/skin.service.ts`：集成云存储服务
- `server/src/skin/skin.module.ts`：注册 CloudStorageService

---

## 🎉 部署完成

完成以上步骤后，你的小程序后端已成功部署到微信云托管！

### 下一步优化建议

1. **配置自动扩缩容**：根据访问量自动调整实例数量
2. **配置监控告警**：监控服务状态和错误日志
3. **优化数据库索引**：提升查询性能
4. **配置 CDN 加速**：加速静态资源访问
5. **实施安全加固**：配置访问控制和权限管理

---

## 📞 技术支持

如遇到问题，可以：
1. 查看云托管日志
2. 查看云开发文档：https://docs.cloudbase.net/
3. 联系微信云开发技术支持

---

**祝你部署顺利！** 🚀

# 智能皮肤检测小程序 - 云开发配置指南

## 一、云开发概览

本项目使用微信云开发服务，包括：
- **云数据库**：存储用户信息和皮肤检测历史记录
- **云存储**：存储面部检测图片
- **云托管**：部署后端服务（NestJS）

**当前配置信息**：
- 环境ID：`cloud1-6gzezzskad9fed0b`
- AppID：`wx8826c7b681ec3c65`
- AppSecret：`b5660a490882bbc56b8fcc69d2cb8cd4`

---

## 二、配置步骤

### 步骤 1：开通云开发

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入你的小程序
3. 点击左侧菜单「开发」→「云开发」
4. 点击「开通」按钮
5. 选择「按量付费」或「包年包月」（推荐按量付费测试）
6. 创建环境：
   - 环境名称：`skin-detection`（或自定义）
   - 基础库版本：选择最新版本
   - 记录生成的**环境ID**（格式：`cloud1-xxxxx`）

---

### 步骤 2：获取环境信息

#### 2.1 获取环境ID
1. 在云开发控制台，顶部可以看到环境ID
2. 格式示例：`cloud1-6gzezzskad9fed0b`

#### 2.2 获取 AppSecret
1. 进入「开发」→「开发管理」→「开发设置」
2. 找到「开发者ID」部分
3. 点击「重置」或生成 AppSecret
4. ⚠️ **重要**：AppSecret 只会显示一次，请立即复制并保存
5. 示例：`b5660a490882bbc56b8fcc69d2cb8cd4`

---

### 步骤 3：创建云数据库集合

#### 3.1 创建 `users` 集合（用户信息）

1. 进入「数据库」标签页
2. 点击「+」按钮创建集合
3. 集合名称：`users`
4. 权限设置：选择「所有用户可读，仅创建者可写」
5. 点击「确定」

**数据结构**：
```json
{
  "_id": "自动生成",
  "openid": "用户微信OpenID",
  "phone_number": "手机号",
  "nickname": "昵称",
  "avatar_url": "头像URL",
  "detection_count": 0,
  "created_at": "创建时间",
  "updated_at": "更新时间"
}
```

---

#### 3.2 创建 `skin_history` 集合（检测历史）

1. 点击「+」按钮创建集合
2. 集合名称：`skin_history`
3. 权限设置：选择「所有用户可读，仅创建者可写」
4. 点击「确定」

**数据结构**：
```json
{
  "_id": "自动生成",
  "user_id": "用户ID",
  "skin_type": "皮肤类型",
  "concerns": [
    "干性",
    "敏感"
  ],
  "moisture": 45,
  "oiliness": 30,
  "sensitivity": 50,
  "acne": 20,
  "wrinkles": 10,
  "spots": 15,
  "pores": 25,
  "blackheads": 30,
  "recommendations": [
    {
      "product": "保湿精华",
      "reason": "皮肤干燥"
    }
  ],
  "image_url": "云存储图片URL",
  "created_at": "创建时间",
  "updated_at": "更新时间"
}
```

---

#### 3.3 创建 `health_check` 集合（健康检查）

1. 点击「+」按钮创建集合
2. 集合名称：`health_check`
3. 权限设置：选择「所有用户可读，仅管理员可写」
4. 点击「确定」

**数据结构**：
```json
{
  "_id": "自动生成",
  "updated_at": "最后更新时间"
}
```

---

### 步骤 4：配置云存储

#### 4.1 开通云存储
1. 进入「存储」标签页
2. 点击「开通云存储」
3. 选择「按量付费」
4. 点击「确定」

#### 4.2 创建存储目录
云存储会自动创建根目录，项目使用以下目录结构：
```
/
└── skin-analysis/
    ├── 2024-01-01-image1.jpg
    ├── 2024-01-02-image2.jpg
    └── ...
```

#### 4.3 设置存储权限
1. 进入「存储」→「权限设置」
2. 选择「所有用户可读，仅创建者可写」
3. 点击「保存」

---

### 步骤 5：更新环境变量

#### 5.1 开发环境配置

编辑 `server/.env.local`：

```bash
# 微信小程序配置
CLOUDBASE_ENV_ID=cloud1-你的环境ID
WECHAT_APP_SECRET=你的AppSecret
```

#### 5.2 生产环境配置

编辑 `server/.env.production`：

```bash
# 微信小程序配置
CLOUDBASE_ENV_ID=cloud1-你的环境ID
WECHAT_APP_SECRET=你的AppSecret
```

---

### 步骤 6：配置云托管（可选）

如果需要部署后端服务到云托管：

1. 进入「云托管」标签页
2. 点击「新建服务」
3. 配置服务信息：
   - 服务名称：`skin-detection-api`
   - 运行环境：Node.js 18+
   - 实例规格：按需选择（测试可用 0.5CPU/1GB）
4. 部署代码：
   - 上传 Dockerfile 或使用 git 仓库
   - 配置端口：3000（后端服务端口）
5. 配置环境变量：
   ```bash
   CLOUDBASE_ENV_ID=cloud1-你的环境ID
   WECHAT_APP_SECRET=你的AppSecret
   COZE_API_KEY=pat_xxxxx
   COZE_MODEL=doubao-1-5-vision-pro-32k-250115
   ```

---

## 三、验证配置

### 3.1 验证数据库连接

**方法 1：使用云开发控制台**
1. 进入「数据库」标签页
2. 在 `users` 集合中添加一条测试数据：
   ```json
   {
     "nickname": "测试用户",
     "detection_count": 0
   }
   ```
3. 检查是否能正常添加和查询

**方法 2：使用代码测试**
在 `server/src/app.controller.ts` 中添加健康检查：

```typescript
@Get('health/db')
async checkDatabase() {
  try {
    const { db, COLLECTIONS } = require('./config/cloud.config');
    const result = await db.collection(COLLECTIONS.USERS).limit(1).get();
    return {
      code: 200,
      msg: '数据库连接正常',
      data: { count: result.data.length }
    };
  } catch (error) {
    return {
      code: 500,
      msg: '数据库连接失败',
      error: error.message
    };
  }
}
```

访问：`http://localhost:3000/api/health/db`

---

### 3.2 验证云存储

在云开发控制台：
1. 进入「存储」标签页
2. 点击「上传文件」
3. 选择一张测试图片上传
4. 检查是否能正常获取图片 URL

---

### 3.3 验证环境变量

启动后端服务：

```bash
cd server
pnpm dev
```

检查控制台输出：
```
CloudStorageService 初始化完成，使用云存储
Nest application successfully started
```

---

## 四、数据库权限配置详解

### 推荐权限设置

#### `users` 集合
```
读：所有用户
写：仅创建者和管理员
```
**原因**：用户信息需要隐私保护

#### `skin_history` 集合
```
读：所有用户
写：仅创建者和管理员
```
**原因**：检测历史涉及隐私

#### `health_check` 集合
```
读：所有用户
写：仅管理员
```
**原因**：仅系统可写入健康检查数据

---

## 五、常见问题

### Q1：如何查看数据库数据？
1. 进入云开发控制台 → 数据库
2. 选择对应的集合
3. 可以查看、添加、修改、删除数据

### Q2：如何备份数据？
1. 进入「数据库」→「导出」
2. 选择要导出的集合
3. 选择导出格式（JSON/CSV）
4. 点击「导出」

### Q3：云存储配额满了怎么办？
1. 进入「存储」→「用量统计」
2. 查看存储空间使用情况
3. 删除无用文件或升级套餐

### Q4：如何重置 AppSecret？
1. 进入「开发」→「开发管理」→「开发设置」
2. 找到 AppSecret，点击「重置」
3. ⚠️ **注意**：重置后旧的 AppSecret 会失效，需要立即更新代码中的配置

### Q5：云开发费用如何计算？
- 云数据库：按读写次数和存储容量计费
- 云存储：按存储容量和下载流量计费
- 云托管：按 CPU 和内存使用时间计费
- 新用户有免费额度，足够测试使用

---

## 六、监控与日志

### 查看云开发日志
1. 进入云开发控制台
2. 点击「监控」→「日志」
3. 可以查看云函数、数据库、存储的操作日志

### 性能监控
1. 进入「监控」→「性能」
2. 可以查看数据库查询、云存储上传下载的性能指标

---

## 七、快速检查清单

配置完成后，请逐项检查：

- [ ] 云开发已开通
- [ ] 环境ID已记录
- [ ] AppSecret 已获取
- [ ] `users` 集合已创建
- [ ] `skin_history` 集合已创建
- [ ] `health_check` 集合已创建
- [ ] 云存储已开通
- [ ] 数据库权限已配置
- [ ] 环境变量已更新
- [ ] 后端服务能正常连接数据库
- [ ] 云存储能正常上传文件

---

## 八、下一步

配置完成后，你可以：

1. **测试云数据库**：
   ```bash
   curl http://localhost:3000/api/health/db
   ```

2. **测试云存储**：
   上传一张皮肤检测图片，验证云存储功能

3. **部署到生产环境**：
   使用云托管部署后端服务

4. **开始真机测试**：
   使用已发布的小程序测试完整流程

---

## 联系与支持

如果遇到问题：
1. 查看 [微信云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
2. 检查云开发控制台的错误日志
3. 确认环境变量配置正确
4. 验证数据库权限设置

---

**配置完成！** 🎉

现在你的小程序已经可以正常使用云开发服务了。

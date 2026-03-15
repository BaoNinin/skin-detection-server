# 部署成功后配置指南

## ✅ 部署成功确认

您的云托管服务已成功部署！

---

## 🎯 后续步骤（5 个步骤，约 10 分钟）

### 步骤 1：获取云托管服务地址

#### 操作步骤

1. 登录 [微信云开发控制台](https://console.cloud.tencent.com/tcb/env)
2. 选择环境：`prod-8g240dlc83819a5b`
3. 进入"云托管" > "服务"
4. 找到 `skin-detection-server` 服务
5. 点击进入服务详情
6. 找到"访问地址"或"域名"

#### 服务地址格式

```
https://skin-detection-server-xxx.tcb.qcloud.la
```

#### 示例

```
https://skin-detection-server-g8h2j3k4.tcb.qcloud.la
```

**重要**：请复制这个地址，后续步骤需要用到。

---

### 步骤 2：配置小程序服务器域名

#### 操作步骤

1. 登录 [微信小程序后台](https://mp.weixin.qq.com/)
2. 进入：开发 > 开发管理 > 开发设置 > 服务器域名
3. 点击"修改"按钮

#### 需要添加的域名

| 域名类型 | 域名 |
|----------|------|
| **request 合法域名** | `https://<云托管服务地址>.tcb.qcloud.la` |
| **uploadFile 合法域名** | `https://<云托管服务地址>.tcb.qcloud.la` |
| **downloadFile 合法域名** | `https://<云托管服务地址>.tcb.qcloud.la` |

#### 示例

```
request 合法域名：https://skin-detection-server-g8h2j3k4.tcb.qcloud.la
uploadFile 合法域名：https://skin-detection-server-g8h2j3k4.tcb.qcloud.la
downloadFile 合法域名：https://skin-detection-server-g8h2j3k4.tcb.qcloud.la
```

#### 注意事项

- ✅ 必须使用 `https://` 协议
- ✅ 不要添加路径（如 `/api`）
- ✅ 域名配置后需要等待几分钟生效
- ✅ 体验版可以配置，正式版需要配置

---

### 步骤 3：修改小程序配置

#### 修改 .env.local 文件

在项目根目录找到 `.env.local` 文件，修改 `PROJECT_DOMAIN`：

```bash
# 云托管服务地址
PROJECT_DOMAIN=https://skin-detection-server-xxx.tcb.qcloud.la
```

#### 示例

```bash
# 本地开发环境配置

# 后端 API 地址（云托管）
PROJECT_DOMAIN=https://skin-detection-server-g8h2j3k4.tcb.qcloud.la

# 小程序 AppID
TARO_APP_WEAPP_APPID=wxa1c57025b508e913

# 开发环境
TARO_ENV=weapp
```

---

### 步骤 4：重新编译小程序

#### 在项目根目录执行

```bash
# 清理旧构建
pnpm build:weapp
```

#### 编译成功标志

- ✅ 输出目录：`dist/`
- ✅ 没有编译错误
- ✅ 生成小程序包

---

### 步骤 5：测试接口

#### 测试 1：健康检查接口

在浏览器中访问：

```
https://<云托管服务地址>.tcb.qcloud.la/api
```

**预期响应**：
```json
{
  "message": "API is running",
  "timestamp": 1234567890
}
```

#### 测试 2：登录接口

使用 curl 或 Postman 测试：

```bash
curl -X POST https://<云托管服务地址>.tcb.qcloud.la/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"code":"test-code","userInfo":null}'
```

**预期响应**：
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "userId": "xxx",
    "openid": "xxx",
    "createdAt": "2026-03-15T13:00:00.000Z"
  }
}
```

#### 测试 3：皮肤分析接口

```bash
curl -X POST https://<云托管服务地址>.tcb.qcloud.la/api/skin/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/skin-image.jpg",
    "userId": "test-user"
  }'
```

**预期响应**：
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "skinType": "干性肌肤",
    "concerns": ["缺水", "暗沉"],
    "recommendations": [...]
  }
}
```

---

## 📱 在微信开发者工具中测试

### 步骤 1：导入项目

1. 打开微信开发者工具
2. 点击"导入项目"
3. 选择项目根目录
4. 填写 AppID：`wxa1c57025b508e913`
5. 点击"导入"

### 步骤 2：测试功能

1. **首页测试**：
   - 打开首页
   - 检查页面是否正常加载

2. **登录功能测试**：
   - 点击登录按钮
   - 授权登录
   - 检查是否成功登录

3. **拍照识别测试**：
   - 点击拍照按钮
   - 拍摄皮肤照片
   - 检查是否能正常分析

4. **历史记录测试**：
   - 进入历史记录页面
   - 查看分析历史

---

## 🔍 常见问题

### 问题 1：小程序无法访问接口

**可能原因**：
- 小程序域名未配置白名单
- 域名配置后还未生效（需要等待几分钟）
- PROJECT_DOMAIN 配置错误

**解决方法**：
1. 检查小程序后台域名配置
2. 等待 5-10 分钟让配置生效
3. 重新编译小程序
4. 清除缓存后重试

### 问题 2：接口返回 404

**可能原因**：
- 服务地址配置错误
- 路径配置错误

**解决方法**：
1. 确认服务地址格式：`https://xxx.tcb.qcloud.la`
2. 检查接口路径是否正确
3. 在浏览器中测试健康检查接口

### 问题 3：接口返回 500

**可能原因**：
- 环境变量配置错误
- 云数据库连接失败
- API Key 配置错误

**解决方法**：
1. 检查云托管服务环境变量
2. 查看云托管服务日志
3. 确认 COZE_API_KEY 配置正确

### 问题 4：云托管服务未运行

**可能原因**：
- 服务启动失败
- 健康检查失败

**解决方法**：
1. 查看云托管服务日志
2. 检查端口配置（必须为 80）
3. 重启服务

---

## 📊 部署成功清单

请确认以下事项：

- [ ] 服务状态显示"运行中"
- [ ] 获取到云托管服务地址
- [ ] 在小程序后台配置了域名白名单
- [ ] 修改了小程序 `.env.local` 配置
- [ ] 重新编译了小程序
- [ ] 健康检查接口测试通过（浏览器访问）
- [ ] 登录接口测试通过
- [ ] 皮肤分析接口测试通过
- [ ] 小程序开发者工具中功能测试通过

---

## 🚀 发布到生产环境

### 体验版测试

1. 在微信开发者工具中，点击"上传"
2. 填写版本号和项目备注
3. 上传成功后，进入微信公众平台
4. 版本管理 > 开发版本 > 选定为体验版
5. 生成体验版二维码
6. 用微信扫码体验

### 正式版发布

1. 完成体验版测试
2. 确认所有功能正常
3. 进入微信公众平台
4. 版本管理 > 开发版本 > 提交审核
5. 等待审核通过（通常 1-3 个工作日）
6. 审核通过后，点击"发布"

**注意**：正式发布前，需要完成小程序备案

---

## 💡 优化建议

### 1. 配置自动扩容

如果需要应对高并发：

- 最小实例数：1
- 最大实例数：5
- CPU 使用率阈值：70%

### 2. 配置日志收集

在云托管服务设置中开启日志收集，方便排查问题。

### 3. 配置监控告警

在云开发控制台配置监控告警，及时发现服务异常。

### 4. 配置自定义域名（可选）

如果想使用自己的域名：

1. 在云托管服务中绑定自定义域名
2. 配置域名解析
3. 配置 SSL 证书

---

## 📞 技术支持

如遇到问题，可以：

1. 查看云托管服务日志
2. 访问 [云开发文档](https://docs.cloudbase.net/)
3. 在云开发控制台提交工单

---

## ✅ 完成！

恭喜您！您已经成功完成了云托管部署和小程序配置！

现在您的小程序可以正常使用云托管服务了！🎉

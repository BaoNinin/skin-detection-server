# 小程序服务器域名配置指南

## 📱 步骤 1: 获取云托管服务地址

部署成功后，从微信云开发控制台获取服务地址：

1. 登录[微信云开发控制台](https://console.cloud.tencent.com/tcb/env)
2. 选择环境: `cloud1-9gz0vft7d1ddce7f`
3. 进入"云托管" > "服务"
4. 找到 `skin-detection-server` 服务
5. 复制服务地址，格式为: `https://skin-detection-server-xxx.tcb.qcloud.la`

**示例**: `https://skin-detection-server-abc123.tcb.qcloud.la`

---

## 🔧 步骤 2: 配置小程序服务器域名

### 2.1 登录微信小程序后台

访问: https://mp.weixin.qq.com/

### 2.2 进入服务器域名配置页面

导航路径:
- 开发 > 开发管理 > 开发设置 > 服务器域名

### 2.3 添加域名

在"服务器域名"页面，添加以下三个域名:

| 域名类型 | 配置值 | 说明 |
|----------|--------|------|
| **request 合法域名** | `https://<云托管服务地址>.tcb.qcloud.la` | 普通网络请求 |
| **uploadFile 合法域名** | `https://<云托管服务地址>.tcb.qcloud.la` | 文件上传请求 |
| **downloadFile 合法域名** | `https://<云托管服务地址>.tcb.qcloud.la` | 文件下载请求 |

**重要提示**:
- 域名必须使用 HTTPS 协议
- 不要带端口号（云托管会自动处理）
- 不要带路径（只填域名）
- 示例: `https://skin-detection-server-abc123.tcb.qcloud.la`

### 2.4 保存配置

点击"保存"按钮完成配置

---

## 💻 步骤 3: 更新小程序代码

### 3.1 修改网络配置

打开 `src/network/index.ts` 文件，找到 `PROJECT_DOMAIN` 常量:

```typescript
// 当前配置（开发环境）
const PROJECT_DOMAIN = 'http://localhost:3000'
```

修改为云托管服务地址:

```typescript
// 修改为云托管服务地址
const PROJECT_DOMAIN = 'https://skin-detection-server-abc123.tcb.qcloud.la'
```

### 3.2 验证修改

确认以下文件中的域名已更新:
- `src/network/index.ts` - 网络请求配置
- `src/pages/index/index.tsx` - API 调用（如果有硬编码域名）
- 其他页面文件中的 API 调用

### 3.3 重新编译小程序

```bash
pnpm build:weapp
```

---

## 🧪 步骤 4: 测试配置

### 4.1 健康检查接口

在小程序中调用健康检查接口:

```typescript
import { Network } from '@/network'

const healthCheck = async () => {
  try {
    const res = await Network.request({
      url: '/api'
    })
    console.log('健康检查成功:', res.data)
  } catch (error) {
    console.error('健康检查失败:', error)
  }
}
```

预期响应:
```json
{
  "message": "API is running",
  "timestamp": 1234567890
}
```

### 4.2 皮肤分析接口测试

在小程序中测试皮肤分析功能:

```typescript
const analyzeSkin = async (imageUrl: string) => {
  try {
    const res = await Network.request({
      url: '/api/skin/analyze',
      method: 'POST',
      data: {
        imageUrl,
        userId: 'test-user'
      }
    })
    console.log('分析结果:', res.data)
  } catch (error) {
    console.error('分析失败:', error)
  }
}
```

### 4.3 真机调试

1. 在微信开发者工具中，点击"真机调试"
2. 扫码在手机上打开小程序
3. 测试所有功能是否正常

---

## ⚠️ 常见问题

### Q1: request:fail 域名不在合法列表中

**原因**: 小程序服务器域名未配置或配置错误

**解决方法**:
1. 确认已在微信小程序后台配置服务器域名
2. 确认域名格式正确（必须使用 HTTPS）
3. 确认小程序代码中的域名与配置的一致

### Q2: request:fail 网络请求超时

**原因**: 云托管服务未启动或网络连接问题

**解决方法**:
1. 检查云托管服务是否正常运行
2. 检查域名是否正确
3. 使用 curl 在本地测试服务是否可访问:
   ```bash
   curl https://<云托管服务地址>.tcb.qcloud.la/api
   ```

### Q3: uploadFile:fail 文件上传失败

**原因**: uploadFile 合法域名未配置

**解决方法**:
1. 确认已配置 uploadFile 合法域名
2. 确认域名格式正确
3. 检查云存储服务是否正常

### Q4: request:fail 不支持的协议

**原因**: 使用了 HTTP 协议而非 HTTPS

**解决方法**:
1. 确认域名使用 HTTPS 协议
2. 检查小程序代码中的域名配置
3. 确认云托管服务地址格式正确

---

## ✅ 配置检查清单

配置完成后，请确认以下事项:

- [ ] 已获取云托管服务地址
- [ ] 已在微信小程序后台配置 request 合法域名
- [ ] 已在微信小程序后台配置 uploadFile 合法域名
- [ ] 已在微信小程序后台配置 downloadFile 合法域名
- [ ] 已更新小程序代码中的 PROJECT_DOMAIN
- [ ] 已重新编译小程序
- [ ] 健康检查接口测试通过
- [ ] 皮肤分析接口测试通过
- [ ] 真机调试功能正常

---

## 📞 技术支持

如遇到问题，请参考:
- [微信小程序文档 - 服务器域名](https://developers.weixin.qq.com/miniprogram/dev/framework/server-communication/domain.html)
- [微信云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
- 云托管日志: https://console.cloud.tencent.com/tcb/env

---

**配置完成后，您的小程序就可以正常调用云托管后端服务了！** 🎉

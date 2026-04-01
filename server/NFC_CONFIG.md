# NFC 跳转微信小程序配置指南

## 📱 功能说明

通过手机 NFC 触发网页，自动跳转到微信小程序"智能皮肤检测"。

---

## 🚀 配置步骤

### 第一步：获取小程序 URL Scheme

你需要获取微信小程序的 URL Scheme，有两种方式：

#### 方式一：通过微信公众平台生成（推荐）

1. **登录微信公众平台**
   - 访问：https://mp.weixin.qq.com
   - 使用你的小程序账号登录

2. **生成 URL Scheme**
   - 进入"开发" → "开发管理" → "开发设置"
   - 找到"URL Scheme"（URL链接）
   - 点击"生成"按钮

3. **填写生成信息**
   - **要跳转的小程序路径**：输入小程序首页路径
     ```
     pages/landing/index
     ```
   - **要传递的参数**：可以留空或填写参数
   - **有效期**：建议选择"永久有效"或较长时间

4. **获取 URL Scheme**
   - 生成后会得到一个 URL Scheme，格式类似：
     ```
     weixin://dl/business/?t=1234567890abcdef
     ```
   - 复制这个链接

#### 方式二：通过小程序云开发生成

如果你使用云开发，也可以通过云函数生成 URL Scheme：

```javascript
// 云函数代码
const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event, context) => {
  const result = await cloud.openapi.urlscheme.generate({
    jumpWxa: {
      path: 'pages/landing/index',
      query: ''
    },
    isExpire: false,
    expireType: 0,
    expireInterval: 0
  })

  return result
}
```

---

### 第二步：配置跳转网页

1. **打开配置文件**
   - 找到文件：`server/nfc-redirect.html`

2. **修改 URL Scheme**
   - 找到第 175 行左右的配置：
     ```javascript
     const MINIPRAM_URL = 'weixin://dl/business/?t=YOUR_TICKET_HERE';
     ```
   - 将 `YOUR_TICKET_HERE` 替换为你刚才获取的真实 Ticket

   - **示例**：
     ```javascript
     const MINIPRAM_URL = 'weixin://dl/business/?t=1234567890abcdef';
     ```

3. **（可选）替换二维码图片**
   - 如果你想要显示真实的小程序二维码
   - 找到第 137 行：
     ```html
     <img src="data:image/svg+xml,..." alt="二维码">
     ```
   - 将 `src` 替换为你的小程序二维码图片 URL

---

### 第三步：部署网页

部署这个网页到服务器，让用户可以通过 NFC 触发访问。

#### 方式一：部署到微信云托管（推荐）

1. **上传文件**
   - 在微信云托管控制台
   - 进入你的服务
   - 将 `server/nfc-redirect.html` 上传到服务器的静态文件目录

2. **配置静态文件访问**
   - 在 `server/src/main.ts` 中添加静态文件服务：

   ```typescript
   import { NestFactory } from '@nestjs/core';
   import { AppModule } from './app.module';
   import { NestExpressApplication } from '@nestjs/platform-express';

   async function bootstrap() {
     const app = await NestFactory.create<NestExpressApplication>(AppModule);

     // 添加静态文件服务
     app.useStaticAssets('public');

     await app.listen(process.env.PORT || 3000);
   }
   bootstrap();
   ```

3. **创建静态文件目录**
   - 在 `server` 目录下创建 `public` 文件夹
   - 将 `nfc-redirect.html` 复制到 `server/public/` 目录

4. **访问地址**
   - 部署后，访问地址为：
     ```
     https://your-service-url/nfc-redirect.html
     ```

#### 方式二：部署到静态文件托管服务

也可以部署到以下任一服务：
- GitHub Pages（免费）
- Vercel（免费）
- Netlify（免费）
- 腾讯云 COS（对象存储）

---

### 第四步：配置 NFC 标签

使用 NFC 读写工具（如手机 NFC 功能或专业工具）写入标签数据。

#### NFC 数据格式

使用 NDEF 格式，写入以下类型的数据：

**类型 1：URI 类型（推荐）**
- **Record Type**：URI
- **URI Prefix**：`https://`
- **URI Payload**：你的网页完整 URL

**示例**：
```
https://your-service-url/nfc-redirect.html
```

#### 配置步骤

1. **准备 NFC 标签**
   - 使用 NTAG213、NTAG215 或 NTAG216 标签（推荐）
   - 或其他兼容的 NFC 标签

2. **使用手机写入（Android）**
   - 下载 NFC 工具 App（如 "NFC Tools"）
   - 打开 App，选择"写入"功能
   - 选择 "URI Record"
   - 输入你的网页 URL
   - 将手机靠近 NFC 标签
   - 点击"写入"

3. **使用专业工具写入**
   - 使用 ACR122U 等 NFC 读写器
   - 使用配套软件写入 NDEF 数据

#### 数据写入示例

使用 Python 和 `ndef` 库写入：

```python
import nfc

def write_nfc_tag(clf, url):
    # 创建 NDEF 记录
    record = nfc.ndef.UriRecord(url)

    # 写入标签
    tag = clf.sense(remote_target=nfc.clf.RemoteTarget('106A'))
    if tag:
        clf.connect(tag)
        clf.ndef.tag.write(tag, [record])
        print("NFC 标签写入成功！")
        return True
    return False

# 使用示例
url = "https://your-service-url/nfc-redirect.html"
write_nfc_tag(url)
```

---

### 第五步：测试功能

1. **测试网页访问**
   - 在浏览器中访问你的网页 URL
   - 确认页面可以正常加载

2. **测试微信跳转**
   - 在微信中打开网页 URL
   - 确认能正常跳转到小程序

3. **测试 NFC 触发**
   - 使用手机的 NFC 功能
   - 靠近已配置的 NFC 标签
   - 确认能正常弹出网页并跳转

---

## 📋 配置清单

- [ ] 获取小程序 URL Scheme
- [ ] 修改 `nfc-redirect.html` 中的 URL Scheme
- [ ] 部署网页到服务器
- [ ] 配置 NFC 标签数据
- [ ] 测试网页访问
- [ ] 测试微信跳转
- [ ] 测试 NFC 触发

---

## 💡 使用场景

1. **美容院/化妆品店**
   - 将 NFC 标签贴在产品包装上
   - 用户用手机碰一碰即可打开小程序进行皮肤检测

2. **展会/活动**
   - 将 NFC 标签放置在展台
   - 访客快速体验产品功能

3. **线下推广**
   - 将 NFC 标签嵌入宣传物料
   - 快速引导用户使用小程序

---

## 🔧 常见问题

### Q1: URL Scheme 失效了怎么办？

A: URL Scheme 有有效期限制，重新生成一个新的即可。

### Q2: 在非微信环境中打开网页怎么办？

A: 网页会自动检测环境，如果不在微信中会显示提示，引导用户在微信中打开。

### Q3: NFC 标签写不进去数据？

A:
- 检查 NFC 标签是否加密
- 确认标签是否有足够的存储空间
- 尝试格式化标签后重新写入

### Q4: 手机不支持 NFC 怎么办？

A:
- 确认手机硬件支持 NFC
- 在手机设置中开启 NFC 功能
- Android 手机大部分支持，iOS 需要特定机型

### Q5: 网页跳转失败怎么办？

A:
- 检查 URL Scheme 是否正确
- 确认小程序已发布
- 查看微信开发者工具的控制台日志

---

## 📞 技术支持

- 微信官方文档：https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/url-scheme.html
- NFC 技术文档：https://developer.nxp.com/docs/en/
- 腾讯云文档：https://cloud.tencent.com/document/

---

## 🎉 完成！

配置完成后，用户只需用手机碰一碰 NFC 标签，即可自动跳转到小程序进行皮肤检测！

# 🎯 NFC 跳转小程序 - 快速开始指南

## 📋 你需要做什么

只需要 3 个简单步骤，就能实现 NFC 碰一碰打开小程序！

---

## 步骤 1️⃣：获取小程序 URL Scheme（5分钟）

### 在微信公众平台上获取

1. 访问：https://mp.weixin.qq.com
2. 登录你的小程序账号
3. 进入：**开发** → **开发管理** → **开发设置**
4. 找到：**URL Scheme**（URL链接）
5. 点击：**生成**
6. 填写：
   - 小程序路径：`pages/landing/index`
   - 参数：留空
   - 有效期：选择较长时间
7. 复制生成的 URL Scheme（格式：`weixin://dl/business/?t=xxxxx`）

---

## 步骤 2️⃣：配置跳转网页（2分钟）

### 修改配置文件

打开文件：`server/nfc-redirect.html`

找到第 175 行，修改 URL Scheme：

```javascript
// 将这行：
const MINIPRAM_URL = 'weixin://dl/business/?t=YOUR_TICKET_HERE';

// 改为（替换成你刚才复制的真实 URL Scheme）：
const MINIPRAM_URL = 'weixin://dl/business/?t=1234567890abcdef';
```

### 部署网页

**方式 A：如果已部署微信云托管**

1. 在 `server` 目录下创建 `public` 文件夹
2. 将 `nfc-redirect.html` 复制到 `server/public/`
3. 重新部署云托管服务
4. 访问地址：`https://your-service-url/nfc-redirect.html`

**方式 B：使用静态托管服务**

1. 使用 GitHub Pages、Vercel、Netlify 等
2. 上传 `nfc-redirect.html` 文件
3. 获取访问 URL

---

## 步骤 3️⃣：写入 NFC 标签（5分钟）

### 方法 A：使用 Android 手机（最简单）

1. 下载 **NFC Tools** App（Google Play 或应用商店）
2. 打开 App，选择 **写入**
3. 选择 **添加记录** → **URI**
4. 输入你的网页 URL（如：`https://your-service-url/nfc-redirect.html`）
5. 点击 **写入**
6. 将手机靠近 NFC 标签

✅ 完成！

### 方法 B：使用 Python 脚本（需要 NFC 读写器）

1. 安装依赖：
   ```bash
   pip install nfcpy
   ```

2. 运行脚本：
   ```bash
   cd server
   python3 write_nfc.py https://your-service-url/nfc-redirect.html
   ```

3. 将 NFC 标签靠近读取器

✅ 完成！

---

## 🧪 测试

### 1. 测试网页
在浏览器中打开你的网页 URL，确认页面正常显示。

### 2. 测试微信跳转
在微信中打开网页 URL，确认能跳转到小程序。

### 3. 测试 NFC 触发
用手机碰一碰 NFC 标签，确认能自动跳转。

---

## ✅ 配置清单

- [ ] 获取小程序 URL Scheme
- [ ] 修改 `nfc-redirect.html` 配置
- [ ] 部署网页到服务器
- [ ] 写入 NFC 标签
- [ ] 测试网页访问
- [ ] 测试微信跳转
- [ ] 测试 NFC 触发

---

## 💡 使用场景

- **美容院**：将 NFC 标签贴在产品包装上
- **展会**：放置在展台，访客快速体验
- **线下推广**：嵌入宣传物料，引导用户使用

---

## 🔧 遇到问题？

查看详细配置指南：`NFC_CONFIG.md`

---

## 🎉 完成！

现在用户只需用手机碰一碰 NFC 标签，就能自动跳转到小程序进行皮肤检测！

**预计总耗时**：12分钟
**技术难度**：⭐⭐☆☆☆

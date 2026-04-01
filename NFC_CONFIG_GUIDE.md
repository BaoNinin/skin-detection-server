# 🔧 NFC 配置操作指南

## 📋 步骤清单

### 步骤 1：获取小程序 URL Scheme ⭐⭐⭐

**1.1 登录微信小程序后台**
```
访问：https://mp.weixin.qq.com/
```

**1.2 生成 URL Scheme**
1. 进入：**开发** → **开发管理** → **开发设置**
2. 找到：**URL Scheme** 区域（在页面下方）
3. 点击：**「生成」** 按钮
4. 填写配置：
   - **小程序路径**：`pages/landing/index`
     - 这是小程序的落地页
   - **参数**（可选）：可以留空
     - 或者填写：`{"from":"nfc","deviceId":"NFC_001"}`
5. 点击：**「生成」**

**1.3 复制 URL Scheme**
```
格式示例：
weixin://dl/business/?t=1234567890abcdef
```

**重要：**
- ✅ 复制完整的 URL Scheme
- ✅ 保存备用（30 天后失效）
- ✅ 可以生成多个不同的 Scheme

---

### 步骤 2：修改 NFC 跳转网页配置

**2.1 找到文件**

在项目目录中找到：
```
server/nfc-redirect.html
```

**2.2 修改配置**

打开 `nfc-redirect.html` 文件，找到第 175 行左右：

```javascript
// 配置小程序 URL Scheme
// 格式：weixin://dl/business/?t=TICKET
// 或 URL Link：https://wxaurl.cn/xxxxx
const MINIPRAM_URL = 'weixin://dl/business/?t=YOUR_TICKET_HERE';
```

**2.3 替换为你的 URL Scheme**

将 `YOUR_TICKET_HERE` 替换为你在步骤 1 中复制的完整 URL Scheme：

```javascript
// 修改后
const MINIPRAM_URL = 'weixin://dl/business/?t=1234567890abcdef';
```

**2.4 保存文件**

---

### 步骤 3：部署网页到云托管

**3.1 方法 A：手动上传（推荐）**

1. 在云托管控制台，找到服务：`skin-detection-server`
2. 进入「文件管理」或「静态网站托管」
3. 上传修改后的 `nfc-redirect.html`

**3.2 方法 B：使用 API 上传**

如果云托管支持静态文件托管，使用以下命令：

```bash
# 假设云托管静态文件在 /public 目录
cp server/nfc-redirect.html public/

# 提交到 Git
git add public/nfc-redirect.html
git commit -m "feat: 更新 NFC 跳转网页"
git push
```

**3.3 获取网页 URL**

部署后，你的网页 URL 应该是：

**使用默认域名：**
```
https://skin-detection-serve-235668-9-1411837125.sh.run.tcloudbase.com/nfc-redirect.html
```

**或使用自定义域名（推荐）：**
```
https://api.gaodiai.cn/nfc-redirect.html
```

> 💡 **建议**：完成自定义域名配置后，使用 `https://api.gaodiai.cn/nfc-redirect.html`

**测试网页：**
在浏览器中访问该 URL，应该能看到：
- 加载动画
- 检测是否在微信环境
- 自动跳转或显示提示

---

### 步骤 4：将网页 URL 写入 NFC 芯片 ⭐⭐⭐

**4.1 准备 Android 手机**

- 手机支持 NFC 功能
- Android 4.4+ 版本
- 安装 NFC 写入工具 App

**4.2 安装 NFC 写入工具**

推荐 App：

| App 名称 | 下载方式 | 推荐度 |
|---------|---------|--------|
| NFC Tools | Google Play | ⭐⭐⭐⭐⭐ |
| NFC Tools | 应用商店（国内） | ⭐⭐⭐⭐⭐ |
| NFC Writer | Google Play | ⭐⭐⭐ |
| TagWriter | Google Play | ⭐⭐⭐ |

**推荐使用：NFC Tools**

**4.3 写入 NFC 标签**

**操作步骤：**
1. 打开 NFC Tools App
2. 选择：**「写入」**
3. 选择：**「添加记录」**
4. 选择记录类型：**「URI」**
5. 填写 URI：

```
https://skin-detection-serve-235668-9-1411837125.sh.run.tcloudbase.com/nfc-redirect.html
```

6. 点击：**「写入」**
7. 将手机靠近 NFC 标签
8. 等待写入成功提示

**重要：**
- ✅ 使用完整的网页 URL
- ✅ 确保 URL 可访问（先用浏览器测试）
- ✅ NFC 标签容量足够（通常 144 字节足够）

---

### 步骤 5：测试 NFC 功能

**5.1 测试流程**

```
用户手机（NFC）→ NFC 标签 → 跳转网页 → 检测环境 → 自动跳转小程序
```

**5.2 在微信中测试**

1. 打开微信
2. 将手机靠近 NFC 标签
3. 应该弹出提示：「是否打开网页？」
4. 点击「打开」
5. 自动跳转到小程序

**5.3 在浏览器中测试（非微信）**

1. 用手机浏览器打开网页 URL
2. 应该显示：「请在微信中打开」
3. 提供二维码或复制链接

---

## ✅ 配置完成检查清单

完成所有步骤后，请确认：

- [ ] ✅ 已获取小程序 URL Scheme
- [ ] ✅ 已修改 `nfc-redirect.html` 配置
- [ ] ✅ 已部署网页到云托管
- [ ] ✅ 网页 URL 可以在浏览器中访问
- [ ] ✅ 已将网页 URL 写入 NFC 标签
- [ ] ✅ 在微信中测试 NFC 跳转成功
- [ ] ✅ 小程序自动打开并显示正确页面

---

## 🔧 常见问题排查

### Q1: URL Scheme 生成失败？

**原因：**
- 小程序未发布
- 路径格式错误
- 参数格式错误

**解决方法：**
1. 确保小程序已发布（或提交审核）
2. 检查路径格式（以 `pages/` 开头）
3. 参数使用 JSON 格式

### Q2: 网页无法访问？

**原因：**
- 文件未部署
- 部署路径错误
- 云托管配置问题

**解决方法：**
1. 确认文件已成功部署
2. 使用浏览器访问完整 URL
3. 查看云托管日志

### Q3: NFC 标签写不进去？

**原因：**
- NFC 标签加密
- 标签容量不足
- 手机 NFC 模块故障

**解决方法：**
1. 尝试格式化标签后重新写入
2. 检查标签容量（确保 > URL 长度）
3. 换一个 NFC 标签试试

### Q4: 碰一碰没有反应？

**原因：**
- 手机不支持 NFC
- NFC 功能未开启
- 标签写入了错误的数据

**解决方法：**
1. 在手机设置中开启 NFC
2. 使用其他 NFC 工具读取标签内容
3. 重新写入正确的数据

### Q5: 网页打开但没有自动跳转？

**原因：**
- 不在微信环境中
- URL Scheme 配置错误
- 浏览器拦截

**解决方法：**
1. 在微信中打开网页
2. 检查 URL Scheme 是否正确
3. 点击手动跳转按钮

---

## 💡 优化建议

### 1. 使用 URL Link（可选）

URL Link 是另一种跳转方式，格式类似：
```
https://wxaurl.cn/xxxxx
```

**优势：**
- 可在短信、邮件中使用
- 支持更多参数

**获取方式：**
在生成 URL Scheme 时，勾选「生成 URL Link」

### 2. 定制跳转页面

可以修改 `nfc-redirect.html`：
- 更改样式（颜色、Logo）
- 添加品牌元素
- 优化提示文案

### 3. 批量配置 NFC 标签

如果有多个 NFC 标签：
1. 生成多个不同的 URL Scheme
2. 每个标签对应一个 Scheme
3. 用于不同的场景或设备

---

## 📋 记录模板

配置完成后，记录以下信息：

```
NFC 配置记录

配置时间：2025-01-22

微信小程序：
- AppID：wx8826c7b681ec3c65
- 路径：pages/landing/index

URL Scheme：
- 原始：weixin://dl/business/?t=1234567890abcdef
- 生成时间：2025-01-22
- 到期时间：2025-02-22（30天）

跳转网页：
- URL：https://skin-detection-serve-xxx.tcb.qcloud.la/nfc-redirect.html
- 部署时间：2025-01-22

NFC 标签：
- 数量：1
- 写入时间：2025-01-22
- 格式：URI Record
- 内容：https://skin-detection-serve-xxx.tcb.qcloud.la/nfc-redirect.html

测试结果：
- 微信环境：✅ 通过
- 浏览器环境：✅ 通过
```

---

## 🎯 下一步

配置完成后：

1. **定期检查 URL Scheme 有效期**
   - 30 天后需要重新生成
   - 可以设置提醒

2. **优化跳转页面**
   - 根据实际使用情况调整
   - 提升用户体验

3. **批量应用**
   - 如果有多个 NFC 标签
   - 可以批量配置不同用途的标签

---

**开始配置吧！** 🚀

如果遇到问题，随时告诉我详细的错误信息！

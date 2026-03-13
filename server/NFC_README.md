# 🎉 NFC 跳转微信小程序功能已配置完成！

## 📁 已创建的文件

| 文件名 | 说明 | 用途 |
|--------|------|------|
| `nfc-redirect.html` | 跳转网页 | 用户 NFC 触发后显示的页面 |
| `nfc-config-tool.html` | 配置工具 | 在线配置 NFC 的网页工具 |
| `NFC_QUICKSTART.md` | 快速开始指南 | 5分钟快速配置教程 |
| `NFC_CONFIG.md` | 详细配置指南 | 完整的配置说明 |
| `write_nfc.py` | NFC 写入脚本 | Python 脚本，用于写入 NFC 标签 |
| `requirements-nfc.txt` | Python 依赖 | NFC 写入脚本所需的依赖库 |

---

## 🚀 快速开始（3步完成）

### 第 1 步：获取小程序 URL Scheme

1. 访问：https://mp.weixin.qq.com
2. 登录小程序账号
3. 进入：**开发** → **开发管理** → **开发设置**
4. 找到：**URL Scheme**，点击"生成"
5. 小程序路径填：`pages/landing/index`
6. 复制生成的 URL Scheme

### 第 2 步：配置跳转网页

1. 打开文件：`server/nfc-redirect.html`
2. 找到第 175 行
3. 将 `YOUR_TICKET_HERE` 替换为真实的 URL Scheme

```javascript
// 修改前
const MINIPRAM_URL = 'weixin://dl/business/?t=YOUR_TICKET_HERE';

// 修改后（示例）
const MINIPRAM_URL = 'weixin://dl/business/?t=1234567890abcdef';
```

4. 部署网页到服务器

### 第 3 步：写入 NFC 标签

**方法 A：使用 Android 手机（最简单）**

1. 下载 **NFC Tools** App
2. 选择：**写入** → **添加记录** → **URI**
3. 输入网页 URL（如：`https://your-service-url/nfc-redirect.html`）
4. 靠近 NFC 标签写入

✅ 完成！

---

## 📖 详细文档

### 快速入门
- 📄 **NFC_QUICKSTART.md** - 推荐首先阅读，5分钟快速配置

### 完整指南
- 📄 **NFC_CONFIG.md** - 详细配置说明，包含所有细节

### 在线工具
- 🌐 **nfc-config-tool.html** - 在浏览器中打开，可视化配置 NFC

---

## 🎯 工作原理

```
┌─────────────┐
│  用户手机   │
│  (NFC)      │
└──────┬──────┘
       │ 碰一碰
       ↓
┌─────────────┐
│  NFC 标签   │
│  (URI URL)  │
└──────┬──────┘
       │ 打开网页
       ↓
┌─────────────┐
│  跳转网页   │
│  检测环境   │
└──────┬──────┘
       │ 微信环境
       ↓
┌─────────────┐
│  URL Scheme │
│  跳转小程序 │
└──────┬──────┘
       ↓
┌─────────────┐
│  小程序     │
│  智能皮肤检测 │
└─────────────┘
```

---

## 💡 使用场景

1. **美容院/化妆品店**
   - 将 NFC 标签贴在产品包装上
   - 客户碰一碰即可体验皮肤检测

2. **展会/活动**
   - 放置在展台
   - 访客快速体验产品功能

3. **线下推广**
   - 嵌入宣传物料
   - 引导用户使用小程序

---

## 🔧 常见问题

### Q1: URL Scheme 失效了怎么办？

A: URL Scheme 有有效期限制，重新生成一个新的即可。

### Q2: 在非微信环境中打开网页？

A: 网页会自动检测环境，显示提示引导用户在微信中打开。

### Q3: NFC 标签写不进去？

A:
- 检查标签是否加密
- 确认存储空间足够
- 尝试格式化后重新写入

### Q4: 手机不支持 NFC？

A:
- 确认手机硬件支持 NFC
- 在设置中开启 NFC 功能
- Android 大部分支持，iOS 需要特定机型

---

## 📞 需要帮助？

- 📖 查看 **NFC_CONFIG.md** 获取详细说明
- 🌐 打开 **nfc-config-tool.html** 使用在线配置工具
- 💬 随时提问

---

## ✅ 配置清单

- [ ] 获取小程序 URL Scheme
- [ ] 修改 `nfc-redirect.html` 配置
- [ ] 部署网页到服务器
- [ ] 写入 NFC 标签
- [ ] 测试功能

---

## 🎉 完成！

现在用户只需用手机碰一碰 NFC 标签，就能自动跳转到小程序进行皮肤检测！

**预计总耗时**：12分钟
**技术难度**：⭐⭐☆☆☆

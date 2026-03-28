# 📋 智能皮肤检测小程序 - 绑定信息汇总

## 📱 小程序基本信息

### 小程序 AppID
```
wx8826c7b681ec3c65
```

### 小程序名称
```
智能皮肤检测
```

---

## 🌐 服务域名配置

### 当前使用的域名
```
https://skin-detection-serve-235668-9-1411837125.sh.run.tcloudbase.com
```

---

## 🔑 API 密钥与凭证

### 微信小程序密钥
```
WECHAT_APP_SECRET=e5efd96897d4574e10a235733d9962ea
```
**用途：**
- 微信登录
- 获取用户信息
- 调用微信 API

### 豆包视觉模型 API Key
```
COZE_API_KEY=654a810c-bc85-44b1-8d21-ab53cbdf5d26
```
**用途：**
- 皮肤图像分析
- AI 皮肤类型识别
- 皮肤问题检测

### 豆包视觉模型名称
```
COZE_MODEL=doubao-1-5-vision-pro-32k-250115
```

---

## 🗄️ 数据库配置

### 腾讯云开发环境 ID
```
CLOUDBASE_ENV_ID=prod-3gbk859ae18cc611
```
**用途：**
- 云数据库存储
- 用户信息管理
- 历史记录存储

---

## 🚀 服务部署信息

### 云托管服务地址
```
https://skin-detection-serve-235668-9-1411837125.sh.run.tcloudbase.com
```

### 云托管环境
```
prod-3gbk859ae18cc611
```

### 服务名称
```
skin-detection-serve
```

### GitHub 仓库
```
https://github.com/BaoNinin/skin-detection-server
```

---

## 📡 API 端点配置

### 全局路由前缀
```
/api
```

### 主要 API 端点

#### 用户相关
```
POST /api/user/login        # 用户登录
GET  /api/user/:id          # 获取用户信息
```

#### 皮肤分析相关
```
POST /api/skin/analyze      # 皮肤图像分析
GET  /api/skin/history      # 获取历史记录
```

#### NFC 相关
```
GET  /api/nfc/config        # 获取 NFC 配置
```

---

## 📄 小程序页面配置

### 页面列表
```
pages/landing/index          # 首页（TabBar）
pages/camera/index           # 拍照页面
pages/analyzing/index        # 分析中页面
pages/result/index           # 结果页面
pages/result-detail/index    # 结果详情页面
pages/recommend/index        # 推荐产品页面（已禁用）
pages/history/index          # 历史记录（TabBar）
pages/history-detail/index   # 历史详情页面
pages/mall/index             # 商城页面
pages/profile/index          # 个人中心（TabBar）
pages/nfc-writer/index       # NFC 写入工具页面
```

### TabBar 配置
```
首页: pages/landing/index
历史: pages/history/index
我的: pages/profile/index
```

---

## 🎨 界面配置

### 导航栏配置
```
背景色: #1E40AF
文字色: white
标题: 智能皮肤检测
```

### TabBar 配置
```
未选中颜色: #94A3B8
选中颜色: #1E40AF
背景色: #ffffff
```

---

## 🔧 环境变量配置

### 前端配置 (.env.local)
```bash
PROJECT_DOMAIN=https://skin-detection-serve-235668-9-1411837125.sh.run.tcloudbase.com
TARO_APP_WEAPP_APPID=wx8826c7b681ec3c65
TARO_ENV=weapp
```

### 后端配置 (server/.env.production)
```bash
COZE_API_KEY=654a810c-bc85-44b1-8d21-ab53cbdf5d26
COZE_MODEL=doubao-1-5-vision-pro-32k-250115
CLOUDBASE_ENV_ID=prod-3gbk859ae18cc611
WECHAT_APP_SECRET=e5efd96897d4574e10a235733d9962ea
NODE_ENV=production
```

---

## 🔐 安全提示

### ⚠️ 敏感信息保护
- **WECHAT_APP_SECRET** 是敏感信息，请勿泄露
- **COZE_API_KEY** 是敏感信息，请勿泄露
- **CLOUDBASE_ENV_ID** 是敏感信息，请勿泄露

### 📝 最佳实践
1. 不要将 `.env` 文件提交到 Git
2. 使用 `.env.example` 作为模板
3. 在云托管中配置环境变量
4. 定期轮换 API 密钥

---

## 📞 联系与支持

### 微信小程序后台
```
https://mp.weixin.qq.com/
```

### 腾讯云云托管控制台
```
https://console.cloud.tencent.com/tcb/service
```

### GitHub 仓库
```
https://github.com/BaoNinin/smart-skin-detection
```

---

## 📊 技术栈汇总

### 前端
- **框架**: Taro 4.1.9
- **语言**: React + TypeScript
- **样式**: Tailwind CSS 4.x
- **状态管理**: React Hooks

### 后端
- **框架**: NestJS
- **数据库**: 腾讯云开发数据库
- **AI 模型**: 豆包视觉模型 (doubao-seed-1-6-vision-250815)
- **部署**: 微信云托管

---

## 🔄 版本信息

### 当前版本
```
基于 2026-03-21 的最新配置
```

### 最近更新
- 修复登录功能 DNS 解析失败问题
- 改回使用云托管默认域名
- 移除推荐产品功能
- 更新首页 LOGO 为复古徽章风格

---

**文档生成时间**: 2026-03-21
**维护者**: 开发团队
**版本**: 1.0

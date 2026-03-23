# 🔧 云托管添加域名失败排查指南

## 错误信息

```
加载 "tcbAddCustomDomain" 失败:Error: InternalError, BindResourceCustomDomain failed err:[CgwError][Retu...
```

## 可能的原因

### 1. 域名已被其他服务绑定 ⭐ 最可能

**检查方法：**

**方法 1：在云托管控制台检查**
1. 进入云托管控制台：https://console.cloud.tencent.com/tcb/service
2. 切换到不同的环境
3. 查看「流量管理」→「域名管理」
4. 检查是否有 `api.gaodiai.cn` 已被绑定

**方法 2：在云开发控制台检查**
1. 进入云开发控制台：https://console.cloud.tencent.com/tcb
2. 查看所有环境
3. 检查每个环境的「静态网站托管」或「云托管」
4. 查看是否已绑定 `api.gaodiai.cn`

**方法 3：使用命令行检查**
```bash
# 检查域名解析
nslookup api.gaodiai.cn

# 查看是否有 CNAME 记录指向云托管
```

**如果域名已被绑定：**
1. 找到绑定的环境和服务
2. 解绑旧的绑定
3. 重新绑定到正确的服务

---

### 2. 域名状态异常

**检查方法：**

1. 登录腾讯云域名管理：https://console.cloud.tencent.com/domain
2. 找到 `gaodiai.cn`
3. 检查域名状态
   - 是否正常
   - 是否已过期
   - 是否被冻结
   - 是否有其他限制

**异常状态：**
- 域名已过期
- 域名被冻结
- 域名正在进行备案
- 域名未实名认证

---

### 3. 权限或配置问题

**检查方法：**

1. 检查你的腾讯云账号权限
2. 确认是否有云托管管理权限
3. 检查服务状态是否正常

---

## 解决方案

### 方案 1：检查并解绑旧绑定 ⭐⭐⭐

**步骤：**

**1. 检查所有环境的域名绑定**

在云托管控制台：
1. 查看当前环境的域名绑定
2. 查看其他环境的域名绑定
3. 检查云开发的静态网站托管

**2. 如果发现旧绑定**

在旧绑定的服务中：
1. 进入「流量管理」→「域名管理」
2. 找到 `api.gaodiai.cn`
3. 点击「解绑」或「删除」
4. 确认解绑

**3. 重新添加域名**

回到正确的服务：
1. 流量管理 → 域名管理
2. 添加域名：`api.gaodiai.cn`
3. 选择服务：`skin-detection-server`
4. 关闭 HTTPS 开关
5. 点击「确定」

---

### 方案 2：更换二级域名

如果 `api.gaodiai.cn` 无法使用，可以尝试其他二级域名：

**推荐的二级域名：**

| 域名 | 用途 |
|-----|------|
| api.gaodiai.cn | API 服务（当前尝试）|
| skin-api.gaodiai.cn | 皮肤分析 API |
| server.gaodiai.cn | 服务器 |
| backend.gaodiai.cn | 后端服务 |
| service.gaodiai.cn | 服务 |
| app-api.gaodiai.cn | 应用 API |

**尝试步骤：**
1. 尝试使用 `skin-api.gaodiai.cn`
2. 重复添加域名步骤
3. 如果成功，更新配置文件

**更新配置文件：**

**.env.local:**
```bash
PROJECT_DOMAIN=https://skin-api.gaodiai.cn
```

**config/index.ts:**
```typescript
defineConstants: {
  PROJECT_DOMAIN: JSON.stringify('https://skin-api.gaodiai.cn'),
  ...
}
```

---

### 方案 3：使用云开发静态网站托管

如果云托管域名绑定一直有问题，可以使用云开发的静态网站托管功能。

**步骤：**

**1. 创建静态网站托管**
1. 进入云开发控制台：https://console.cloud.tencent.com/tcb
2. 选择环境：`prod-3gbk859ae18cc611`
3. 左侧菜单 →「静态网站托管」
4. 点击「开通」
5. 配置静态网站

**2. 添加自定义域名**
1. 在静态网站托管页面
2. 点击「设置」
3. 添加自定义域名：`api.gaodiai.cn`
4. 配置 DNS 解析

**3. 配置反向代理（可选）**
- 在静态网站托管中配置反向代理到云托管服务

---

### 方案 4：联系腾讯云技术支持

如果以上方案都无法解决：

**联系方法：**

1. **腾讯云工单系统**
   - 控制台 → 工单 → 提交工单
   - 产品：云托管
   - 问题描述：添加自定义域名失败，错误信息 InternalError

2. **腾讯云在线客服**
   - 点击控制台右下角「在线客服」
   - 描述问题，提供错误信息

3. **腾讯云论坛**
   - https://cloud.tencent.com/developer/ask
   - 搜索或发帖询问

**需要提供的信息：**
- 错误信息：`InternalError, BindResourceCustomDomain failed`
- 域名：`api.gaodiai.cn`
- 环境：`prod-3gbk859ae18cc611`
- 服务：`skin-detection-server`

---

## 临时解决方案

如果域名绑定问题一时无法解决，可以暂时使用默认域名：

**当前默认域名：**
```
https://skin-detection-api-237195-6-1414623738.sh.run.tcloudbase.com
```

**临时配置：**

**.env.local:**
```bash
PROJECT_DOMAIN=https://skin-detection-api-237195-6-1414623738.sh.run.tcloudbase.com
```

**config/index.ts:**
```typescript
defineConstants: {
  PROJECT_DOMAIN: JSON.stringify('https://skin-detection-api-237195-6-1414623738.sh.run.tcloudbase.com'),
  ...
}
```

**NFC 配置：**
```
https://skin-detection-api-237195-6-1414623738.sh.run.tcloudbase.com/nfc-redirect.html
```

---

## 排查步骤总结

### 第一步：检查旧绑定 ⭐⭐⭐

1. 在云托管控制台检查所有环境的域名绑定
2. 如果发现 `api.gaodiai.cn` 已被绑定，先解绑
3. 重新绑定到正确的服务

### 第二步：更换二级域名 ⭐⭐

1. 尝试使用 `skin-api.gaodiai.cn`
2. 重新添加域名
3. 更新配置文件

### 第三步：检查域名状态

1. 在域名管理控制台检查域名状态
2. 确认域名正常、未过期、未冻结

### 第四步：联系技术支持 ⭐

如果以上都无法解决，提交工单联系腾讯云技术支持。

---

## 现在可以做什么

### 立即操作：

**1. 检查是否已有域名绑定**
   - 在云托管控制台查看所有环境
   - 查看云开发静态网站托管

**2. 尝试更换域名**
   - 使用 `skin-api.gaodiai.cn`
   - 重新添加域名

**3. 查看域名状态**
   - 确认域名正常

---

## 📞 需要帮助？

告诉我：

1. **检查结果**
   - 是否发现旧绑定？
   - 域名状态是否正常？

2. **你尝试的操作**
   - 尝试了哪个域名？
   - 是否更换了二级域名？

3. **新的错误信息**
   - 如果尝试后仍有错误
   - 提供完整的错误信息或截图

我会根据你的具体情况提供针对性的解决方案！

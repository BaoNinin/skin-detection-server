# 云托管部署测试清单

## 🎯 测试目标

验证云托管部署的完整性，确保所有功能正常运行:
- ✅ 健康检查接口
- ✅ 皮肤分析功能
- ✅ 历史记录查询
- ✅ 云数据库存储
- ✅ 云存储图片上传

---

## 📋 测试准备

### 1. 获取必要信息

| 信息项 | 获取方式 |
|--------|----------|
| 云托管服务地址 | 微信云开发控制台 > 云托管 > 服务 |
| 环境ID | `cloud1-9gz0vft7d1ddce7f` |
| 小程序 AppID | 微信小程序后台 > 开发 > 开发管理 |
| 测试账号 | 小程序测试账号 |

### 2. 准备测试工具

- ✅ curl（命令行 HTTP 客户端）
- ✅ 微信开发者工具
- ✅ 真机（用于真机调试）
- ✅ 测试图片（用于皮肤分析）

### 3. 准备测试数据

准备一张清晰的皮肤图片（JPG/PNG 格式，建议 500KB-2MB）:
- 正面人脸照片
- 光线均匀
- 无遮挡
- 无滤镜

---

## 🧪 测试用例

### 测试用例 1: 健康检查接口

**目标**: 验证服务是否正常运行

**测试步骤**:

1. 使用 curl 测试健康检查接口:
   ```bash
   curl https://<云托管服务地址>.tcb.qcloud.la/api
   ```

2. 预期结果:
   ```json
   {
     "message": "API is running",
     "timestamp": 1234567890
   }
   ```

**通过标准**:
- [ ] HTTP 状态码为 200
- [ ] 返回 JSON 格式数据
- [ ] 包含 `message` 和 `timestamp` 字段
- [ ] 响应时间 < 1 秒

---

### 测试用例 2: 皮肤分析接口（图片 URL）

**目标**: 验证皮肤分析功能是否正常

**测试步骤**:

1. 准备一张可访问的皮肤图片 URL

2. 使用 curl 发送分析请求:
   ```bash
   curl -X POST https://<云托管服务地址>.tcb.qcloud.la/api/skin/analyze \
     -H "Content-Type: application/json" \
     -d '{
       "imageUrl": "https://example.com/skin-image.jpg",
       "userId": "test-user-001"
     }'
   ```

3. 预期结果:
   ```json
   {
     "code": 200,
     "msg": "success",
     "data": {
       "analysisId": "analysis_123456",
       "skinType": "混合性皮肤",
       "skinConditions": ["毛孔粗大", "T区出油"],
       "recommendations": [
         {
           "category": "清洁",
           "product": "氨基酸洁面乳",
           "reason": "温和清洁，不破坏皮肤屏障"
         }
       ],
       "imageUrl": "https://<云存储地址>/skin-analysis/xxx.jpg"
     }
   }
   ```

**通过标准**:
- [ ] HTTP 状态码为 200
- [ ] 返回 `code: 200` 表示成功
- [ ] 包含皮肤分析结果（skinType, skinConditions, recommendations）
- [ ] 响应时间 < 10 秒

---

### 测试用例 3: 皮肤分析接口（Base64 图片）

**目标**: 验证 Base64 图片上传功能

**测试步骤**:

1. 将测试图片转换为 Base64:
   ```bash
   # 使用 Python 转换
   python3 -c "
   import base64
   with open('skin-test.jpg', 'rb') as f:
       print(base64.b64encode(f.read()).decode())
   "
   ```

2. 使用 curl 发送分析请求:
   ```bash
   curl -X POST https://<云托管服务地址>.tcb.qcloud.la/api/skin/analyze \
     -H "Content-Type: application/json" \
     -d '{
       "imageBase64": "<base64-string>",
       "userId": "test-user-002"
     }'
   ```

3. 预期结果: 与测试用例 2 相同

**通过标准**:
- [ ] HTTP 状态码为 200
- [ ] 返回正确的分析结果
- [ ] 图片成功上传到云存储
- [ ] 响应时间 < 15 秒

---

### 测试用例 4: 历史记录查询

**目标**: 验证历史记录查询功能

**测试步骤**:

1. 确保已完成至少一次皮肤分析（测试用例 2 或 3）

2. 使用 curl 查询历史记录:
   ```bash
   curl "https://<云托管服务地址>.tcb.qcloud.la/api/skin/history?userId=test-user-001"
   ```

3. 预期结果:
   ```json
   {
     "code": 200,
     "msg": "success",
     "data": [
       {
         "id": "history_123456",
         "userId": "test-user-001",
         "analysisId": "analysis_123456",
         "skinType": "混合性皮肤",
         "skinConditions": ["毛孔粗大", "T区出油"],
         "imageUrl": "https://<云存储地址>/skin-analysis/xxx.jpg",
         "createdAt": "2024-03-15T10:30:00Z"
       }
     ]
   }
   ```

**通过标准**:
- [ ] HTTP 状态码为 200
- [ ] 返回历史记录数组
- [ ] 包含完整的分析数据
- [ ] 时间格式正确（ISO 8601）

---

### 测试用例 5: 云数据库验证

**目标**: 验证数据是否正确存储到云数据库

**测试步骤**:

1. 登录[微信云开发控制台](https://console.cloud.tencent.com/tcb/env)

2. 选择环境: `cloud1-9gz0vft7d1ddce7f`

3. 进入"数据库"

4. 查找 `skin_history` 集合

5. 验证数据:
   ```json
   {
     "_id": "xxx",
     "userId": "test-user-001",
     "analysisId": "analysis_123456",
     "skinType": "混合性皮肤",
     "skinConditions": ["毛孔粗大", "T区出油"],
     "recommendations": [...],
     "imageUrl": "https://<云存储地址>/skin-analysis/xxx.jpg",
     "createdAt": "2024-03-15T10:30:00Z",
     "_openid": "xxx"
   }
   ```

**通过标准**:
- [ ] 数据库集合已创建
- [ ] 数据格式正确
- [ ] 包含所有必要字段
- [ ] 时间戳正确

---

### 测试用例 6: 云存储验证

**目标**: 验证图片是否正确上传到云存储

**测试步骤**:

1. 登录[微信云开发控制台](https://console.cloud.tencent.com/tcb/env)

2. 选择环境: `cloud1-9gz0vft7d1ddce7f`

3. 进入"云存储"

4. 查找 `skin-analysis` 文件夹

5. 验证文件:
   - 文件名格式: `{userId}_{timestamp}.jpg`
   - 文件大小 > 0
   - 文件可预览

**通过标准**:
- [ ] 文件夹已创建
- [ ] 图片文件存在
- [ ] 文件大小正常
- [ ] 文件可正常访问

---

### 测试用例 7: 小程序真机测试

**目标**: 验证小程序端功能是否正常

**测试步骤**:

1. 更新小程序代码中的 `PROJECT_DOMAIN`

2. 编译小程序:
   ```bash
   pnpm build:weapp
   ```

3. 在微信开发者工具中，点击"真机调试"

4. 扫码在手机上打开小程序

5. 测试功能:
   - ✅ 拍摄/选择皮肤照片
   - ✅ 上传图片
   - ✅ 等待分析结果
   - ✅ 查看分析报告
   - ✅ 查看历史记录
   - ✅ 点击产品推荐

**通过标准**:
- [ ] 小程序正常启动
- [ ] 相机/相册功能正常
- [ ] 图片上传成功
- [ ] 分析结果正常显示
- [ ] 历史记录功能正常
- [ ] 无崩溃或报错

---

### 测试用例 8: 错误处理测试

**目标**: 验证错误处理机制

**测试步骤**:

1. 测试无效图片 URL:
   ```bash
   curl -X POST https://<云托管服务地址>.tcb.qcloud.la/api/skin/analyze \
     -H "Content-Type: application/json" \
     -d '{"imageUrl": "https://invalid-url.jpg", "userId": "test"}'
   ```

2. 测试缺失参数:
   ```bash
   curl -X POST https://<云托管服务地址>.tcb.qcloud.la/api/skin/analyze \
     -H "Content-Type: application/json" \
     -d '{"imageUrl": "https://example.com/image.jpg"}'
   ```

3. 测试无效的 Base64:
   ```bash
   curl -X POST https://<云托管服务地址>.tcb.qcloud.la/api/skin/analyze \
     -H "Content-Type: application/json" \
     -d '{"imageBase64": "invalid-base64", "userId": "test"}'
   ```

**通过标准**:
- [ ] 所有错误都返回 400/500 状态码
- [ ] 返回清晰的错误信息
- [ ] 不会导致服务崩溃
- [ ] 错误日志记录到云托管日志

---

### 测试用例 9: 性能测试

**目标**: 验证服务性能是否满足要求

**测试步骤**:

1. 使用 curl 测量响应时间:
   ```bash
   time curl https://<云托管服务地址>.tcb.qcloud.la/api
   ```

2. 测试并发请求:
   ```bash
   # 使用 Apache Bench 进行压力测试
   ab -n 100 -c 10 https://<云托管服务地址>.tcb.qcloud.la/api
   ```

**通过标准**:
- [ ] 健康检查响应时间 < 1 秒
- [ ] 皮肤分析响应时间 < 10 秒
- [ ] 支持 10 并发请求不失败
- [ ] 无明显性能瓶颈

---

### 测试用例 10: 监控和日志

**目标**: 验证监控和日志功能

**测试步骤**:

1. 查看云托管日志:
   ```bash
   tcb run logs --env-id cloud1-9gz0vft7d1ddce7f
   ```

2. 登录微信云开发控制台查看:
   - 云托管 > 服务 > 日志
   - 数据库 > 日志
   - 云存储 > 日志

**通过标准**:
- [ ] 日志记录完整
- [ ] 错误日志清晰可读
- [ ] 请求日志包含必要信息
- [ ] 日志实时更新

---

## ✅ 测试结果汇总

### 测试通过标准

**必须通过（P0）**:
- [ ] 测试用例 1: 健康检查接口
- [ ] 测试用例 2: 皮肤分析接口（图片 URL）
- [ ] 测试用例 4: 历史记录查询
- [ ] 测试用例 7: 小程序真机测试

**重要（P1）**:
- [ ] 测试用例 3: 皮肤分析接口（Base64 图片）
- [ ] 测试用例 5: 云数据库验证
- [ ] 测试用例 6: 云存储验证
- [ ] 测试用例 8: 错误处理测试

**可选（P2）**:
- [ ] 测试用例 9: 性能测试
- [ ] 测试用例 10: 监控和日志

### 测试报告模板

| 测试用例 | 状态 | 问题 | 备注 |
|----------|------|------|------|
| 1. 健康检查接口 | ⬜ 通过 ⬜ 失败 | | |
| 2. 皮肤分析接口（URL） | ⬜ 通过 ⬜ 失败 | | |
| 3. 皮肤分析接口（Base64） | ⬜ 通过 ⬜ 失败 | | |
| 4. 历史记录查询 | ⬜ 通过 ⬜ 失败 | | |
| 5. 云数据库验证 | ⬜ 通过 ⬜ 失败 | | |
| 6. 云存储验证 | ⬜ 通过 ⬜ 失败 | | |
| 7. 小程序真机测试 | ⬜ 通过 ⬜ 失败 | | |
| 8. 错误处理测试 | ⬜ 通过 ⬜ 失败 | | |
| 9. 性能测试 | ⬜ 通过 ⬜ 失败 | | |
| 10. 监控和日志 | ⬜ 通过 ⬜ 失败 | | |

---

## 🔧 问题排查

### 常见问题速查

| 问题 | 可能原因 | 解决方法 |
|------|----------|----------|
| 健康检查失败 | 服务未启动 | 检查云托管服务状态 |
| 皮肤分析失败 | 豆包 API Key 错误 | 检查环境变量配置 |
| 历史记录为空 | 数据库未连接 | 检查 CLOUDBASE_ENV_ID |
| 图片上传失败 | 云存储未配置 | 检查云存储权限 |
| 小程序请求失败 | 域名未配置 | 检查服务器域名配置 |
| 响应超时 | 网络问题 | 检查服务地址和网络 |

### 日志查看

```bash
# 查看实时日志
tcb run logs --env-id cloud1-9gz0vft7d1ddce7f

# 查看最近 100 条日志
tcb run logs --env-id cloud1-9gz0vft7d1ddce7f --limit 100

# 查看指定时间范围的日志
tcb run logs --env-id cloud1-9gz0vft7d1ddce7f --from "2024-03-15T00:00:00Z" --to "2024-03-15T23:59:59Z"
```

---

## 📞 技术支持

- 微信云开发文档: https://developers.weixin.qq.com/miniprogram/dev/wxcloud/
- 云托管文档: https://developers.weixin.qq.com/miniprogram/dev/wxcloud/run/
- CloudBase CLI 文档: https://docs.cloudbase.net/cli/

---

**测试完成后，如果所有 P0 和 P1 测试用例都通过，恭喜您，云托管部署成功！** 🎉

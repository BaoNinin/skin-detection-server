# 小程序生产环境部署指南

本文档提供两种生产环境部署方案：
- **方案 A：微信云托管**（推荐，最简单，稳定性最高）
- **方案 B：Nginx 代理**（需要服务器访问，控制力最强）

---

# 🚀 方案 A：微信云托管部署（推荐）

## 优势
- ✅ 官方推荐，与小程序无缝集成
- ✅ 无需域名白名单配置（内网通信）
- ✅ 自动 HTTPS、自动扩缩容
- ✅ 稳定性最高，99.9% SLA
- ✅ 免费额度充足（每月 100 万次调用）

## 步骤 1：准备云托管环境

### 1.1 登录微信云开发控制台
访问：https://console.cloud.tencent.com/tcb/env

### 1.2 创建环境（如果还没有）
1. 点击「新建环境」
2. 选择「云托管」
3. 环境名称：`skin-detection-prod`
4. 基础套餐：选择「按量付费」
5. 点击「立即创建」

---

## 步骤 2：配置 Docker 镜像

### 2.1 创建 Dockerfile

在 `server` 目录下创建 `Dockerfile`：

```dockerfile
# 使用官方 Node.js 镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package.json package-lock.json* ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=80

# 启动应用
CMD ["npm", "run",start:prod"]
```

### 2.2 创建 .dockerignore

在 `server` 目录下创建 `.dockerignore`：

```
node_modules
dist
.env.local
.env.*.local
*.log
.git
.github
.vscode
```

---

## 步骤 3：构建并推送镜像

### 3.1 登录腾讯云容器镜像服务

```bash
# 安装 Docker CLI（如果还没有）
# 访问：https://docs.docker.com/get-docker/

# 登录腾讯云镜像仓库
docker login ccr.ccs.tencentyun.com \
  --username=<你的腾讯云账号> \
  --password=<你的腾讯云密码>
```

### 3.2 构建镜像

```bash
cd server

# 构建镜像
docker build -t ccr.ccs.tencentyun.com/<你的命名空间>/skin-detection-server:latest .
```

### 3.3 推送镜像

```bash
# 推送镜像
docker push ccr.ccs.tencentyun.com/<你的命名空间>/skin-detection-server:latest
```

---

## 步骤 4：部署到云托管

### 4.1 创建云托管服务

1. 进入云开发控制台
2. 选择环境：`skin-detection-prod`
3. 进入「云托管」>「服务」
4. 点击「新建服务」

### 4.2 配置服务

**基本信息：**
- 服务名称：`skin-detection-server`
- 版本名称：`v1.0`
- 镜像地址：`ccr.ccs.tencentyun.com/<你的命名空间>/skin-detection-server:latest`

**环境变量：**
从 `server/.env.local` 复制所有配置：

```bash
# 端口配置
PORT=80

# 豆包视觉模型配置
COZE_API_KEY=654a810c-bc85-44b1-8d21-ab53cbdf5d26
COZE_MODEL=doubao-1-5-vision-pro-32k-250115
COZE_API_BASE=https://ark.cn-beijing.volces.com/api/v3/chat/completions
COZE_USE_MOCK=false

# 微信小程序配置
WECHAT_APPID=wx8826c7b681ec3c65
WECHAT_APP_SECRET=<你的AppSecret>

# Supabase 配置
COZE_SUPABASE_URL=https://pacqfzvxkiobtxbjubil.supabase.co
COZE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhY3FmenZ4a2lvYnR4Ymp1YmlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODM1ODYsImV4cCI6MjA4ODk1OTU4Nn0.CZoSjahWflEy3vhj_Ya9ddYhie9BtmvRxhNaN8JdZs4

# 其他配置
NODE_ENV=production
```

**访问配置：**
- 服务访问方式：公网访问
- 访问协议：HTTPS（自动配置）

**资源配置：**
- CPU：0.25核（可调整）
- 内存：512MB（可调整）
- 实例数：自动扩缩容

### 4.3 部署服务

1. 点击「部署」
2. 等待部署完成（约 2-3 分钟）
3. 部署成功后，记录服务地址

**服务地址示例：**
```
https://skin-detection-server-xxx.tcb.qcloud.la
```

---

## 步骤 5：配置小程序

### 5.1 更新小程序代码

修改 `config/index.ts`：

```typescript
defineConstants: {
  PROJECT_DOMAIN: JSON.stringify('https://skin-detection-server-xxx.tcb.qcloud.la'),
  TARO_ENV: JSON.stringify(process.env.TARO_ENV),
  TARO_APP_WEAPP_APPID: JSON.stringify('wx8826c7b681ec3c65'),
},
```

### 5.2 更新环境变量

修改 `.env.local`：

```bash
PROJECT_DOMAIN=https://skin-detection-server-xxx.tcb.qcloud.la
TARO_APP_WEAPP_APPID=wx8826c7b681ec3c65
TARO_ENV=weapp
```

### 5.3 重新编译

```bash
pnpm build:weapp
```

### 5.4 配置域名白名单（可选）

**使用云托管时，可以不配置域名白名单！**

云托管服务地址 `*.tcb.qcloud.la` 是微信官方的，自动信任。

---

## 步骤 6：测试验证

### 6.1 测试服务

```bash
# 测试云托管服务
curl https://skin-detection-server-xxx.tcb.qcloud.la/api/hello

# 预期返回：
# {"status":"success","data":"Hello, welcome to coze coding mini-program server!"}
```

### 6.2 测试小程序

1. 在开发者工具中清除缓存
2. 重新编译
3. 点击「预览」
4. 真机测试

---

## 步骤 7：监控和日志

### 7.1 查看服务日志

1. 进入云开发控制台
2. 进入「云托管」>「服务」
3. 选择 `skin-detection-server` 服务
4. 点击「日志」查看实时日志

### 7.2 查看监控数据

1. 进入「云托管」>「服务」
2. 点击「监控」查看：
   - CPU 使用率
   - 内存使用率
   - 请求量
   - 错误率

### 7.3 设置告警

1. 进入「云托管」>「告警管理」
2. 创建告警规则：
   - CPU 使用率 > 80%
   - 错误率 > 1%
   - 响应时间 > 5秒

---

## 成本估算

**免费额度（每月）：**
- CPU：400 小时
- 内存：400 小时
- 调用次数：100 万次
- 流量：10 GB

**超出免费额度后：**
- CPU：¥0.09/核/小时
- 内存：¥0.03/GB/小时
- 调用次数：¥0.01/万次
- 流量：¥0.8/GB

**预估成本（中小型应用）：¥50-200/月**

---

# 🔧 方案 B：Nginx 代理部署

## 优势
- ✅ 完全控制服务器
- ✅ 性能优化空间大
- ✅ 可配置高级功能（缓存、限流等）
- ✅ 成本更低（已有服务器）

## 前置条件

- ✅ 拥有服务器访问权限（SSH）
- ✅ 已安装 Nginx
- ✅ 已有域名 `gaodiai.cn`

---

## 步骤 1：优化 Nginx 配置

### 1.1 创建专用配置文件

在服务器上执行：

```bash
# SSH 连接到服务器
ssh root@175.178.51.38

# 创建 Nginx 配置文件
nano /etc/nginx/sites-available/gaodiai.cn-prod
```

### 1.2 添加生产级配置

```nginx
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name gaodiai.cn;
    return 301 https://$server_name$request_uri;
}

# HTTPS 主配置
server {
    listen 443 ssl http2;
    server_name gaodiai.cn;

    # SSL 证书配置
    ssl_certificate /etc/letsencrypt/live/gaodiai.cn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gaodiai.cn/privkey.pem;

    # SSL 优化配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 小程序专用 API 代理
    location /api/ {
        # 代理到后端服务
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        # 关键配置：解决小程序网络问题
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";

        # 超时配置（小程序需要更长的超时时间）
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;

        # 缓冲配置
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;

        # CORS 配置（小程序需要）
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;

        # 处理 OPTIONS 预检请求
        if ($request_method = OPTIONS) {
            return 204;
        }

        # 错误处理
        proxy_intercept_errors on;
        error_page 502 503 504 =200 /api/error;
    }

    # 健康检查端点
    location /health {
        access_log off;
        return 200 "OK";
        add_header Content-Type text/plain;
    }

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # 日志配置
    access_log /var/log/nginx/gaodiai-access.log;
    error_log /var/log/nginx/gaodiai-error.log warn;

    # 限制请求速率（防止滥用）
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;
}
```

### 1.3 启用配置

```bash
# 创建软链接
ln -s /etc/nginx/sites-available/gaodiai.cn-prod /etc/nginx/sites-enabled/

# 测试配置
nginx -t

# 重新加载 Nginx
systemctl reload nginx
```

---

## 步骤 2：配置 PM2 进程管理

### 2.1 安装 PM2

```bash
npm install -g pm2
```

### 2.2 创建 PM2 配置文件

在 `server` 目录下创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'skin-detection-server',
    script: 'dist/main.js',
    instances: 'max', // 根据CPU核心数自动设置
    exec_mode: 'cluster', // 集群模式，提高性能
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // 日志配置
    error_file: '/var/log/skin-detection-server/error.log',
    out_file: '/var/log/skin-detection-server/out.log',
    log_file: '/var/log/skin-detection-server/combined.log',
    time: true,
    // 重启策略
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    // 性能优化
    node_args: '--max-old-space-size=512'
  }]
}
```

### 2.3 创建日志目录

```bash
mkdir -p /var/log/skin-detection-server
chown -R $USER:$USER /var/log/skin-detection-server
```

### 2.4 启动服务

```bash
cd server

# 构建应用
npm run build

# 使用 PM2 启动
pm2 start ecosystem.config.js --env production

# 保存 PM2 配置
pm2 save

# 设置开机自启动
pm2 startup
```

### 2.5 监控服务

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs skin-detection-server

# 查看监控
pm2 monit

# 重启服务
pm2 restart skin-detection-server

# 查看详细信息
pm2 show skin-detection-server
```

---

## 步骤 3：配置防火墙

### 3.1 开放必要端口

```bash
# 开放 HTTP
ufw allow 80/tcp

# 开放 HTTPS
ufw allow 443/tcp

# 启用防火墙
ufw enable

# 查看状态
ufw status
```

---

## 步骤 4：配置自动备份

### 4.1 创建备份脚本

```bash
nano /opt/backup-skin-detection.sh
```

```bash
#!/bin/bash

# 备份脚本
BACKUP_DIR="/backup/skin-detection"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/skin-detection-$DATE.tar.gz"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
# pg_dump -U postgres -d skin_detection > $BACKUP_DIR/database-$DATE.sql

# 备份应用文件
tar -czf $BACKUP_FILE \
  /root/skin-detection/server/dist \
  /root/skin-detection/server/.env.local

# 删除 7 天前的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE"
```

### 4.2 设置定时任务

```bash
chmod +x /opt/backup-skin-detection.sh

# 添加到 crontab（每天凌晨 2 点执行）
crontab -e

# 添加以下行：
0 2 * * * /opt/backup-skin-detection.sh >> /var/log/backup.log 2>&1
```

---

## 步骤 5：配置监控和告警

### 5.1 安装监控工具

```bash
# 安装 htop（系统监控）
apt install htop

# 安装 nmon（性能监控）
apt install nmon
```

### 5.2 配置日志轮转

```bash
nano /etc/logrotate.d/skin-detection-server
```

```
/var/log/skin-detection-server/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 $USER $USER
    sharedscripts
}
```

---

## 步骤 6：配置 SSL 证书自动续期

```bash
# 测试续期
certbot renew --dry-run

# 配置自动续期（已自动配置）
# certbot 会每天检查证书并自动续期
```

---

## 步骤 7：性能测试

### 7.1 测试 API 性能

```bash
# 安装 Apache Bench
apt install apache2-utils

# 测试并发性能
ab -n 1000 -c 10 https://gaodiai.cn/api/hello

# 预期结果：
# Requests per second: >100
# Time per request: <100ms
```

### 7.2 测试 HTTPS 性能

```bash
# 测试 SSL 配置
curl -I https://gaodiai.cn/api/hello

# 测试 SSL 评级（访问 SSL Labs）
# https://www.ssllabs.com/ssltest/analyze.html?d=gaodiai.cn
```

---

## 步骤 8：配置小程序

### 8.1 确认域名配置

确保 `config/index.ts` 中配置正确：

```typescript
defineConstants: {
  PROJECT_DOMAIN: JSON.stringify('https://gaodiai.cn'),
  TARO_ENV: JSON.stringify(process.env.TARO_ENV),
  TARO_APP_WEAPP_APPID: JSON.stringify('wx8826c7b681ec3c65'),
},
```

### 8.2 确认域名白名单

在微信小程序后台（AppID: wx8826c7b681ec3c65）配置：

| 域名类型 | 配置值 |
|---------|--------|
| request 合法域名 | `https://gaodiai.cn` |
| uploadFile 合法域名 | `https://gaodiai.cn` |
| downloadFile 合法域名 | `https://gaodiai.cn` |

### 8.3 重新编译测试

```bash
pnpm build:weapp
```

---

## 成本估算

**服务器成本：**
- 腾讯云轻量应用服务器：¥50-100/月（已有）

**域名成本：**
- 域名续费：¥50-100/年
- SSL 证书：免费（Let's Encrypt）

**总成本：¥50-100/月**

---

# 📊 方案对比

| 对比项 | 方案 A：云托管 | 方案 B：Nginx 代理 |
|--------|--------------|------------------|
| **部署难度** | ⭐⭐ 简单 | ⭐⭐⭐⭐ 复杂 |
| **稳定性** | ⭐⭐⭐⭐⭐ 官方保证 | ⭐⭐⭐⭐ 取决于配置 |
| **性能** | ⭐⭐⭐⭐ 良好 | ⭐⭐⭐⭐⭐ 可优化 |
| **成本** | ¥50-200/月 | ¥50-100/月 |
| **控制力** | ⭐⭐⭐ 受限 | ⭐⭐⭐⭐⭐ 完全控制 |
| **域名白名单** | 不需要 | 需要 |
| **维护成本** | 低（托管） | 高（自维护） |
| **扩容能力** | 自动扩缩容 | 手动扩容 |
| **监控告警** | 内置 | 需自己配置 |

---

# 🎯 推荐方案

## 如果你想要：
- ✅ 快速上线 → **方案 A：微信云托管**
- ✅ 最少维护 → **方案 A：微信云托管**
- ✅ 最高稳定性 → **方案 A：微信云托管**

## 如果你想要：
- ✅ 完全控制 → **方案 B：Nginx 代理**
- ✅ 性能优化 → **方案 B：Nginx 代理**
- ✅ 成本最低 → **方案 B：Nginx 代理**

---

# 🚀 下一步行动

**选择方案 A：**
1. 准备腾讯云账号
2. 按照上述步骤创建云托管环境
3. 构建并推送 Docker 镜像
4. 部署服务
5. 更新小程序配置

**选择方案 B：**
1. 提供服务器 SSH 访问权限
2. 我会帮你配置 Nginx
3. 配置 PM2 进程管理
4. 配置监控和备份
5. 测试验证

**告诉我你的选择，我立即帮你实施！** 🚀

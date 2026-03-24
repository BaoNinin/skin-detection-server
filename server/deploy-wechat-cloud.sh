#!/bin/bash
# 微信云托管一键部署命令
# 使用方法: bash deploy-wechat-cloud.sh

set -e

echo "======================================"
echo "  微信云托管 - 智能皮肤检测后端部署"
echo "  豆包端点模型版本"
echo "======================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 环境变量
ENV_ID="cloud1-9gz0vft7d1ddce7f"
SERVICE_NAME="skin-detection-server"
VERSION_NAME="latest"

echo "📋 部署配置:"
echo "  - 环境ID: $ENV_ID"
echo "  - 服务名称: $SERVICE_NAME"
echo "  - 版本: $VERSION_NAME"
echo ""

# 检查是否登录
if ! tcb auth list &> /dev/null; then
  echo -e "${RED}❌ 未登录微信云开发${NC}"
  echo "请运行: tcb login"
  exit 1
fi

echo -e "${GREEN}✅ 已登录微信云开发${NC}"
echo ""

# 部署命令
echo -e "${YELLOW}🚀 开始部署...${NC}"
echo ""

tcb run service:deploy \
  --env-id $ENV_ID \
  --service-name $SERVICE_NAME \
  --version-name $VERSION_NAME \
  --cpu 0.5 \
  --memory 1 \
  --min-num 1 \
  --max-num 1 \
  --container-port 80 \
  --env COZE_API_KEY=8f60880a-1ac3-40a7-bd60-1b68dbc549e6 \
  --env COZE_MODEL=ep-20260324135258-7shrd \
  --env COZE_API_BASE=https://ark.cn-beijing.volces.com/api/v3/chat/completions \
  --env COZE_USE_MOCK=false \
  --env CLOUDBASE_ENV_ID=$ENV_ID \
  --env PORT=80 \
  --env NODE_ENV=production \
  --env WECHAT_APPID=wx8826c7b681ec3c65 \
  --env WECHAT_APP_SECRET=b5660a490882bbc56b8fcc69d2cb8cd4 \
  --env COZE_SUPABASE_URL=https://pacqfzvxkiobtxbjubil.supabase.co \
  --env COZE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhY3FmenZ4a2lvYnR4Ymp1YmlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODM1ODYsImV4cCI6MjA4ODk1OTU4Nn0.CZoSjahWflEy3vhj_Ya9ddYhie9BtmvRxhNaN8JdZs4

echo ""
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ 部署命令已发送${NC}"
  echo ""
  echo -e "${YELLOW}⏳ 等待部署完成（约 2-5 分钟）...${NC}"
  echo ""
  echo "查看部署进度:"
  echo "  https://console.cloud.tencent.com/tcb/env"
  echo ""
  echo "查看实时日志:"
  echo "  tcb logs --env-id $ENV_ID --service-name $SERVICE_NAME --latest"
  echo ""
else
  echo -e "${RED}❌ 部署失败${NC}"
  exit 1
fi

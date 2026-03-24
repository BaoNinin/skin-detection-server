#!/bin/bash

# 微信云托管一键部署脚本
# 使用方法: bash deploy-cloud-hosting.sh

set -e

echo "======================================"
echo "  微信云托管 - 智能皮肤检测后端部署"
echo "======================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否安装了 CloudBase CLI
check_cli() {
  if ! command -v tcb &> /dev/null; then
    echo -e "${RED}❌ CloudBase CLI 未安装${NC}"
    echo "请运行: npm install -g @cloudbase/cli"
    exit 1
  fi
  echo -e "${GREEN}✅ CloudBase CLI 已安装${NC}"
}

# 检查是否登录
check_login() {
  if ! tcb auth list &> /dev/null; then
    echo -e "${RED}❌ 未登录微信云开发${NC}"
    echo "请运行: tcb login"
    exit 1
  fi
  echo -e "${GREEN}✅ 已登录微信云开发${NC}"
}

# 显示当前配置
show_config() {
  echo ""
  echo "📋 部署配置:"
  echo "  - 环境ID: cloud1-9gz0vft7d1ddce7f"
  echo "  - 服务名称: skin-detection-server"
  echo "  - 版本: latest"
  echo "  - CPU: 0.5 核"
  echo "  - 内存: 1GB"
  echo "  - 实例数: 1"
  echo "  - 端口: 80（云托管健康检查）"
  echo ""
}

# 构建 Docker 镜像
build_image() {
  echo -e "${YELLOW}🔨 开始构建 Docker 镜像...${NC}"
  if [ ! -f "Dockerfile" ]; then
    echo -e "${RED}❌ 未找到 Dockerfile${NC}"
    exit 1
  fi

  # 使用 CloudBase CLI 构建
  echo "执行: tcb run build"
  tcb run build

  echo -e "${GREEN}✅ Docker 镜像构建完成${NC}"
}

# 部署到云托管
deploy() {
  echo -e "${YELLOW}🚀 开始部署到云托管...${NC}"

  # 方式1: 使用 tcb run service:deploy (推荐)
  echo "执行: tcb run service:deploy --env-id cloud1-9gz0vft7d1ddce7f"
  tcb run service:deploy \
    --env-id cloud1-9gz0vft7d1ddce7f \
    --service-name skin-detection-server \
    --version-name latest \
    --cpu 0.5 \
    --memory 1 \
    --min-num 1 \
    --max-num 1 \
    --container-port 80 \
    --env COZE_API_KEY=ea77474e-46bb-4f4e-a42f-99dedce29678 \
    --env COZE_MODEL=doubao-seed-1-6-vision-250815 \
    --env CLOUDBASE_ENV_ID=cloud1-9gz0vft7d1ddce7f \
    --env NODE_ENV=production

  echo -e "${GREEN}✅ 部署命令已发送${NC}"
}

# 等待部署完成
wait_for_deploy() {
  echo ""
  echo -e "${YELLOW}⏳ 等待部署完成（约 2-5 分钟）...${NC}"
  echo "您可以在微信云开发控制台查看部署进度:"
  echo "  https://console.cloud.tencent.com/tcb/env"
  echo ""
}

# 显示部署后配置
show_post_deploy_config() {
  echo -e "${GREEN}======================================"
  echo "  部署完成！请完成以下配置"
  echo "======================================${NC}"
  echo ""
  echo "1️⃣  配置小程序服务器域名"
  echo "  - 登录微信小程序后台: https://mp.weixin.qq.com/"
  echo "  - 开发 > 开发管理 > 开发设置 > 服务器域名"
  echo "  - request 合法域名: https://<云托管服务地址>.tcb.qcloud.la"
  echo "  - uploadFile 合法域名: https://<云托管服务地址>.tcb.qcloud.la"
  echo ""
  echo "2️⃣  配置小程序 project.config.json"
  echo "  - 修改 cloudfunctionRoot 指向云托管服务"
  echo "  - 添加 appid 配置"
  echo ""
  echo "3️⃣  测试接口"
  echo "  - 健康检查: https://<云托管服务地址>.tcb.qcloud.la/api"
  echo "  - 皮肤分析: https://<云托管服务地址>.tcb.qcloud.la/api/skin/analyze"
  echo ""
}

# 主函数
main() {
  check_cli
  check_login
  show_config
  build_image
  deploy
  wait_for_deploy
  show_post_deploy_config
}

# 执行主函数
main

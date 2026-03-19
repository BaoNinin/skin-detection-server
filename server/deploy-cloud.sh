#!/bin/bash

# 微信云托管快速部署脚本
# 使用方法：./deploy-cloud.sh <腾讯云命名空间> <镜像标签>

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查参数
if [ $# -lt 1 ]; then
    echo -e "${YELLOW}使用方法:${NC} ./deploy-cloud.sh <腾讯云命名空间> [镜像标签]"
    echo -e "${YELLOW}示例:${NC} ./deploy-cloud.sh my-namespace latest"
    exit 1
fi

NAMESPACE=$1
TAG=${2:-latest}
IMAGE_NAME="ccr.ccs.tencentyun.com/${NAMESPACE}/skin-detection-server:${TAG}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}开始部署到微信云托管${NC}"
echo -e "${GREEN}========================================${NC}"

# 1. 检查 Docker 是否安装
echo -e "\n${YELLOW}[1/6] 检查 Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: Docker 未安装，请先安装 Docker${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker 已安装${NC}"

# 2. 构建镜像
echo -e "\n${YELLOW}[2/6] 构建 Docker 镜像...${NC}"
docker build -t ${IMAGE_NAME} .
echo -e "${GREEN}✓ 镜像构建成功: ${IMAGE_NAME}${NC}"

# 3. 推送镜像
echo -e "\n${YELLOW}[3/6] 推送镜像到腾讯云容器镜像服务...${NC}"
docker push ${IMAGE_NAME}
echo -e "${GREEN}✓ 镜像推送成功${NC}"

# 4. 显示部署信息
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}部署信息${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "镜像地址: ${IMAGE_NAME}"
echo -e "\n${YELLOW}下一步操作:${NC}"
echo -e "1. 登录微信云开发控制台: https://console.cloud.tencent.com/tcb/env"
echo -e "2. 进入云托管 > 服务"
echo -e "3. 创建新服务或更新现有服务"
echo -e "4. 使用镜像地址: ${IMAGE_NAME}"
echo -e "5. 配置环境变量（参考 DEPLOYMENT_GUIDE.md）"
echo -e "6. 部署服务"
echo -e "\n${YELLOW}服务地址格式:${NC}"
echo -e "https://skin-detection-server-xxx.tcb.qcloud.la"
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}部署准备完成！${NC}"
echo -e "${GREEN}========================================${NC}"

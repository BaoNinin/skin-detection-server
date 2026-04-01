#!/bin/bash

# 小程序配置检查脚本

echo "=========================================="
echo "小程序配置检查"
echo "=========================================="

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_passed=0
check_failed=0

# 检查函数
check_item() {
    local desc=$1
    local command=$2

    echo -n "检查: $desc ... "
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ 通过${NC}"
        ((check_passed++))
    else
        echo -e "${RED}✗ 失败${NC}"
        ((check_failed++))
    fi
}

echo ""
echo "=== 基础配置检查 ==="

# 检查 AppID 一致性
echo ""
echo "=== AppID 配置检查 ==="
echo -e "${YELLOW}检查 AppID 是否一致...${NC}"

appid_in_env=$(grep "TARO_APP_WEAPP_APPID" .env.local | cut -d'=' -f2)
appid_in_project=$(grep "appid" project.config.json | cut -d'"' -f4)
appid_in_config=$(grep "TARO_APP_WEAPP_APPID" config/index.ts | grep -oP 'JSON\.stringify\(\K[^\)]+' | tr -d "'")

echo "  .env.local: $appid_in_env"
echo "  project.config.json: $appid_in_project"
echo "  config/index.ts: $appid_in_config"

if [ "$appid_in_env" = "$appid_in_project" ] && [ "$appid_in_env" = "$appid_in_config" ]; then
    echo -e "${GREEN}✓ AppID 配置一致${NC}"
    ((check_passed++))
else
    echo -e "${RED}✗ AppID 配置不一致${NC}"
    ((check_failed++))
fi

echo ""
echo "=== 域名配置检查 ==="

# 检查域名配置
check_item "域名配置在 .env.local" "grep -q 'PROJECT_DOMAIN=https://gaodiai.cn' .env.local"
check_item "域名配置在 config/index.ts" "grep -q 'PROJECT_DOMAIN.*gaodiai.cn' config/index.ts"
check_item "编译后的 common.js 包含域名" "grep -q 'gaodiai.cn' dist/common.js"

echo ""
echo "=== 编译输出检查 ==="

# 检查编译输出
check_item "dist 目录存在" "test -d dist"
check_item "project.config.json 存在" "test -f dist/project.config.json"
check_item "common.js 存在" "test -f dist/common.js"

echo ""
echo "=== 后端配置检查 ==="

# 检查后端配置
check_item "server/.env.local 存在" "test -f server/.env.local"
check_item "server/Dockerfile 存在" "test -f server/Dockerfile"
check_item "server/ecosystem.config.js 存在" "test -f server/ecosystem.config.js"

echo ""
echo "=== 网络连接检查 ==="

# 检查网络连接
check_item "服务器可访问" "curl -s -o /dev/null -w '%{http_code}' https://gaodiai.cn/api/hello | grep -q 200"

echo ""
echo "=========================================="
echo "检查结果统计"
echo "=========================================="
echo -e "通过: ${GREEN}${check_passed}${NC}"
echo -e "失败: ${RED}${check_failed}${NC}"

if [ $check_failed -eq 0 ]; then
    echo -e "\n${GREEN}✓ 所有检查通过！${NC}"
    echo -e "${GREEN}可以开始部署了！${NC}"
    exit 0
else
    echo -e "\n${RED}✗ 有 $check_failed 项检查失败${NC}"
    echo -e "${RED}请修复以上问题后再部署${NC}"
    exit 1
fi

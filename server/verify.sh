#!/bin/bash

# 微信云托管 - 服务验证脚本

echo "========================================"
echo "  微信云托管 - 服务验证工具"
echo "========================================"
echo ""

# 检查是否提供了服务地址
if [ -z "$1" ]; then
    echo "用法：./verify.sh <服务地址>"
    echo ""
    echo "示例："
    echo "  ./verify.sh https://skin-analysis-api-xxxx.service.tcloudbase.com"
    echo ""
    exit 1
fi

SERVICE_URL=$1

# 移除末尾的斜杠
SERVICE_URL=${SERVICE_URL%/}

echo "🔍 服务地址：$SERVICE_URL"
echo ""

# 测试 1：健康检查（如果有）
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "测试 1: 基础连接测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL/api/health" 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
    echo "✅ 服务正常运行（HTTP $HTTP_CODE）"
else
    echo "⚠️  无法连接服务（HTTP $HTTP_CODE）"
    echo "   可能原因："
    echo "   - 服务还未部署完成"
    echo "   - 服务地址不正确"
    echo "   - 需要配置 CORS 或其他中间件"
fi
echo ""

# 测试 2：历史记录接口（需要 userId）
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "测试 2: 历史记录接口"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESPONSE=$(curl -s "$SERVICE_URL/api/skin/history?userId=1" 2>/dev/null)

if echo "$RESPONSE" | grep -q '"code"'; then
    echo "✅ 接口响应正常"
    echo ""
    echo "响应数据："
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
else
    echo "⚠️  接口响应异常"
    echo ""
    echo "原始响应："
    echo "$RESPONSE"
fi
echo ""

# 测试 3：用户登录接口
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "测试 3: 用户登录接口（测试 POST 请求）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESPONSE=$(curl -s -X POST "$SERVICE_URL/api/user/login" \
  -H "Content-Type: application/json" \
  -d '{"code":"test"}' 2>/dev/null)

if echo "$RESPONSE" | grep -q '"code"'; then
    echo "✅ POST 接口正常"
    echo ""
    echo "响应数据："
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
else
    echo "⚠️  POST 接口可能异常（正常，因为测试 code 无效）"
fi
echo ""

echo "========================================"
echo "  验证完成"
echo "========================================"
echo ""
echo "📝 检查清单："
echo "  [ ] 服务可以访问"
echo "  [ ] API 接口返回 JSON 数据"
echo "  [ ] 数据库连接正常"
echo ""
echo "📌 下一步："
echo "  1. 如果所有测试通过，可以在小程序中配置服务器域名"
echo "  2. 如果有错误，请查看云托管日志"
echo ""
echo "详细部署指南，请查看：QUICK_DEPLOY.md"
echo ""

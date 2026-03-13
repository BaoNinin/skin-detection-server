#!/bin/bash

# NFC 文件部署脚本

echo "========================================"
echo "  NFC 文件部署工具"
echo "========================================"
echo ""

# 检查是否在 server 目录
if [ ! -f "package.json" ] || [ ! -f "Dockerfile" ]; then
    echo "❌ 错误：请在 server 目录下运行此脚本"
    echo "   当前目录：$(pwd)"
    exit 1
fi

# 创建 public 目录
if [ ! -d "public" ]; then
    echo "📁 创建 public 目录..."
    mkdir -p public
    echo "✅ public 目录已创建"
else
    echo "✅ public 目录已存在"
fi

echo ""
echo "📦 复制 NFC 相关文件..."

# 复制文件
if [ -f "nfc-redirect.html" ]; then
    cp nfc-redirect.html public/
    echo "✅ nfc-redirect.html 已复制"
else
    echo "⚠️  警告：nfc-redirect.html 不存在"
fi

if [ -f "nfc-config-tool.html" ]; then
    cp nfc-config-tool.html public/
    echo "✅ nfc-config-tool.html 已复制"
else
    echo "⚠️  警告：nfc-config-tool.html 不存在"
fi

echo ""
echo "========================================"
echo "  部署完成"
echo "========================================"
echo ""
echo "📄 文件位置："
echo "   - public/nfc-redirect.html"
echo "   - public/nfc-config-tool.html"
echo ""
echo "🌐 访问地址（部署后）："
echo "   - https://your-service-url/nfc-redirect.html"
echo "   - https://your-service-url/nfc-config-tool.html"
echo ""
echo "========================================"
echo "  下一步操作"
echo "========================================"
echo ""
echo "1. 修改 public/nfc-redirect.html 中的 URL Scheme"
echo ""
echo "2. 重新部署服务到微信云托管"
echo ""
echo "3. 测试网页访问"
echo ""
echo "4. 使用 NFC Tools 写入网页 URL 到 NFC 标签"
echo ""
echo "详细配置指南，请查看：NFC_QUICKSTART.md"
echo ""

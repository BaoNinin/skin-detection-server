#!/bin/bash

# 微信云托管 - 代码打包脚本

echo "========================================"
echo "  微信云托管 - 代码打包工具"
echo "========================================"
echo ""

# 检查是否在 server 目录
if [ ! -f "package.json" ] || [ ! -f "Dockerfile" ]; then
    echo "❌ 错误：请在 server 目录下运行此脚本"
    echo "   当前目录：$(pwd)"
    exit 1
fi

# 定义输出文件名
OUTPUT_FILE="skin-analysis-api.zip"

# 检查是否已存在旧文件
if [ -f "$OUTPUT_FILE" ]; then
    echo "⚠️  发现已存在的打包文件：$OUTPUT_FILE"
    read -p "是否删除并重新打包？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -f "$OUTPUT_FILE"
        echo "✅ 已删除旧文件"
    else
        echo "❌ 打包已取消"
        exit 0
    fi
fi

echo "📦 开始打包..."
echo ""

# 打包必需文件
echo "正在打包以下文件和文件夹："
echo "  ✅ Dockerfile"
echo "  ✅ cloudbaserc.json"
echo "  ✅ package.json"
echo "  ✅ pnpm-lock.yaml"
echo "  ✅ tsconfig.json"
echo "  ✅ nest-cli.json"
echo "  ✅ src/"
echo "  ✅ .dockerignore"
echo ""

# 执行打包
zip -r "$OUTPUT_FILE" \
  Dockerfile \
  cloudbaserc.json \
  package.json \
  pnpm-lock.yaml \
  tsconfig.json \
  nest-cli.json \
  src/ \
  .dockerignore

# 检查打包结果
if [ $? -eq 0 ]; then
    FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    echo ""
    echo "========================================"
    echo "  ✅ 打包成功！"
    echo "========================================"
    echo ""
    echo "📄 文件名：$OUTPUT_FILE"
    echo "📦 文件大小：$FILE_SIZE"
    echo "📁 文件位置：$(pwd)/$OUTPUT_FILE"
    echo ""
    echo "========================================"
    echo "  下一步操作"
    echo "========================================"
    echo ""
    echo "1. 登录腾讯云云托管控制台："
    echo "   https://console.cloud.tencent.com/tcb"
    echo ""
    echo "2. 创建或进入你的环境"
    echo ""
    echo "3. 新建服务 → 从代码包上传"
    echo ""
    echo "4. 上传文件：$OUTPUT_FILE"
    echo ""
    echo "5. 配置环境变量（参考 QUICK_DEPLOY.md）"
    echo ""
    echo "6. 部署服务"
    echo ""
    echo "详细部署指南，请查看：QUICK_DEPLOY.md"
    echo ""
else
    echo ""
    echo "❌ 打包失败！"
    echo "请检查："
    echo "  1. 是否安装了 zip 工具"
    echo "  2. 是否有足够的磁盘空间"
    echo "  3. 所有必需文件是否存在"
    exit 1
fi

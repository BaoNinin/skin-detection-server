#!/bin/bash
# 使用 GitHub Personal Access Token 推送代码

echo "========================================"
echo "GitHub 自动部署 - 推送代码"
echo "========================================"
echo ""

# 检查是否提供了 token
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ 错误：未提供 GitHub Token"
    echo ""
    echo "请按以下步骤创建 Token："
    echo "1. 访问：https://github.com/settings/tokens"
    echo "2. 点击 'Generate new token' -> 'Generate new token (classic)'"
    echo "3. 勾选 'repo' 权限"
    echo "4. 点击 'Generate token' 并复制"
    echo ""
    echo "然后运行："
    echo "GITHUB_TOKEN=<你的token> bash PUSH_TO_GITHUB.sh"
    echo ""
    exit 1
fi

echo "✅ Token 已提供"
echo ""

# 切换到项目目录
cd /workspace/projects

# 添加远程仓库
echo "📌 添加远程仓库..."
git remote set-url origin https://$GITHUB_TOKEN@github.com/BaoNini/skin-detection-server.git

# 推送代码
echo "🚀 推送代码到 GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 代码推送成功！"
    echo ""
    echo "📍 仓库地址：https://github.com/BaoNini/skin-detection-server"
    echo ""
    echo "📋 下一步："
    echo "1. 访问微信云托管：https://console.cloud.tencent.com/tcb/service"
    echo "2. 创建服务 → 代码来源选择 GitHub"
    echo "3. 设置代码目录为：server"
    echo "4. 配置环境变量（见 GITHUB_DEPLOYMENT_CHECKLIST.md）"
    echo "5. 部署服务"
    echo ""
else
    echo ""
    echo "❌ 推送失败"
    echo ""
    echo "请检查："
    echo "1. Token 是否正确"
    echo "2. Token 是否有 'repo' 权限"
    echo "3. 仓库名称是否正确"
    echo ""
fi

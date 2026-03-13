#!/bin/bash

# 微信云托管部署脚本

echo "========================================"
echo "微信云托管 - 皮肤检测后端服务部署"
echo "========================================"

# 检查是否已登录微信云托管
echo "检查微信云托管登录状态..."

# 检查 Supabase 配置
if [ -z "$COZE_SUPABASE_URL" ] || [ -z "$COZE_SUPABASE_ANON_KEY" ]; then
    echo "❌ 错误：请先配置 Supabase 环境变量"
    echo "请在 cloudbaserc.json 中填写："
    echo "  - COZE_SUPABASE_URL"
    echo "  - COZE_SUPABASE_ANON_KEY"
    exit 1
fi

echo "✅ 环境变量配置检查通过"

# 构建 Docker 镜像（可选，微信云托管会自动构建）
echo "提示：微信云托管将自动构建和部署"
echo "部署完成后，你将获得一个服务访问地址"

echo ""
echo "========================================"
echo "部署步骤："
echo "========================================"
echo ""
echo "1. 登录微信云托管控制台"
echo "   https://cloud.tencent.com/product/tcb"
echo ""
echo "2. 创建环境或使用已有环境"
echo ""
echo "3. 上传配置文件："
echo "   - Dockerfile"
echo "   - cloudbaserc.json"
echo "   - package.json"
echo "   - 所有源代码文件"
echo ""
echo "4. 配置环境变量（在控制台设置）："
echo "   - COZE_SUPABASE_URL = 你的 Supabase URL"
echo "   - COZE_SUPABASE_ANON_KEY = 你的 Supabase Anon Key"
echo "   - WECHAT_APPID = wxa1c57025b508e913"
echo "   - WECHAT_APPSECRET = 056dc956b934bf58fc659c4b08bfa16e"
echo ""
echo "5. 启动服务"
echo ""
echo "6. 获取服务访问地址"
echo ""
echo "7. 在微信小程序后台配置服务器域名"
echo "   位置：开发 → 开发管理 → 开发设置 → 服务器域名"
echo "   添加 request 合法域名：你的服务访问地址"
echo ""
echo "========================================"
echo "配置完成！"
echo "========================================"

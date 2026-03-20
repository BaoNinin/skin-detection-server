#!/bin/bash

# Nginx 配置修复脚本
# 解决开发者工具 ERR_CONNECTION_RESET 问题

set -e

echo "=========================================="
echo "Nginx 配置修复脚本"
echo "=========================================="

# 检查是否以 root 运行
if [ "$EUID" -ne 0 ]; then
    echo "请使用 root 权限运行此脚本"
    echo "使用方法: sudo bash fix-nginx.sh"
    exit 1
fi

# 备份当前配置
echo ""
echo "[1/5] 备份当前 Nginx 配置..."
cp /etc/nginx/sites-available/gaodiai.cn* /tmp/ 2>/dev/null || true
echo "✓ 配置已备份到 /tmp/"

# 上传新配置
echo ""
echo "[2/5] 上传新配置..."
if [ -f "nginx-config/gaodiai.cn-prod-fixed.conf" ]; then
    cp nginx-config/gaodiai.cn-prod-fixed.conf /etc/nginx/sites-available/gaodiai.cn-prod
    echo "✓ 新配置已上传"
else
    echo "错误: 找不到配置文件 nginx-config/gaodiai.cn-prod-fixed.conf"
    exit 1
fi

# 启用新配置
echo ""
echo "[3/5] 启用新配置..."
ln -sf /etc/nginx/sites-available/gaodiai.cn-prod /etc/nginx/sites-enabled/gaodiai.cn
echo "✓ 新配置已启用"

# 测试配置
echo ""
echo "[4/5] 测试 Nginx 配置..."
if nginx -t; then
    echo "✓ 配置测试通过"
else
    echo "✗ 配置测试失败"
    echo "正在恢复备份..."
    if [ -f /tmp/gaodiai.cn ]; then
        cp /tmp/gaodiai.cn /etc/nginx/sites-available/
    fi
    exit 1
fi

# 重新加载 Nginx
echo ""
echo "[5/5] 重新加载 Nginx..."
systemctl reload nginx
echo "✓ Nginx 已重新加载"

# 显示状态
echo ""
echo "=========================================="
echo "Nginx 状态"
echo "=========================================="
systemctl status nginx | head -10

# 测试接口
echo ""
echo "=========================================="
echo "测试接口"
echo "=========================================="
echo "测试 https://gaodiai.cn/api/hello ..."
curl -s https://gaodiai.cn/api/hello
echo ""
echo ""

echo "=========================================="
echo "修复完成！"
echo "=========================================="
echo ""
echo "下一步："
echo "1. 在开发者工具中清除缓存"
echo "2. 重新编译小程序"
echo "3. 测试登录功能"
echo ""
echo "如果还有问题，查看日志："
echo "  tail -f /var/log/nginx/gaodiai-error.log"
echo "  tail -f /var/log/nginx/gaodiai-access.log"

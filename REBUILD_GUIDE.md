# 🔄 强制重新构建指南

如果重新打开开发者工具后还是使用旧配置，执行以下步骤：

## 步骤 1：删除 dist 目录

```bash
cd /workspace/projects
rm -rf dist
```

## 步骤 2：重新构建

```bash
pnpm build:weapp
```

## 步骤 3：重新打开开发者工具

1. 完全关闭微信开发者工具
2. 重新打开
3. 查看日志

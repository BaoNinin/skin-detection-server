# 本地数据存储说明

本目录用于存储本地开发环境的数据文件。

## 目录结构

```
server/data/
├── README.md       # 本说明文件
└── history.json    # 皮肤检测历史记录
```

## 历史记录数据结构

```json
[
  {
    "id": 1,
    "userId": 1,
    "skinType": "干性皮肤",
    "concerns": ["干燥", "细纹"],
    "moisture": 45,
    "oiliness": 30,
    "sensitivity": 40,
    "acne": 0,
    "wrinkles": 15,
    "spots": 0,
    "pores": 25,
    "blackheads": 10,
    "recommendations": ["加强保湿", "使用温和的洁面产品"],
    "imageUrl": null,
    "createdAt": "2026-03-10T10:30:00.000Z",
    "updatedAt": "2026-03-10T10:30:00.000Z"
  }
]
```

## 数据字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 记录 ID（自增） |
| userId | number | 用户 ID |
| skinType | string | 皮肤类型 |
| concerns | string[] | 皮肤问题列表 |
| moisture | number | 水分含量 (0-100) |
| oiliness | number | 油性程度 (0-100) |
| sensitivity | number | 敏感度 (0-100) |
| acne | number | 痘痘严重程度 (0-100) |
| wrinkles | number | 皱纹严重程度 (0-100) |
| spots | number | 色斑严重程度 (0-100) |
| pores | number | 毛孔粗大程度 (0-100) |
| blackheads | number | 黑头严重程度 (0-100) |
| recommendations | string[] | 护肤建议列表 |
| imageUrl | string \| null | 图片 URL |
| createdAt | string | 创建时间 (ISO 8601) |
| updatedAt | string | 更新时间 (ISO 8601) |

## 使用说明

### 开发环境

本方案仅适用于本地开发环境，不需要配置任何数据库。

### API 接口

- **获取历史记录**：`GET /api/skin/history?userId=1`
- **保存历史记录**：`POST /api/skin/history`
- **删除历史记录**：`DELETE /api/skin/history/:id`

### 数据持久化

- 数据保存在 `server/data/history.json` 文件中
- 每次修改操作都会自动同步到文件
- 重启服务后数据不会丢失

### 注意事项

1. 本地数据文件已添加到 `.gitignore`，不会被提交到 Git 仓库
2. 多实例并发写入可能导致数据不一致（开发环境通常不会出现）
3. 生产环境建议使用数据库（如 PostgreSQL、MySQL 等）

## 清空数据

如需清空所有历史记录，可以将 `history.json` 文件内容设置为空数组：

```json
[]
```

然后重启后端服务。

# 智能皮肤检测小程序 - 设计指南

## 品牌定位

**应用定位**：AI 智能皮肤检测与产品推荐小程序
**设计风格**：优雅、专业、科技感
**目标用户**：25-40 岁关注皮肤健康的都市女性

## 配色方案

### 主色板

- **主色**：Rose Pink（玫瑰粉）`#E8B4BC` → Tailwind: `text-rose-400` / `bg-rose-400`
  - 意象来源：玫瑰花露、护肤精华
  - 用途：品牌主色、强调元素

- **辅助色**：Lavender（薰衣草紫）`#D8B4D8` → Tailwind: `text-purple-300` / `bg-purple-300`
  - 意象来源：薰衣草精油、舒缓护肤
  - 用途：次级强调、渐变背景

### 中性色

- **背景色**
  - 主背景：纯白 `#FFFFFF` → `bg-white`
  - 次背景：浅粉 `#FFF5F6` → `bg-rose-50`

- **文字色**
  - 主标题：深灰 `#1F2937` → `text-gray-800`
  - 正文文字：中灰 `#4B5563` → `text-gray-600`
  - 辅助文字：浅灰 `#9CA3AF` → `text-gray-400`

### 语义色

- **成功**：Emerald Green `#10B981` → `text-emerald-500` / `bg-emerald-500`
  - 用途：皮肤状态健康提示

- **警告**：Amber Orange `#F59E0B` → `text-amber-500` / `bg-amber-500`
  - 用途：需关注提示

- **错误**：Rose Red `#F43F5E` → `text-rose-500` / `bg-rose-500`
  - 用途：皮肤问题提示

## 字体规范

### 字体族
- **中文**：PingFang SC、Noto Sans SC
- **英文/数字**：SF Pro Display、Helvetica Neue

### 字号层级

| 层级 | 字号 | Tailwind | 用途 |
|------|------|----------|------|
| H1 | 28px | `text-2xl` | 页面主标题 |
| H2 | 24px | `text-xl` | 卡片标题 |
| H3 | 20px | `text-lg` | 小节标题 |
| Body | 16px | `text-base` | 正文内容 |
| Small | 14px | `text-sm` | 辅助信息 |
| Caption | 12px | `text-xs` | 标签、说明 |

## 间距系统

- **页面边距**：16px（移动端） → `p-4`
- **卡片内边距**：20px → `p-5`
- **列表间距**：12px → `gap-3`
- **组件间距**：8px → `gap-2`

## 组件规范

### 按钮

**主按钮**
```tsx
<Button className="bg-rose-400 text-white rounded-full py-3 px-8 font-medium">
  开始检测
</Button>
```

**次按钮**
```tsx
<Button className="bg-white text-rose-400 border-2 border-rose-400 rounded-full py-3 px-8 font-medium">
  查看详情
</Button>
```

### 卡片

```tsx
<View className="bg-white rounded-2xl p-5 shadow-sm">
  <Text className="text-lg font-semibold text-gray-800 mb-2 block">卡片标题</Text>
  <Text className="text-base text-gray-600 block">卡片内容</Text>
</View>
```

### 输入框

```tsx
<View className="bg-gray-50 rounded-xl px-4 py-3">
  <Input className="w-full bg-transparent text-base" placeholder="请输入..." />
</View>
```

### 空状态

```tsx
<View className="flex flex-col items-center justify-center py-12">
  <Image src="/assets/empty.png" className="w-32 h-32 mb-4" />
  <Text className="text-base text-gray-400 text-center block">暂无数据</Text>
</View>
```

### 加载状态

```tsx
<View className="flex flex-col items-center justify-center py-12">
  <View className="w-12 h-12 border-4 border-rose-200 border-t-rose-400 rounded-full animate-spin mb-4" />
  <Text className="text-base text-gray-600 block">加载中...</Text>
</View>
```

## 导航结构

### TabBar 配置

- **首页**：`pages/index/index` - 图标：Camera
- **历史记录**：`pages/history/index` - 图标：Clock
- **我的**：`pages/profile/index` - 图标：User

### 页面跳转规范

- TabBar 页面切换：`Taro.switchTab()`
- 普通页面跳转：`Taro.navigateTo()`

## 特殊组件

### 皮肤状态标签

```tsx
<View className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100">
  <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
  <Text className="text-sm text-emerald-600 block">健康</Text>
</View>
```

### 产品卡片

```tsx
<View className="bg-white rounded-2xl overflow-hidden shadow-sm">
  <Image src={product.image} className="w-full h-48" />
  <View className="p-5">
    <Text className="text-lg font-semibold text-gray-800 mb-2 block">{product.name}</Text>
    <Text className="text-sm text-gray-500 mb-4 block">{product.description}</Text>
    <View className="flex items-center justify-between">
      <Text className="text-xl font-bold text-rose-400 block">¥{product.price}</Text>
      <Button size="mini" type="primary">立即购买</Button>
    </View>
  </View>
</View>
```

## 小程序约束

### 包体积限制
- 主包大小限制：2MB
- 总包大小限制：20MB
- 图片资源优先使用 CDN

### 图片策略
- 头像、产品图：使用 Supabase Storage
- 占位图：使用本地 SVG 或小程序内嵌
- 图片格式：优先 WebP，降级 JPG

### 性能优化
- 首屏加载：关键数据预加载
- 列表渲染：使用分页加载
- 图片懒加载：`lazy-load={true}`

## 设计禁忌

- ❌ 避免使用过于鲜艳的颜色（如纯红、纯蓝）
- ❌ 避免过多圆角（统一使用 rounded-2xl 或 rounded-full）
- ❌ 避免使用过多的阴影效果（仅卡片使用轻阴影）
- ❌ 避免使用复杂的渐变（仅在背景或强调元素使用）
- ❌ 避免使用过多的动画（仅在页面切换或加载时使用）

## 跨端兼容性

- **Camera 组件**：仅在小程序可用，H5 需降级提示
- **图片上传**：使用 `Network.uploadFile` 统一处理
- **字体渲染**：H5 和小程序字体栈需兼容

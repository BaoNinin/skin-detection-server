import { View } from '@tarojs/components'

interface SkeletonProps {
  className?: string
  count?: number
}

export default function Skeleton({ className = '', count = 1 }: SkeletonProps) {
  return (
    <View className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} className="bg-gray-200 rounded animate-pulse" />
      ))}
    </View>
  )
}

// 卡片骨架屏
export function SkeletonCard() {
  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
      {/* 图片骨架 */}
      <View className="w-full h-48 bg-gray-200 rounded-xl mb-4 animate-pulse" />

      {/* 标题骨架 */}
      <View className="h-6 bg-gray-200 rounded w-3/4 mb-3 animate-pulse" />

      {/* 描述骨架 */}
      <View className="space-y-2 mb-4">
        <View className="h-4 bg-gray-200 rounded w-full animate-pulse" />
        <View className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
      </View>

      {/* 底部骨架 */}
      <View className="flex items-center justify-between">
        <View className="h-8 bg-gray-200 rounded w-20 animate-pulse" />
        <View className="h-10 bg-gray-200 rounded-full w-24 animate-pulse" />
      </View>
    </View>
  )
}

// 列表项骨架屏
export function SkeletonListItem() {
  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm mb-4 flex items-center gap-4">
      {/* 左侧图片骨架 */}
      <View className="w-20 h-20 bg-gray-200 rounded-xl flex-shrink-0 animate-pulse" />

      {/* 右侧内容骨架 */}
      <View className="flex-1">
        <View className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
        <View className="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse" />
        <View className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
      </View>
    </View>
  )
}

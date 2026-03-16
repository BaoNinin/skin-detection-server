import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'

interface EmptyStateProps {
  icon?: string // 图标或 emoji
  image?: string // 图片 URL
  title: string
  description?: string
  actionText?: string
  onAction?: () => void
  className?: string
}

export default function EmptyState({
  icon,
  image,
  title,
  description,
  actionText,
  onAction,
  className = ''
}: EmptyStateProps) {
  const handleAction = () => {
    if (onAction) {
      onAction()
    } else if (actionText) {
      Taro.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    }
  }

  return (
    <View className={`flex flex-col items-center justify-center py-20 px-8 ${className}`}>
      {/* 图标或图片 */}
      {image ? (
        <Image
          src={image}
          mode="aspectFit"
          className="w-32 h-32 mb-6"
        />
      ) : icon ? (
        <View className="w-32 h-32 mb-6 flex items-center justify-center">
          <Text className="text-6xl">{icon}</Text>
        </View>
      ) : null}

      {/* 标题 */}
      <Text className="text-lg font-semibold text-gray-800 mb-3 block text-center">
        {title}
      </Text>

      {/* 描述 */}
      {description && (
        <Text className="text-sm text-gray-500 mb-6 block text-center leading-relaxed">
          {description}
        </Text>
      )}

      {/* 操作按钮 */}
      {actionText && (
        <View
          onClick={handleAction}
          className="bg-rose-400 text-white px-8 py-3 rounded-full active:bg-rose-500 transition-colors"
        >
          <Text className="text-base font-medium block">{actionText}</Text>
        </View>
      )}
    </View>
  )
}

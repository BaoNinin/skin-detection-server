import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'

interface BackHomeNavBarProps {
  title: string
  backgroundColor?: string
  textColor?: string
  showBack?: boolean
}

export default function BackHomeNavBar({
  title,
  backgroundColor = '#FFFFFF',
  textColor = '#1F2937',
  showBack = true
}: BackHomeNavBarProps) {
  const statusBarHeight = Taro.getStorageSync('statusBarHeight') || Taro.getSystemInfoSync().statusBarHeight
  const navBarHeight = (Taro.getSystemInfoSync().statusBarHeight || 44) + 44

  const handleBack = () => {
    Taro.navigateBack()
  }

  const handleBackHome = () => {
    Taro.switchTab({
      url: '/pages/landing/index'
    })
  }

  return (
    <View
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        height: `${navBarHeight}px`,
        backgroundColor
      }}
    >
      {/* 状态栏占位 */}
      <View style={{ height: `${statusBarHeight}px` }} />

      {/* 导航栏内容 */}
      <View className="flex items-center justify-between px-4" style={{ height: '44px' }}>
        {/* 左侧：返回按钮 + 返回主页按钮 */}
        <View className="flex items-center gap-2">
          {showBack && (
            <View
              onClick={handleBack}
              className="w-8 h-8 flex items-center justify-center active:bg-black/5 rounded-full transition-colors"
            >
              <Text className="text-2xl" style={{ color: textColor }}>
                ←
              </Text>
            </View>
          )}
          <View
            onClick={handleBackHome}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <Text className="text-sm" style={{ color: textColor }}>
              返回主页
            </Text>
          </View>
        </View>

        {/* 中间：标题 */}
        <Text
          className="font-semibold text-base"
          style={{
            color: textColor,
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          {title}
        </Text>

        {/* 右侧：占位，保持标题居中 */}
        <View className="w-24" />
      </View>
    </View>
  )
}

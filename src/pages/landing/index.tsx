import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import landingBg from '@/assets/landing-bg.png'
import logoImage from '@/assets/logo.png'

export default function LandingPage() {
  const handleStartDetection = () => {
    Taro.navigateTo({
      url: '/pages/camera/index'
    })
  }

  const handleGoToHistory = () => {
    Taro.switchTab({
      url: '/pages/history/index'
    })
  }

  const handleGoToProfile = () => {
    Taro.switchTab({
      url: '/pages/profile/index'
    })
  }

  return (
    <View className="min-h-screen relative bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500">
      {/* 背景图片 */}
      <Image
        src={landingBg}
        className="absolute inset-0 w-full h-full opacity-30"
        mode="aspectFill"
      />

      {/* 内容层 */}
      <View className="relative z-10 min-h-screen bg-gradient-to-b from-transparent via-blue-900/50 to-blue-900/70 backdrop-blur-sm">
      <View className="flex flex-col items-center justify-center px-8 py-12">
        <View className="mb-8">
          <View className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg">
            <Image
              src={logoImage}
              className="w-24 h-24"
              style={{ marginLeft: '12px' }}
              mode="aspectFit"
            />
          </View>
        </View>

        <Text className="text-3xl font-bold text-gray-800 mb-2 text-center block">
          智能皮肤检测
        </Text>
        <Text className="text-base text-gray-500 text-center mb-12 block">
          AI 科技，精准分析，为您定制护肤方案
        </Text>

        <View
          onClick={handleStartDetection}
          className="w-full bg-blue-700 rounded-2xl py-4 px-6 flex items-center justify-center shadow-md mb-8"
        >
          <Text className="text-xl text-white font-semibold block">
            📷 开始检测
          </Text>
        </View>

        <View className="w-full space-y-3">
          <View
            onClick={handleGoToHistory}
            className="w-full bg-white rounded-xl py-4 px-6 flex items-center justify-center shadow-sm"
          >
            <Text className="text-lg text-gray-700 block">📋 历史记录</Text>
          </View>

          <View
            onClick={handleGoToProfile}
            className="w-full bg-white rounded-xl py-4 px-6 flex items-center justify-center shadow-sm"
          >
            <Text className="text-lg text-gray-700 block">👤 个人中心</Text>
          </View>
        </View>
      </View>

      <View className="px-8 pb-8">
        <View className="bg-white rounded-xl p-6 shadow-sm">
          <Text className="text-sm text-gray-600 text-center block">
            💡 使用提示：请确保光线充足，面部正对摄像头，保持表情自然
          </Text>
        </View>
      </View>
      </View>
    </View>
  )
}

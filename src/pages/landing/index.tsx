import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'

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
    <View className="min-h-screen relative">
      {/* 背景图片 */}
      <Image
        src="https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F%E9%A6%96%E9%A1%B5%E8%83%8C%E6%99%AF-%E8%93%9D%E8%89%B2.png&nonce=62f572a4-19f5-4e3e-8fa7-8c6474589c10&project_id=7616586290808668211&sign=a8f621742ffaa717c2b8038dbd3c93b0865d09f555ec1f0e19952ad9ca8a21b5"
        className="absolute inset-0 w-full h-full"
        mode="aspectFill"
      />
      
      {/* 内容层 */}
      <View className="relative z-10 bg-gradient-to-b from-slate-50 to-white/95 min-h-screen">
      <View className="flex flex-col items-center justify-center px-8 py-12">
        <View className="mb-8">
          <View className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg">
            <Image
              src="https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2FLOGO-%E6%AD%A3%E6%96%B9%E5%BD%A2-%E9%BB%91.png&nonce=7e63e028-a3c6-40a3-baa1-59f20c007ce1&project_id=7616586290808668211&sign=f3a066447e3278a8f59cc242406fed69f34e7cb20be636432891094c73c6122b"
              className="w-24 h-24 ml-2"
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

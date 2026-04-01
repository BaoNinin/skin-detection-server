import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import landingBg from '@/assets/landing-bg.png'
import logoImage from '@/assets/logo.png'

export default function LandingPage() {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  const handleStartDetection = () => {
    // 检查用户是否已同意隐私协议
    const privacyAgreed = Taro.getStorageSync('privacyAgreed')
    if (privacyAgreed) {
      // 已同意过，直接进入
      Taro.navigateTo({ url: '/pages/camera/index' })
    } else {
      // 首次使用，弹出隐私授权弹窗
      setShowPrivacyModal(true)
    }
  }

  const handleAgreePrivacy = () => {
    Taro.setStorageSync('privacyAgreed', true)
    setShowPrivacyModal(false)
    Taro.navigateTo({ url: '/pages/camera/index' })
  }

  const handleDisagreePrivacy = () => {
    setShowPrivacyModal(false)
    Taro.showToast({
      title: '您拒绝了授权，无法使用检测功能',
      icon: 'none',
      duration: 2000
    })
  }

  const handleGoToHistory = () => {
    Taro.switchTab({ url: '/pages/history/index' })
  }

  const handleGoToProfile = () => {
    Taro.switchTab({ url: '/pages/profile/index' })
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

      {/* 隐私授权弹窗 */}
      {showPrivacyModal && (
        <View
          className="fixed inset-0 bg-black/60 flex items-end justify-center z-50"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
        >
          <View className="bg-white rounded-t-3xl p-6 w-full max-h-screen overflow-y-auto">
            <Text className="text-xl font-bold text-gray-800 mb-4 block text-center">
              使用前请阅读
            </Text>

            <View className="bg-blue-50 rounded-2xl p-4 mb-4">
              <Text className="text-sm font-semibold text-blue-800 mb-2 block">
                📋 功能说明
              </Text>
              <Text className="text-sm text-gray-700 leading-6 block">
                本功能将请求您的相机或相册权限，以获取您拍摄或选择的照片，用于分析皮肤纹理状态（水分、油脂、毛孔、敏感度等维度），为您提供个性化护肤建议。
              </Text>
            </View>

            <View className="bg-green-50 rounded-2xl p-4 mb-4">
              <Text className="text-sm font-semibold text-green-800 mb-2 block">
                🔒 数据处理说明
              </Text>
              <View className="space-y-1">
                <Text className="text-sm text-gray-700 block">• 照片仅用于本次皮肤状态分析</Text>
                <Text className="text-sm text-gray-700 block">• 分析完成后，图片即时删除，不做存储</Text>
                <Text className="text-sm text-gray-700 block">• 不采集、不识别、不存储任何生物特征信息</Text>
                <Text className="text-sm text-gray-700 block">• 不会将数据共享给任何第三方</Text>
              </View>
            </View>

            <Text className="text-xs text-gray-400 text-center mb-4 block">
              点击「同意」即表示您已阅读并同意上述说明{'\n'}
              拒绝授权不影响小程序其他功能的使用
            </Text>

            <View className="flex gap-3">
              <View
                onClick={handleDisagreePrivacy}
                className="flex-1 bg-gray-100 rounded-2xl py-4 flex items-center justify-center"
              >
                <Text className="text-gray-600 text-base font-medium block">不同意</Text>
              </View>
              <View
                onClick={handleAgreePrivacy}
                className="flex-1 bg-blue-700 rounded-2xl py-4 flex items-center justify-center"
              >
                <Text className="text-white text-base font-medium block">同意</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

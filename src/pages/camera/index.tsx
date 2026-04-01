import { View, Text, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { startNFCDiscovery, stopNFCDiscovery, NFCData } from '@/utils/nfc'

export default function CameraPage() {
  const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP
  const [selectedImagePath, setSelectedImagePath] = useState<string>('')
  const [showPreview, setShowPreview] = useState(false)

  // 冷却时间相关状态
  const [showCoolingModal, setShowCoolingModal] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)
  const [cooldownDisplay, setCooldownDisplay] = useState({ minutes: 0, seconds: 0 })

  // 接收 NFC 启动参数
  useEffect(() => {
    const launchOptions = Taro.getLaunchOptionsSync()
    const { query, scene } = launchOptions

    console.log('启动参数:', { query, scene })

    if (query?.from === 'nfc' || scene === 1047) {
      console.log('NFC 触发跳转')
      if (query?.deviceId) {
        Taro.setStorageSync('nfc_device_id', query.deviceId)
      }
    }
  }, [])

  // NFC 实时监听
  useEffect(() => {
    if (!isWeapp) return

    const handleNFCDiscovered = (data: NFCData) => {
      console.log('发现 NFC 标签:', data)
      if (data.action === 'analyze') {
        console.log('NFC 触发自动拍照')
        handleChoosePhoto()
      }
    }

    const handleNFCError = (error: any) => {
      console.error('NFC 监听错误:', error)
    }

    startNFCDiscovery(handleNFCDiscovered, handleNFCError)

    return () => {
      stopNFCDiscovery()
    }
  }, [])

  // 冷却时间倒计时
  useEffect(() => {
    if (showCoolingModal && remainingTime > Date.now()) {
      const interval = setInterval(() => {
        const remainingSeconds = Math.ceil((remainingTime - Date.now()) / 1000)
        const minutes = Math.floor(remainingSeconds / 60)
        const seconds = remainingSeconds % 60
        setCooldownDisplay({ minutes, seconds })
        if (remainingSeconds <= 0) {
          setShowCoolingModal(false)
        }
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [showCoolingModal, remainingTime])

  // 检查冷却时间
  const checkCooldown = (): boolean => {
    const lastAnalysisTime = Taro.getStorageSync('lastAnalysisTime')
    if (lastAnalysisTime) {
      const now = Date.now()
      const cooldownPeriod = 5 * 60 * 1000 // 5 分钟冷却
      const timeSinceLastAnalysis = now - lastAnalysisTime
      if (timeSinceLastAnalysis < cooldownPeriod) {
        const remainingMilliseconds = cooldownPeriod - timeSinceLastAnalysis
        setRemainingTime(now + remainingMilliseconds)
        setShowCoolingModal(true)
        return false
      }
    }
    return true
  }

  // 使用 wx.chooseMedia 选择或拍摄照片
  const handleChoosePhoto = () => {
    if (!checkCooldown()) return

    Taro.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera', 'album'],
      camera: 'front',
      success: (res) => {
        const tempFilePath = res.tempFiles[0]?.tempFilePath
        if (tempFilePath) {
          console.log('已选择图片:', tempFilePath)
          setSelectedImagePath(tempFilePath)
          setShowPreview(true)
        }
      },
      fail: (err) => {
        console.error('选择图片失败:', err)
        if (err.errMsg && !err.errMsg.includes('cancel')) {
          Taro.showToast({ title: '获取图片失败，请重试', icon: 'none' })
        }
      }
    })
  }

  // 确认使用所选图片，进入分析页面
  const handleConfirmPhoto = () => {
    if (!selectedImagePath) return

    // 记录本次分析时间（用于冷却计算）
    Taro.setStorageSync('lastAnalysisTime', Date.now())

    Taro.redirectTo({
      url: `/pages/analyzing/index?imagePath=${encodeURIComponent(selectedImagePath)}&scanSuccess=true`
    })
  }

  // 重新选择照片
  const handleRetakePhoto = () => {
    setSelectedImagePath('')
    setShowPreview(false)
    handleChoosePhoto()
  }

  // 取消预览
  const handleCancelPreview = () => {
    setSelectedImagePath('')
    setShowPreview(false)
  }

  const statusBarHeight = Taro.getSystemInfoSync().statusBarHeight || 44

  return (
    <View className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-800">
      {/* 状态栏占位 */}
      <View style={{ height: `${statusBarHeight}px` }} />

      {/* 导航栏 */}
      <View className="flex items-center px-4 py-3">
        <View
          onClick={() => Taro.navigateBack()}
          className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3"
        >
          <Text className="text-white text-lg">‹</Text>
        </View>
        <Text className="text-white text-lg font-semibold">皮肤检测</Text>
      </View>

      {/* 主内容区 */}
      {!showPreview ? (
        <View className="flex flex-col items-center px-6 pt-8">
          {/* 拍照引导图示 */}
          <View className="w-64 h-64 border-4 border-white/60 rounded-full flex items-center justify-center mb-8 relative">
            <View className="w-52 h-52 border-2 border-dashed border-white/30 rounded-full flex items-center justify-center">
              <Text className="text-6xl">🤳</Text>
            </View>
            {/* 四角装饰 */}
            <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-300 rounded-tl-lg" />
            <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-300 rounded-tr-lg" />
            <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-300 rounded-bl-lg" />
            <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-300 rounded-br-lg" />
          </View>

          <Text className="text-white text-xl font-semibold mb-3 text-center block">
            开始皮肤检测
          </Text>
          <Text className="text-white/70 text-sm text-center mb-8 block leading-6">
            请在光线充足的环境下拍摄，{'\n'}
            保持面部正对摄像头，表情自然
          </Text>

          {/* 拍照提示 */}
          <View className="w-full bg-white/10 rounded-2xl p-4 mb-8">
            <Text className="text-white/90 text-sm font-medium mb-3 block">拍摄建议</Text>
            <View className="space-y-2">
              <View className="flex items-center gap-2">
                <Text className="text-green-400">✓</Text>
                <Text className="text-white/80 text-sm block">光线充足、均匀（避免直射强光）</Text>
              </View>
              <View className="flex items-center gap-2">
                <Text className="text-green-400">✓</Text>
                <Text className="text-white/80 text-sm block">面部居中，距摄像头约30-40cm</Text>
              </View>
              <View className="flex items-center gap-2">
                <Text className="text-green-400">✓</Text>
                <Text className="text-white/80 text-sm block">保持自然表情，放松面部肌肉</Text>
              </View>
              <View className="flex items-center gap-2">
                <Text className="text-amber-400">✗</Text>
                <Text className="text-white/80 text-sm block">请先卸妆或素颜状态下检测</Text>
              </View>
            </View>
          </View>

          {/* 拍照按钮 */}
          <View
            onClick={handleChoosePhoto}
            className="w-full bg-white rounded-2xl py-4 flex items-center justify-center shadow-lg mb-4"
          >
            <Text className="text-blue-800 text-xl font-bold block">📷 拍照检测</Text>
          </View>

          <Text className="text-white/50 text-xs text-center block">
            也可从相册选择已有照片进行检测
          </Text>
        </View>
      ) : (
        /* 照片预览区 */
        <View className="flex flex-col items-center px-6 pt-4">
          <Text className="text-white text-lg font-semibold mb-4 block">确认照片</Text>

          <View className="w-72 h-72 rounded-2xl overflow-hidden mb-6 border-4 border-white/40">
            <Image
              src={selectedImagePath}
              mode="aspectFill"
              className="w-full h-full"
            />
          </View>

          <Text className="text-white/70 text-sm text-center mb-6 block">
            照片将用于本次皮肤状态分析，分析完成后立即删除
          </Text>

          <View className="w-full space-y-3">
            <View
              onClick={handleConfirmPhoto}
              className="w-full bg-white rounded-2xl py-4 flex items-center justify-center shadow-lg"
            >
              <Text className="text-blue-800 text-lg font-bold block">✓ 开始分析</Text>
            </View>

            <View
              onClick={handleRetakePhoto}
              className="w-full bg-white/20 rounded-2xl py-3 flex items-center justify-center"
            >
              <Text className="text-white text-base block">重新拍照</Text>
            </View>

            <View
              onClick={handleCancelPreview}
              className="w-full py-3 flex items-center justify-center"
            >
              <Text className="text-white/60 text-sm block">取消</Text>
            </View>
          </View>
        </View>
      )}

      {/* 冷却时间弹窗 */}
      {showCoolingModal && (
        <View className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <View className="bg-white rounded-2xl p-6 mx-6 w-72">
            <Text className="text-xl font-bold text-gray-800 mb-2 block text-center">检测冷却中</Text>
            <Text className="text-sm text-gray-500 mb-4 block text-center">
              为确保检测准确性，请稍后再试
            </Text>
            <View className="bg-blue-50 rounded-xl py-4 mb-4 flex items-center justify-center">
              <Text className="text-3xl font-bold text-blue-700 block">
                {String(cooldownDisplay.minutes).padStart(2, '0')}:{String(cooldownDisplay.seconds).padStart(2, '0')}
              </Text>
            </View>
            <Button
              onClick={() => setShowCoolingModal(false)}
              className="w-full bg-gray-100 text-gray-600 rounded-xl"
            >
              知道了
            </Button>
          </View>
        </View>
      )}
    </View>
  )
}

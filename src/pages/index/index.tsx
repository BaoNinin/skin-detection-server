import { View, Text, Button, Camera, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { Network } from '@/network'

interface SkinAnalysisResult {
  skinType: string
  concerns: string[]
  moisture: number
  oiliness: number
  sensitivity: number
  recommendations: string[]
}

export default function SkinDetectionPage() {
  const [isWeapp, setIsWeapp] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [capturedImage, setCapturedImage] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<SkinAnalysisResult | null>(null)
  const [showCooldownModal, setShowCooldownModal] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)

  useEffect(() => {
    setIsWeapp(Taro.getEnv() === Taro.ENV_TYPE.WEAPP)
  }, [])

  const handleStartCamera = () => {
    if (!isWeapp) {
      Taro.showToast({
        title: '相机功能仅在小程序中可用',
        icon: 'none'
      })
      return
    }

    // 检查冷却时间
    const lastAnalysisTime = Taro.getStorageSync('lastAnalysisTime')
    const cooldownPeriod = 30 * 60 * 1000 // 30分钟（毫秒）

    if (lastAnalysisTime) {
      const now = Date.now()
      const timeSinceLastAnalysis = now - lastAnalysisTime

      if (timeSinceLastAnalysis < cooldownPeriod) {
        const remainingMinutes = Math.ceil((cooldownPeriod - timeSinceLastAnalysis) / 60 / 1000)
        setRemainingTime(remainingMinutes)
        setShowCooldownModal(true)
        return
      }
    }

    setCameraActive(true)
    setResult(null)
    setCapturedImage('')
  }

  const handleTakePhoto = async () => {
    try {
      const ctx = Taro.createCameraContext()
      ctx.takePhoto({
        quality: 'high',
        success: (res) => {
          setCapturedImage(res.tempImagePath)
          setCameraActive(false)
          analyzeSkin(res.tempImagePath)
        },
        fail: (err) => {
          console.error('拍照失败:', err)
          Taro.showToast({
            title: '拍照失败',
            icon: 'none'
          })
        }
      })
    } catch (err) {
      console.error('拍照错误:', err)
    }
  }

  const analyzeSkin = async (imagePath: string) => {
    setAnalyzing(true)
    try {
      const res = await Network.uploadFile({
        url: '/api/skin/analyze',
        filePath: imagePath,
        name: 'image'
      })

      const data = JSON.parse(res.data)
      if (data.code === 200) {
        const analysisResult = data.data
        setResult(analysisResult)

        // 保存分析时间戳
        Taro.setStorageSync('lastAnalysisTime', Date.now())

        Taro.setStorageSync('skinAnalysisResult', analysisResult)

        Network.request({
          url: '/api/skin/history',
          method: 'POST',
          data: analysisResult
        }).catch(err => {
          console.error('保存历史记录失败:', err)
        })

        Taro.showToast({
          title: '分析完成',
          icon: 'success'
        })
      } else {
        Taro.showToast({
          title: data.msg || '分析失败',
          icon: 'none'
        })
      }
    } catch (err) {
      console.error('分析失败:', err)
      Taro.showToast({
        title: '分析失败',
        icon: 'none'
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const handleReactivateChip = () => {
    // 清除冷却时间，允许立即重新检测
    Taro.removeStorageSync('lastAnalysisTime')
    setShowCooldownModal(false)
    setCameraActive(true)
    setResult(null)
    setCapturedImage('')
  }

  const handleCloseModal = () => {
    // 关闭弹窗，等待剩余冷却时间
    setShowCooldownModal(false)
  }

  return (
    <View className="min-h-screen bg-slate-50">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-800 block">智能皮肤检测</Text>
        <Text className="text-sm text-gray-500 mt-2 block">AI 为您分析皮肤状态</Text>
      </View>

      {cameraActive && (
        <View className="relative w-full h-[70vh]">
          <Camera
            className="w-full h-full"
            devicePosition="front"
            mode="normal"
            flash="off"
          />
          <View className="absolute bottom-8 left-0 right-0 flex justify-center items-center">
            <Button
              onClick={handleTakePhoto}
              className="bg-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg"
            >
              <View className="w-12 h-12 rounded-full border-4 border-blue-700" />
            </Button>
          </View>
        </View>
      )}

      {!cameraActive && !capturedImage && !result && (
        <View className="flex flex-col items-center justify-center py-20 px-4">
          <View className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm overflow-hidden">
            <Image
              src="/assets/logo.png"
              mode="aspectFit"
              className="w-full h-full"
              style={{ marginLeft: '10px' }}
            />
          </View>
          <Text className="text-lg text-gray-700 text-center mb-8 block">
            点击下方按钮拍摄面部照片{'\n'}AI 将为您分析皮肤状态
          </Text>
          <Button
            onClick={handleStartCamera}
            className="bg-blue-700 text-white rounded-full py-3 px-12 font-medium"
          >
            开始检测
          </Button>
        </View>
      )}

      {capturedImage && analyzing && (
        <View className="flex flex-col items-center justify-center py-20 px-4">
          <View className="w-20 h-20 border-4 border-blue-200 border-t-rose-400 rounded-full animate-spin mb-6" />
          <Text className="text-lg text-gray-700 block">正在分析中...</Text>
          <Text className="text-sm text-gray-500 mt-2 block">请稍候，AI 正在识别您的皮肤状态</Text>
        </View>
      )}

      {capturedImage && !analyzing && result && (
        <View className="p-4">
          <View className="bg-white rounded-2xl overflow-hidden shadow-sm mb-4">
            <Image
              src={capturedImage}
              mode="aspectFill"
              className="w-full h-64"
            />
          </View>

          <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
            <Text className="text-lg font-semibold text-gray-800 mb-3 block">皮肤类型</Text>
            <View className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100">
              <Text className="text-base text-blue-800 font-medium block">{result.skinType}</Text>
            </View>
          </View>

          <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
            <Text className="text-lg font-semibold text-gray-800 mb-3 block">皮肤指标</Text>
            <View className="space-y-3">
              <View>
                <View className="flex justify-between mb-1">
                  <Text className="text-sm text-gray-600 block">水分</Text>
                  <Text className="text-sm font-medium text-gray-800 block">{result.moisture}%</Text>
                </View>
                <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-blue-400 rounded-full transition-all"
                    style={{ width: `${result.moisture}%` }}
                  />
                </View>
              </View>
              <View>
                <View className="flex justify-between mb-1">
                  <Text className="text-sm text-gray-600 block">油性</Text>
                  <Text className="text-sm font-medium text-gray-800 block">{result.oiliness}%</Text>
                </View>
                <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${result.oiliness}%` }}
                  />
                </View>
              </View>
              <View>
                <View className="flex justify-between mb-1">
                  <Text className="text-sm text-gray-600 block">敏感度</Text>
                  <Text className="text-sm font-medium text-gray-800 block">{result.sensitivity}%</Text>
                </View>
                <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-blue-700 rounded-full transition-all"
                    style={{ width: `${result.sensitivity}%` }}
                  />
                </View>
              </View>
            </View>
          </View>

          {result.concerns.length > 0 && (
            <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
              <Text className="text-lg font-semibold text-gray-800 mb-3 block">皮肤问题</Text>
              <View className="flex flex-wrap gap-2">
                {result.concerns.map((concern, index) => (
                  <View key={index} className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100">
                    <Text className="text-sm text-amber-600 block">{concern}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <Button
            onClick={handleStartCamera}
            className="w-full bg-blue-700 text-white rounded-full py-3 font-medium mb-3"
          >
            重新检测
          </Button>
        </View>
      )}

      {!isWeapp && !cameraActive && (
        <View className="flex items-center justify-center py-8 px-4">
          <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 w-full">
            <Text className="text-sm text-amber-800 text-center block">
              相机功能仅在小程序中可用{'\n'}请在微信小程序中打开体验完整功能
            </Text>
          </View>
        </View>
      )}

      {/* 冷却时间弹窗 */}
      {showCooldownModal && (
        <View className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <View className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full">
            <View className="mb-4">
              <View className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Text className="text-3xl">⏱️</Text>
              </View>
              <Text className="text-xl font-bold text-gray-800 text-center mb-2 block">
                已经激活过芯片
              </Text>
              <Text className="text-sm text-gray-600 text-center mb-2 block">
                暂时无法重新激活
              </Text>
              <Text className="text-sm text-orange-600 text-center block">
                请等待 {remainingTime} 分钟后再次检测
              </Text>
            </View>
            <View className="space-y-3">
              <Button
                onClick={handleReactivateChip}
                className="w-full bg-blue-700 text-white rounded-full py-3 font-medium"
              >
                重新激活芯片
              </Button>
              <Button
                onClick={handleCloseModal}
                className="w-full bg-white text-gray-700 border-2 border-gray-200 rounded-full py-3 font-medium"
              >
                关闭
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

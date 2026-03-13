import { View, Text, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { Network } from '@/network'

interface SkinAnalysisResult {
  skinType: string
  concerns: string[]
  moisture: number
  oiliness: number
  sensitivity: number
  acne?: number
  wrinkles?: number
  spots?: number
  pores?: number
  blackheads?: number
  recommendations: string[]
}

export default function AnalyzingPage() {
  const [imagePath, setImagePath] = useState('')
  const [currentStep, setCurrentStep] = useState(0)
  const [analyzing, setAnalyzing] = useState(false)
  const [scanSuccess, setScanSuccess] = useState(false)

  const steps = scanSuccess
    ? [
        { icon: '✅', text: '识别成功' },
        { icon: '🔌', text: '正在激活芯片...' },
        { icon: '⚡', text: '芯片激活中...' },
        { icon: '🔬', text: 'AI 正在分析肤质...' },
        { icon: '✨', text: '分析完成！' }
      ]
    : [
        { icon: '🔬', text: 'AI 正在分析肤质...' },
        { icon: '✨', text: '分析完成！' }
      ]

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params
    if (params?.imagePath) {
      setImagePath(decodeURIComponent(params.imagePath))
      setScanSuccess(params?.scanSuccess === 'true')
      startAnalysis(decodeURIComponent(params.imagePath))
    } else {
      Taro.showToast({
        title: '图片参数错误',
        icon: 'none'
      })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    }
  }, [])

  const startAnalysis = async (path: string) => {
    setAnalyzing(true)

    // 如果是扫描成功，显示识别成功动画
    if (scanSuccess) {
      setCurrentStep(0)
      await sleep(1000) // 显示"识别成功"
      setCurrentStep(1)
      await sleep(2000) // 显示"正在激活芯片"
      setCurrentStep(2)
      await sleep(2000) // 芯片激活动画
    } else {
      // 如果不是扫描成功，跳过识别动画，直接开始分析
      setCurrentStep(3)
      await sleep(500)
    }

    setCurrentStep(3)
    await sleep(1000) // 开始AI分析

    try {
      const userId = Taro.getStorageSync('userId')
      const res = await Network.uploadFile({
        url: '/api/skin/analyze',
        filePath: path,
        name: 'image',
        formData: {
          userId: String(userId)
        }
      })

      const data = JSON.parse(res.data)
      if (data.code === 200) {
        setCurrentStep(4)
        await sleep(1000)

        const result = data.data as SkinAnalysisResult
        Taro.setStorageSync('skinAnalysisResult', result)
        Taro.setStorageSync('currentImagePath', path)

        if (userId) {
          Network.request({
            url: '/api/skin/history',
            method: 'POST',
            data: {
              userId,
              ...result,
              imageUrl: path
            }
          })
            .then(async () => {
              try {
                const userRes = await Network.request({
                  url: `/api/user/${userId}`,
                  method: 'GET'
                })

                if (userRes.data.code === 200) {
                  Taro.setStorageSync('userInfo', userRes.data.data)
                  console.log('用户信息已更新，检测次数:', userRes.data.data.detectionCount)
                }
              } catch (err) {
                console.error('更新用户信息失败:', err)
              }
            })
            .catch(err => {
              console.error('保存历史记录失败:', err)
            })
        }

        Taro.redirectTo({
          url: '/pages/result/index'
        })
      } else {
        Taro.showToast({
          title: data.msg || '分析失败',
          icon: 'none'
        })
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
      }
    } catch (err) {
      console.error('分析失败:', err)
      Taro.showToast({
        title: '分析失败',
        icon: 'none'
      })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    } finally {
      setAnalyzing(false)
    }
  }

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const handleCancel = () => {
    if (!analyzing) {
      Taro.navigateBack()
    } else {
      Taro.showModal({
        title: '提示',
        content: '分析正在进行中，确定要取消吗？',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateBack()
          }
        }
      })
    }
  }

  return (
    <View className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <View className="flex flex-col items-center justify-center px-8 py-12">
        {/* 识别成功动画 */}
        {scanSuccess && currentStep < 3 && (
          <View className="mb-8">
            {currentStep === 0 && (
              <View className="w-32 h-32 flex items-center justify-center">
                <View className="absolute w-32 h-32 bg-green-100 rounded-full animate-ping opacity-50" />
                <Text className="text-6xl block z-10">✅</Text>
              </View>
            )}
            {currentStep === 1 && (
              <View className="w-32 h-32 flex items-center justify-center relative">
                <View className="absolute w-32 h-32 border-4 border-rose-200 rounded-full" />
                <View className="absolute w-32 h-32 border-4 border-rose-400 rounded-t-full animate-spin" />
                <Text className="text-6xl block z-10">🔌</Text>
              </View>
            )}
            {currentStep === 2 && (
              <View className="w-32 h-32 flex items-center justify-center">
                <View className="absolute w-32 h-32 bg-gradient-to-r from-yellow-200 to-yellow-400 rounded-full animate-pulse" />
                <Text className="text-6xl block z-10">⚡</Text>
              </View>
            )}
          </View>
        )}

        {/* 上传/分析时的图片展示 */}
        {currentStep >= 3 && (
          <View className="mb-8">
            {imagePath && (
              <Image
                src={imagePath}
                mode="aspectFill"
                className="w-48 h-64 rounded-2xl shadow-lg"
              />
            )}
          </View>
        )}

        {/* 加载动画 */}
        {currentStep >= 3 && (
          <View className="w-16 h-16 border-4 border-rose-200 border-t-rose-400 rounded-full animate-spin mb-6" />
        )}

        {/* 当前步骤文字 */}
        <Text className="text-xl font-semibold text-gray-800 mb-4 block text-center">
          {steps[currentStep].text}
        </Text>

        {/* 进度指示器 */}
        <View className="flex gap-2 mb-8">
          {steps.map((_, index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index <= currentStep ? 'bg-rose-400' : 'bg-gray-200'
              }`}
            />
          ))}
        </View>

        {/* 预计时间 */}
        <Text className="text-sm text-gray-500 text-center block">
          {scanSuccess && currentStep < 3
            ? '激活芯片中，请稍候...'
            : '预计等待时间 5-10 秒'
          }
        </Text>
      </View>

      <View className="px-8 pb-8">
        <Button
          onClick={handleCancel}
          className="w-full bg-white text-gray-600 border-2 border-gray-200 rounded-full py-3"
        >
          取消
        </Button>
      </View>
    </View>
  )
}

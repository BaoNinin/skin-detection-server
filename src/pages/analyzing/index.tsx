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

  const steps = [
    { icon: '📤', text: '正在上传图片...' },
    { icon: '🔬', text: 'AI 正在分析肤质...' },
    { icon: '📊', text: '生成检测报告...' },
    { icon: '✅', text: '分析完成！' }
  ]

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params
    if (params?.imagePath) {
      setImagePath(decodeURIComponent(params.imagePath))
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

    setCurrentStep(0)
    await sleep(1500)
    setCurrentStep(1)
    await sleep(2000)
    setCurrentStep(2)

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
        setCurrentStep(3)
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
              // 保存历史记录成功后，更新用户信息
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
        <View className="mb-8">
          {imagePath && (
            <Image
              src={imagePath}
              mode="aspectFill"
              className="w-48 h-64 rounded-2xl shadow-lg"
            />
          )}
        </View>

        <View className="w-16 h-16 border-4 border-rose-200 border-t-rose-400 rounded-full animate-spin mb-6" />

        <Text className="text-xl font-semibold text-gray-800 mb-4 block">
          {steps[currentStep].text}
        </Text>

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

        <Text className="text-sm text-gray-500 text-center block">
          预计等待时间 5-10 秒
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

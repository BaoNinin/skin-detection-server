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
  const [pingScale, setPingScale] = useState(1)
  const [spinRotation, setSpinRotation] = useState(0)
  const [pulseOpacity, setPulseOpacity] = useState(1)
  const [loaderRotation, setLoaderRotation] = useState(0)
  
  // 芯片激活相关
  const [activationCountdown, setActivationCountdown] = useState(10)
  const [activationProgress, setActivationProgress] = useState(0)
  const [chipPointsPulse, setChipPointsPulse] = useState(Array(9).fill(false))

  // AI分析时的加载动画
  useEffect(() => {
    if (currentStep === 2 && analyzing) {
      const interval = setInterval(() => {
        setLoaderRotation(prev => prev >= 360 ? 0 : prev + 15)
      }, 50)
      return () => clearInterval(interval)
    }
  }, [currentStep, analyzing])

  // 芯片激活时的动画
  useEffect(() => {
    if (currentStep === 3 && analyzing) {
      // 芯片点脉冲动画
      const pulseInterval = setInterval(() => {
        setChipPointsPulse(prev => {
          const newPulse = [...prev]
          const randomIndex = Math.floor(Math.random() * 9)
          newPulse[randomIndex] = !newPulse[randomIndex]
          return newPulse
        })
      }, 300)

      // 倒计时动画
      const countdownInterval = setInterval(() => {
        setActivationCountdown(prev => {
          if (prev > 0) {
            const newCountdown = prev - 1
            setActivationProgress(100 - (newCountdown * 10))
            return newCountdown
          }
          return 0
        })
      }, 1000)

      // Pulse opacity动画
      const pulseOpacityInterval = setInterval(() => {
        setPulseOpacity(prev => prev <= 0.3 ? 1 : prev - 0.1)
      }, 100)

      return () => {
        clearInterval(pulseInterval)
        clearInterval(countdownInterval)
        clearInterval(pulseOpacityInterval)
      }
    }
  }, [currentStep, analyzing])

  const steps = scanSuccess
    ? [
        { icon: '🔌', text: '正在激活芯片...' },
        { icon: '✅', text: '识别成功' },
        { icon: '🔬', text: 'AI 正在分析肤质...' },
        { icon: '⚡', text: '芯片激活中...' },
        { icon: '✨', text: '分析完成！' }
      ]
    : [
        { icon: '🔬', text: 'AI 正在分析肤质...' },
        { icon: '✨', text: '分析完成！' }
      ]

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params
    if (params?.imagePath) {
      const isScanSuccess = params?.scanSuccess === 'true'
      setImagePath(decodeURIComponent(params.imagePath))
      setScanSuccess(isScanSuccess)
      startAnalysis(decodeURIComponent(params.imagePath), isScanSuccess)
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

  const startAnalysis = async (path: string, isScanSuccess: boolean) => {
    console.log('=== 开始分析 ===')
    console.log('isScanSuccess:', isScanSuccess)
    console.log('scanSuccess状态:', scanSuccess)
    setAnalyzing(true)

    // 如果是扫描成功，显示识别成功动画
    if (isScanSuccess) {
      console.log('开始显示识别成功动画')
      setCurrentStep(0)
      setSpinRotation(0)

      // Step 0: 激活芯片 - spin动画
      const spinInterval = setInterval(() => {
        setSpinRotation(prev => prev >= 360 ? 0 : prev + 15)
      }, 50)

      await sleep(2000)
      clearInterval(spinInterval)
      console.log('Step 0 完成，spin动画结束')

      // Step 1: 识别成功 - ping动画
      setCurrentStep(1)
      console.log('currentStep:', 1)
      setPingScale(1)
      const pingInterval = setInterval(() => {
        setPingScale(prev => {
          const newScale = prev >= 2 ? 1 : prev + 0.1
          return newScale
        })
      }, 50)

      await sleep(1000)
      clearInterval(pingInterval)
      console.log('Step 1 完成，ping动画结束')

      // Step 2: AI分析
      setCurrentStep(2)
      console.log('currentStep:', 2, '开始AI分析')
    } else {
      // 如果不是扫描成功，跳过识别动画，直接开始分析
      setCurrentStep(2)
      await sleep(500)
    }

    // Step 2: AI正在分析肤质 - 执行实际的图片上传和分析
    await sleep(500)

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
      console.log('=== 分析结果 ===')
      console.log('响应数据:', data)
      
      if (data.code === 200) {
        const result = data.data as SkinAnalysisResult
        console.log('皮肤分析结果:', result)
        Taro.setStorageSync('skinAnalysisResult', result)
        Taro.setStorageSync('currentImagePath', path)

        if (userId) {
          console.log('=== 开始保存历史记录 ===')
          console.log('userId:', userId)
          console.log('皮肤类型:', result.skinType)
          console.log('问题:', result.concerns)
          
          const historyData = {
            userId,
            skinType: result.skinType,
            concerns: result.concerns,
            moisture: result.moisture,
            oiliness: result.oiliness,
            sensitivity: result.sensitivity,
            acne: result.acne || 0,
            wrinkles: result.wrinkles || 0,
            spots: result.spots || 0,
            pores: result.pores || 0,
            blackheads: result.blackheads || 0,
            recommendations: result.recommendations,
            imageUrl: path
          }
          console.log('历史记录数据:', historyData)
          
          Network.request({
            url: '/api/skin/history',
            method: 'POST',
            data: historyData
          })
            .then(async (historyRes) => {
              console.log('=== 历史记录保存成功 ===')
              console.log('保存响应:', historyRes.data)
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
              console.error('=== 历史记录保存失败 ===')
              console.error('错误信息:', err)
            })
        } else {
          console.warn('=== 用户未登录，跳过保存历史记录 ===')
        }

        // 如果是扫描成功，显示芯片激活动画
        if (isScanSuccess) {
          // Step 3: 芯片激活中 - pulse动画
          setCurrentStep(3)
          console.log('currentStep:', 3, '开始芯片激活动画')
          setPulseOpacity(1)
          const pulseInterval = setInterval(() => {
            setPulseOpacity(prev => prev <= 0.3 ? 1 : prev - 0.1)
          }, 100)

          await sleep(2000)
          clearInterval(pulseInterval)
          console.log('Step 3 完成，pulse动画结束')
        }

        // Step 4: 分析完成
        setCurrentStep(4)
        await sleep(1000)

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
        {currentStep < 2 ? (
          <View className="mb-8">
            {currentStep === 0 && (
              <View className="w-32 h-32 flex items-center justify-center relative">
                <View className="absolute w-32 h-32 border-4 border-rose-200 rounded-full" />
                <View
                  className="absolute w-32 h-32 border-4 border-rose-400 rounded-t-full transition-all"
                  style={{
                    transform: `rotate(${spinRotation}deg)`
                  }}
                />
                <Text className="text-6xl block z-10">🔌</Text>
              </View>
            )}
            {currentStep === 1 && (
              <View className="w-32 h-32 flex items-center justify-center relative">
                <View
                  className="absolute bg-green-100 rounded-full opacity-50 transition-all"
                  style={{
                    width: `${32 * pingScale}px`,
                    height: `${32 * pingScale}px`
                  }}
                />
                <Text className="text-6xl block z-10">✅</Text>
              </View>
            )}
          </View>
        ) : currentStep === 3 ? (
          // 芯片激活中 - 改进版
          <View className="mb-8 flex flex-col items-center">
            <View className="w-36 h-36 flex items-center justify-center relative">
              {/* 3x3 芯片网格 */}
              <View className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-2 p-4">
                {Array.from({ length: 9 }).map((_, index) => (
                  <View
                    key={index}
                    className={`w-6 h-6 bg-rose-400 rounded-full transition-all duration-300 ${
                      chipPointsPulse[index] ? 'opacity-100 scale-110' : 'opacity-50 scale-100'
                    }`}
                    style={{
                      boxShadow: chipPointsPulse[index] ? '0 0 12px rgba(251, 113, 133, 0.8)' : 'none'
                    }}
                  />
                ))}
              </View>

              {/* 外圈脉冲效果 */}
              <View
                className="absolute w-32 h-32 border-2 border-rose-400/50 rounded-full transition-all"
                style={{
                  opacity: pulseOpacity,
                  animation: 'pulse 2s infinite'
                }}
              />

              {/* 中心芯片图标 */}
              <View
                className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center relative z-10"
                style={{
                  opacity: pulseOpacity,
                  boxShadow: `0 0 ${pulseOpacity * 20}px rgba(251, 113, 133, 0.5)`
                }}
              >
                <Text className="text-5xl block">⚡</Text>
              </View>
            </View>

            {/* 倒计时 */}
            <View className="mt-6 text-center">
              <Text className="text-6xl font-bold text-rose-400 block" style={{ textShadow: '0 0 20px rgba(251, 113, 133, 0.8)' }}>
                {activationCountdown}
              </Text>
              <Text className="text-sm text-gray-600 mt-2 block">AI芯片激活中</Text>
            </View>

            {/* 激活进度条 */}
            <View className="mt-4 w-64">
              <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <View
                  className="h-full bg-gradient-to-r from-rose-400 via-pink-500 to-rose-400 transition-all duration-1000"
                  style={{ width: `${activationProgress}%` }}
                />
              </View>
            </View>
          </View>
        ) : null}

        {/* 上传/分析时的图片展示 */}
        {currentStep === 2 && (
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
        {currentStep === 2 && (
          <View className="w-16 h-16 border-4 border-rose-200 border-t-rose-400 rounded-full mb-6 transition-all" style={{ transform: `rotate(${loaderRotation}deg)` }} />
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
          {currentStep < 2
            ? '激活芯片中，请稍候...'
            : currentStep === 2
            ? 'AI分析中，请稍候...'
            : currentStep === 3
            ? '芯片激活中，请稍候...'
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

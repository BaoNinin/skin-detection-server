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

type AnalysisStep = 'activating' | 'success' | 'analyzing' | 'processing' | 'preview' | 'completed'

export default function AnalyzingPage() {
  const [imagePath, setImagePath] = useState('')
  const [currentStep, setCurrentStep] = useState<AnalysisStep>('activating')
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
  
  // AI 分析进度相关
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [currentAnalysisTask, setCurrentAnalysisTask] = useState('')
  const [analysisTasks] = useState([
    { id: 1, text: '检测面部轮廓...', duration: 800 },
    { id: 2, text: '分析肤色特征...', duration: 600 },
    { id: 3, text: '识别纹理细节...', duration: 700 },
    { id: 4, text: '检测痘痘斑点...', duration: 900 },
    { id: 5, text: '评估毛孔大小...', duration: 600 },
    { id: 6, text: '生成分析报告...', duration: 800 }
  ])
  
  // 结果预览相关
  const [previewResult, setPreviewResult] = useState<SkinAnalysisResult | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [autoJumpCountdown, setAutoJumpCountdown] = useState(5)

  // AI分析时的加载动画
  useEffect(() => {
    if (currentStep === 'analyzing' && analyzing) {
      const interval = setInterval(() => {
        setLoaderRotation(prev => prev >= 360 ? 0 : prev + 15)
      }, 50)
      return () => clearInterval(interval)
    }
  }, [currentStep, analyzing])

  // 芯片激活时的动画（优化版 - 使用 CSS 动画）
  useEffect(() => {
    if (currentStep === 'processing' && analyzing) {
      // 芯片点脉冲动画 - 优化为更流畅的随机闪烁
      const pulseInterval = setInterval(() => {
        setChipPointsPulse(prev => {
          const newPulse = [...prev]
          // 每次随机激活 2-3 个点，形成更自然的波纹效果
          const count = Math.floor(Math.random() * 2) + 2
          for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * 9)
            newPulse[randomIndex] = !newPulse[randomIndex]
          }
          return newPulse
        })
      }, 200) // 从 300 改为 200，更流畅

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
        setPulseOpacity(prev => prev <= 0.3 ? 1 : prev - 0.05) // 从 0.1 改为 0.05，更平滑
      }, 80) // 从 100 改为 80，更流畅

      return () => {
        clearInterval(pulseInterval)
        clearInterval(countdownInterval)
        clearInterval(pulseOpacityInterval)
      }
    }
  }, [currentStep, analyzing])

  // 自动跳转倒计时
  useEffect(() => {
    if (currentStep === 'preview' && showPreview && autoJumpCountdown > 0) {
      const timer = setTimeout(() => {
        setAutoJumpCountdown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (autoJumpCountdown === 0) {
      handleGoToResult()
    }
  }, [currentStep, showPreview, autoJumpCountdown])

  const steps = scanSuccess
    ? [
        { icon: '🔌', text: '正在激活芯片...', step: 'activating' },
        { icon: '✅', text: '识别成功', step: 'success' },
        { icon: '🔬', text: 'AI 正在分析肤质...', step: 'analyzing' },
        { icon: '⚡', text: '芯片激活中...', step: 'processing' },
        { icon: '📊', text: '生成报告...', step: 'preview' },
        { icon: '✨', text: '分析完成！', step: 'completed' }
      ]
    : [
        { icon: '🔬', text: 'AI 正在分析肤质...', step: 'analyzing' },
        { icon: '📊', text: '生成报告...', step: 'preview' },
        { icon: '✨', text: '分析完成！', step: 'completed' }
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
    setAnalyzing(true)

    // 如果是扫描成功，显示识别成功动画
    if (isScanSuccess) {
      console.log('开始显示识别成功动画')
      setCurrentStep('activating')
      setSpinRotation(0)

      // Step 0: 激活芯片 - spin动画
      const spinInterval = setInterval(() => {
        setSpinRotation(prev => prev >= 360 ? 0 : prev + 15)
      }, 50)

      await sleep(2000)
      clearInterval(spinInterval)
      console.log('Step activating 完成，spin动画结束')

      // Step 1: 识别成功 - ping动画
      setCurrentStep('success')
      console.log('currentStep:', 'success')
      setPingScale(1)
      const pingInterval = setInterval(() => {
        setPingScale(prev => {
          const newScale = prev >= 2 ? 1 : prev + 0.1
          return newScale
        })
      }, 50)

      await sleep(1000)
      clearInterval(pingInterval)
      console.log('Step success 完成，ping动画结束')

      // Step 2: AI分析
      setCurrentStep('analyzing')
      console.log('currentStep:', 'analyzing', '开始AI分析')
    } else {
      // 如果不是扫描成功，跳过识别动画，直接开始分析
      setCurrentStep('analyzing')
      await sleep(500)
    }

    // Step 2: AI正在分析肤质 - 执行具体的分析任务
    console.log('开始执行分析任务...')
    
    for (let i = 0; i < analysisTasks.length; i++) {
      const task = analysisTasks[i]
      setCurrentAnalysisTask(task.text)
      setAnalysisProgress(Math.round(((i + 1) / analysisTasks.length) * 100))
      await sleep(task.duration)
    }
    
    console.log('所有分析任务完成')

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
        
        // 设置预览结果
        setPreviewResult(result)

        // 确保有 userId 才保存历史记录
        if (!userId) {
          console.warn('=== 用户未登录，无法保存历史记录 ===')
          Taro.showToast({
            title: '请先登录以保存记录',
            icon: 'none',
            duration: 2000
          })
          // 继续显示结果，但历史记录不会保存
        } else {
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
          
          // 使用 await 确保历史记录保存完成
          try {
            const historyRes = await Network.request({
              url: '/api/skin/history',
              method: 'POST',
              data: historyData
            })
            
            console.log('=== 历史记录保存响应 ===')
            console.log('响应状态:', historyRes.data.code)
            console.log('响应数据:', historyRes.data)
            
            if (historyRes.data.code === 200) {
              console.log('=== 历史记录保存成功 ===')
              Taro.showToast({
                title: '记录已保存',
                icon: 'success',
                duration: 1500
              })
              
              // 更新用户信息（检测次数）
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
            } else {
              console.error('=== 历史记录保存失败 ===')
              console.error('错误信息:', historyRes.data.msg)
              Taro.showToast({
                title: '保存失败: ' + (historyRes.data.msg || '未知错误'),
                icon: 'none',
                duration: 2000
              })
            }
          } catch (err) {
            console.error('=== 历史记录保存异常 ===')
            console.error('错误信息:', err)
            Taro.showToast({
              title: '保存失败，请检查网络',
              icon: 'none',
              duration: 2000
            })
          }
        }

        // 如果是扫描成功，显示芯片激活动画
        if (isScanSuccess) {
          // Step 3: 芯片激活中 - pulse动画
          setCurrentStep('processing')
          console.log('currentStep:', 'processing', '开始芯片激活动画')
          setPulseOpacity(1)
          const pulseInterval = setInterval(() => {
            setPulseOpacity(prev => prev <= 0.3 ? 1 : prev - 0.05)
          }, 80)

          await sleep(2000)
          clearInterval(pulseInterval)
          console.log('Step processing 完成，pulse动画结束')
        }

        // Step 4: 显示结果预览
        setCurrentStep('preview')
        setShowPreview(true)
        setAutoJumpCountdown(5)
        console.log('显示结果预览，开始自动跳转倒计时')
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

  const handleGoToResult = () => {
    Taro.redirectTo({
      url: '/pages/result/index'
    })
  }

  const handleImmediateJump = () => {
    setAutoJumpCountdown(0)
  }

  return (
    <View className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <View className="flex flex-col items-center justify-center px-8 py-12">
        {/* 识别成功动画 */}
        {currentStep === 'activating' && (
          <View className="mb-8">
            <View className="w-32 h-32 flex items-center justify-center relative">
              <View className="absolute w-32 h-32 border-4 border-blue-200 rounded-full" />
              <View
                className="absolute w-32 h-32 border-4 border-blue-700 rounded-t-full transition-all"
                style={{
                  transform: `rotate(${spinRotation}deg)`
                }}
              />
              <Text className="text-6xl block z-10">🔌</Text>
            </View>
          </View>
        )}

        {currentStep === 'success' && (
          <View className="mb-8">
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
          </View>
        )}

        {/* 芯片激活中 - 改进版 */}
        {currentStep === 'processing' && (
          <View className="mb-8 flex flex-col items-center">
            <View className="w-36 h-36 flex items-center justify-center relative">
              {/* 3x3 芯片网格 */}
              <View className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-2 p-4">
                {Array.from({ length: 9 }).map((_, index) => (
                  <View
                    key={index}
                    className={`w-6 h-6 bg-blue-700 rounded-full transition-all duration-300 ${
                      chipPointsPulse[index] ? 'opacity-100 scale-110' : 'opacity-50 scale-100'
                    }`}
                    style={{
                      boxShadow: chipPointsPulse[index] ? '0 0 12px rgba(251, 113, 133, 0.8)' : 'none'
                    }}
                  />
                ))}
              </View>

              {/* 外圈脉冲效果 - 使用 CSS 动画 */}
              <View
                className="absolute w-32 h-32 border-2 border-blue-700/50 rounded-full"
                style={{
                  opacity: pulseOpacity,
                  animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
                }}
              />

              {/* 中心芯片图标 */}
              <View
                className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center relative z-10"
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
              <Text className="text-6xl font-bold text-blue-700 block" style={{ textShadow: '0 0 20px rgba(251, 113, 133, 0.8)' }}>
                {activationCountdown}
              </Text>
              <Text className="text-sm text-gray-600 mt-2 block">AI芯片激活中</Text>
            </View>

            {/* 激活进度条 */}
            <View className="mt-4 w-64">
              <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <View
                  className="h-full bg-gradient-to-r from-blue-700 via-blue-800 to-blue-700 transition-all duration-300"
                  style={{ width: `${activationProgress}%` }}
                />
              </View>
            </View>
          </View>
        )}

        {/* 上传/分析时的图片展示 */}
        {currentStep === 'analyzing' && (
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
        {currentStep === 'analyzing' && (
          <View className="w-16 h-16 border-4 border-blue-200 border-t-rose-400 rounded-full mb-6 transition-all" style={{ transform: `rotate(${loaderRotation}deg)` }} />
        )}

        {/* 当前步骤文字 */}
        <Text className="text-xl font-semibold text-gray-800 mb-4 block text-center">
          {steps.find(s => s.step === currentStep)?.text || '分析中...'}
        </Text>

        {/* AI 分析任务进度 */}
        {currentStep === 'analyzing' && (
          <View className="w-full max-w-xs mb-6">
            <View className="flex items-center justify-between mb-2">
              <Text className="text-sm text-gray-600 block">{currentAnalysisTask}</Text>
              <Text className="text-sm font-medium text-blue-700 block">{analysisProgress}%</Text>
            </View>
            <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <View
                className="h-full bg-gradient-to-r from-blue-700 to-blue-800 transition-all duration-300"
                style={{ width: `${analysisProgress}%` }}
              />
            </View>
            {/* 任务列表 */}
            <View className="mt-3 space-y-2">
              {analysisTasks.map((task, index) => (
                <View key={task.id} className="flex items-center gap-2">
                  <View
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      index < analysisTasks.findIndex(t => t.text === currentAnalysisTask)
                        ? 'bg-green-400'
                        : task.text === currentAnalysisTask
                        ? 'bg-blue-700 animate-pulse'
                        : 'bg-gray-200'
                    }`}
                  >
                    {index < analysisTasks.findIndex(t => t.text === currentAnalysisTask) && (
                      <Text className="text-xs text-white block">✓</Text>
                    )}
                  </View>
                  <Text
                    className={`text-xs ${
                      index < analysisTasks.findIndex(t => t.text === currentAnalysisTask)
                        ? 'text-gray-400'
                        : task.text === currentAnalysisTask
                        ? 'text-gray-800 font-medium'
                        : 'text-gray-400'
                    } block`}
                  >
                    {task.text}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 结果预览 */}
        {currentStep === 'preview' && showPreview && previewResult && (
          <View className="w-full max-w-sm mb-6">
            <View className="bg-white rounded-2xl p-6 shadow-lg border-2 border-rose-100">
              <View className="text-center mb-4">
                <Text className="text-2xl font-bold text-gray-800 block">分析完成！</Text>
                <Text className="text-sm text-gray-500 mt-1 block">您的肤质报告已生成</Text>
              </View>
              
              {/* 关键指标 */}
              <View className="grid grid-cols-3 gap-3 mb-4">
                <View className="bg-blue-50 rounded-xl p-3 text-center">
                  <Text className="text-xs text-gray-500 block mb-1">水分</Text>
                  <Text className="text-xl font-bold text-blue-500 block">{previewResult.moisture}%</Text>
                </View>
                <View className="bg-yellow-50 rounded-xl p-3 text-center">
                  <Text className="text-xs text-gray-500 block mb-1">油性</Text>
                  <Text className="text-xl font-bold text-yellow-500 block">{previewResult.oiliness}%</Text>
                </View>
                <View className="bg-rose-50 rounded-xl p-3 text-center">
                  <Text className="text-xs text-gray-500 block mb-1">敏感度</Text>
                  <Text className="text-xl font-bold text-blue-800 block">{previewResult.sensitivity}%</Text>
                </View>
              </View>
              
              {/* 皮肤类型 */}
              <View className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-4 mb-4">
                <Text className="text-xs text-gray-500 block mb-1">皮肤类型</Text>
                <Text className="text-lg font-bold text-blue-800 block">{previewResult.skinType}</Text>
              </View>
              
              {/* 主要问题 */}
              {previewResult.concerns && previewResult.concerns.length > 0 && (
                <View className="mb-4">
                  <Text className="text-xs text-gray-500 block mb-2">主要问题</Text>
                  <View className="flex flex-wrap gap-2">
                    {previewResult.concerns.slice(0, 3).map((concern, idx) => (
                      <View key={idx} className="px-3 py-1 bg-amber-100 rounded-full">
                        <Text className="text-xs text-amber-600 block">{concern}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              {/* 自动跳转倒计时 */}
              <View className="text-center">
                <Text className="text-sm text-gray-500 block">
                  {autoJumpCountdown} 秒后自动跳转
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 进度指示器 */}
        <View className="flex gap-2 mb-8">
          {steps.map((_step, index) => (
            <View
              key={index}
              className={`w-3 h-3 rounded-full transition-all ${
                steps.findIndex(s => s.step === currentStep) >= index
                  ? 'bg-blue-700'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </View>

        {/* 预计时间 */}
        <Text className="text-sm text-gray-500 text-center block">
          {currentStep === 'activating'
            ? '激活芯片中，请稍候...'
            : currentStep === 'analyzing'
            ? 'AI分析中，请稍候...'
            : currentStep === 'processing'
            ? '芯片激活中，请稍候...'
            : currentStep === 'preview'
            ? '报告已生成'
            : '分析完成'}
        </Text>
      </View>

      {/* 底部按钮 */}
      <View className="px-8 pb-8">
        {currentStep === 'preview' ? (
          <View className="flex gap-3">
            <Button
              onClick={handleGoToResult}
              className="flex-1 bg-blue-700 text-white rounded-full py-3 font-medium"
            >
              查看报告
            </Button>
            <Button
              onClick={handleImmediateJump}
              className="flex-1 bg-white text-blue-700 border-2 border-blue-700 rounded-full py-3 font-medium"
            >
              立即跳转
            </Button>
          </View>
        ) : (
          <Button
            onClick={handleCancel}
            className="w-full bg-white text-gray-600 border-2 border-gray-200 rounded-full py-3"
          >
            取消
          </Button>
        )}
      </View>
    </View>
  )
}

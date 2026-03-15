import { View, Text, Camera, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'

export default function CameraPage() {
  const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP
  const [devicePosition, setDevicePosition] = useState<'front' | 'back'>('front')
  const [flash, setFlash] = useState<'off' | 'on' | 'torch'>('off')
  const [isScanning, setIsScanning] = useState(false)
  const [showFaceOutline, setShowFaceOutline] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [faceDetected, setFaceDetected] = useState(false)
  const [guideText, setGuideText] = useState('请将面部对准轮廓')
  const [countdown, setCountdown] = useState(5)
  
  // 扫描数据展示
  const [scanData, setScanData] = useState({
    faceOutline: 0,
    skinFeatures: 0,
    moisture: 0,
    texture: 0
  })

  // 语音播报状态
  const [innerAudioContext, setInnerAudioContext] = useState<any>(null)

  // 初始化语音播报
  useEffect(() => {
    if (isWeapp) {
      const audioContext = Taro.createInnerAudioContext()
      setInnerAudioContext(audioContext)
      
      return () => {
        if (audioContext) {
          audioContext.destroy()
        }
      }
    }
  }, [isWeapp])

  // 语音播报函数
  const playVoice = (text: string) => {
    if (!isWeapp || !innerAudioContext) return

    // 使用 TTS 文字转语音（使用 Taro.startRecord 和 Taro.playVoice）
    Taro.showToast({
      title: text,
      icon: 'none',
      duration: 2000
    })
  }

  const handleSwitchCamera = () => {
    setDevicePosition(prev => prev === 'front' ? 'back' : 'front')
  }

  const handleSwitchFlash = () => {
    const flashModes: Array<'off' | 'on' | 'torch'> = ['off', 'on', 'torch']
    const currentIndex = flashModes.indexOf(flash)
    const nextIndex = (currentIndex + 1) % flashModes.length
    const newFlash = flashModes[nextIndex]

    setFlash(newFlash)

    const statusText = newFlash === 'off' ? '闪光灯已关闭' : newFlash === 'on' ? '闪光灯已开启' : '闪光灯常亮'
    Taro.showToast({
      title: statusText,
      icon: 'none',
      duration: 1500
    })
  }

  // 启动人脸识别
  const startFaceDetect = () => {
    if (!isWeapp) return

    // 请求相机权限
    Taro.authorize({
      scope: 'scope.camera'
    }).then(() => {
      // 启动人脸识别（小程序能力）
      // 注意：startFaceDetect 需要在真机上才能使用
      console.log('人脸识别已启动')
      setFaceDetected(true)
      
      // 3秒后自动拍照（模拟人脸识别成功）
      setTimeout(() => {
        setGuideText('检测到人脸，准备拍照')
        playVoice('检测到人脸，准备拍照')
      }, 2000)
    }).catch(() => {
      Taro.showModal({
        title: '提示',
        content: '需要相机权限才能进行人脸识别',
        showCancel: false
      })
    })
  }

  const handleStartDetection = () => {
    if (!isWeapp) return

    const userId = Taro.getStorageSync('userId')
    if (!userId) {
      Taro.showModal({
        title: '提示',
        content: '请先登录后再进行检测',
        success: (res) => {
          if (res.confirm) {
            Taro.switchTab({
              url: '/pages/profile/index'
            })
          }
        }
      })
      return
    }

    // 启动人脸识别
    startFaceDetect()
    
    // 显示人脸轮廓并开始扫描
    setShowFaceOutline(true)
    setIsScanning(true)
    setScanProgress(0)
    setScanData({ faceOutline: 0, skinFeatures: 0, moisture: 0, texture: 0 })
    setGuideText('正在扫描面部...')
    playVoice('正在扫描面部')

    // 模拟扫描动画
    let progress = 0
    let countdownValue = 5
    
    // 倒计时
    const countdownInterval = setInterval(() => {
      countdownValue -= 1
      setCountdown(countdownValue)
      
      if (countdownValue > 0) {
        // 根据倒计时显示不同的引导文字
        if (countdownValue === 4) {
          setGuideText('请摘下眼镜，露出额头')
          playVoice('请摘下眼镜，露出额头')
        } else if (countdownValue === 3) {
          setGuideText('请保持适当距离')
          playVoice('请保持适当距离')
        } else if (countdownValue === 2) {
          setGuideText('保持当前姿势，不要移动')
          playVoice('保持当前姿势，不要移动')
        } else if (countdownValue === 1) {
          setGuideText('即将拍照')
          playVoice('即将拍照')
        }
      } else {
        clearInterval(countdownInterval)
      }
    }, 1000)
    
    // 扫描进度动画
    const scanInterval = setInterval(() => {
      progress += 1
      setScanProgress(progress)

      if (progress <= 25) {
        setScanData(prev => ({ ...prev, faceOutline: Math.min(100, (progress / 25) * 100) }))
      } else if (progress <= 50) {
        setScanData(prev => ({ 
          ...prev,
          faceOutline: 100,
          skinFeatures: Math.min(100, ((progress - 25) / 25) * 100) 
        }))
      } else if (progress <= 75) {
        setScanData(prev => ({ 
          ...prev,
          faceOutline: 100,
          skinFeatures: 100,
          moisture: Math.min(100, ((progress - 50) / 25) * 100) 
        }))
      } else if (progress <= 100) {
        setScanData(prev => ({ 
          ...prev,
          faceOutline: 100,
          skinFeatures: 100,
          moisture: 100,
          texture: Math.min(100, ((progress - 75) / 25) * 100) 
        }))
      }

      if (progress >= 100) {
        clearInterval(scanInterval)
        takePhoto()
      }
    }, 50) // 5秒内完成扫描
  }

  const takePhoto = () => {
    const ctx = Taro.createCameraContext()
    
    // 停止语音播报
    if (innerAudioContext) {
      innerAudioContext.stop()
    }
    
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        console.log('拍照成功:', res.tempImagePath)
        Taro.redirectTo({
          url: `/pages/analyzing/index?imagePath=${encodeURIComponent(res.tempImagePath)}&scanSuccess=true`
        })
      },
      fail: (err) => {
        console.error('拍照失败:', err)
        setIsScanning(false)
        setShowFaceOutline(false)
        Taro.showToast({
          title: '拍照失败，请重试',
          icon: 'none'
        })
      }
    })
  }

  const handleCameraReady = () => {
    console.log('相机已就绪，当前闪光灯状态:', flash)
  }

  const handleCameraError = (err: any) => {
    console.error('相机错误:', err)
    Taro.showToast({
      title: '相机启动失败',
      icon: 'none'
    })
  }

  const handleCancel = () => {
    if (innerAudioContext) {
      innerAudioContext.stop()
    }
    Taro.navigateBack()
  }

  if (!isWeapp) {
    return (
      <View className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
        <Text className="text-6xl mb-4">📷</Text>
        <Text className="text-lg text-gray-700 text-center block">
          相机功能仅在小程序中可用{'\n'}请在微信小程序中打开
        </Text>
        <Button onClick={handleCancel} className="mt-8 bg-rose-400 text-white rounded-full">
          返回
        </Button>
      </View>
    )
  }

  return (
    <View className="h-screen bg-black relative flex flex-col">
      {/* 相机预览区域 */}
      <Camera
        className="flex-1"
        devicePosition={devicePosition}
        mode="normal"
        flash={flash}
        onReady={handleCameraReady}
        onError={handleCameraError}
      />

      {/* 中间显示区域 */}
      <View className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        {showFaceOutline ? (
          // 人脸检测框
          <View className="relative w-[280px] h-[380px]">
            {/* 面部轮廓 */}
            <View 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 border-4 border-rose-400 rounded-[50%]"
              style={{ 
                boxShadow: '0 0 20px rgba(251, 113, 133, 0.5)',
              }}
            />

            {/* 人脸识别状态指示 */}
            <View className="absolute top-0 left-0 right-0 flex justify-center">
              <View className={`px-4 py-1 rounded-full flex items-center gap-2 ${faceDetected ? 'bg-green-500' : 'bg-amber-500'}`}>
                <Text className="text-white text-xs block">
                  {faceDetected ? '✓ 已识别' : '○ 寻找中'}
                </Text>
              </View>
            </View>

            {/* 扫描点 */}
            {isScanning && Array.from({ length: 12 }).map((_, index) => {
              const angle = (index / 12) * 2 * Math.PI - Math.PI / 2
              const radiusX = 96
              const radiusY = 128
              const centerX = 140
              const centerY = 190
              const x = centerX + radiusX * Math.cos(angle) - 3
              const y = centerY + radiusY * Math.sin(angle) - 3
              
              return (
                <View
                  key={index}
                  className="absolute w-1.5 h-1.5 bg-rose-400 rounded-full"
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    boxShadow: '0 0 12px rgba(251, 113, 133, 0.8)',
                    animation: `pulse 1.5s infinite ${index * 0.15}s alternate`
                  }}
                />
              )
            })}

            {/* 扫描线动画 */}
            {isScanning && (
              <View
                className="absolute left-0 right-0 h-1"
                style={{
                  top: `${scanProgress}%`,
                  background: 'linear-gradient(90deg, transparent, rgba(244, 63, 94, 0.9), rgba(180, 83, 173, 0.9), rgba(244, 63, 94, 0.9), transparent)',
                  boxShadow: '0 0 15px rgba(244, 63, 94, 0.8)',
                }}
              />
            )}

            {/* 扫描网格背景 */}
            {isScanning && (
              <View className="absolute inset-4 opacity-20">
                <View className="w-full h-full" style={{ backgroundImage: 'linear-gradient(rgba(244, 63, 94, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(244, 63, 94, 0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              </View>
            )}

            {/* 语音引导文字 */}
            {isScanning && (
              <View className="absolute -top-20 left-0 right-0 text-center">
                <View className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2 mx-4">
                  <Text className="text-white text-sm font-medium block">
                    🔊 {guideText}
                  </Text>
                  <Text className="text-rose-300 text-xs block mt-1">
                    {countdown}秒后自动拍照
                  </Text>
                </View>
              </View>
            )}

            {/* 中心提示点 */}
            <View className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <View className="w-2 h-2 bg-rose-400 rounded-full shadow-lg shadow-rose-400/50" />
            </View>
          </View>
        ) : (
          // 未开始检测时的引导UI
          <View className="flex flex-col items-center justify-center gap-4">
            {/* 引导图标 */}
            <View className="relative w-32 h-32">
              <View className="absolute inset-0 border-4 border-rose-400/30 rounded-full animate-ping" />
              <View className="absolute inset-4 border-2 border-rose-400/50 rounded-full" />
              <View className="absolute inset-8 bg-rose-400/10 border-2 border-rose-400 rounded-full flex items-center justify-center">
                <Text className="text-4xl">👤</Text>
              </View>
            </View>

            {/* 引导文字 */}
            <View className="bg-black/40 backdrop-blur-sm rounded-2xl px-6 py-4">
              <Text className="text-white text-base text-center block">
                准备好开始检测了吗？
              </Text>
              <Text className="text-rose-300 text-sm text-center block mt-2">
                点击下方「开始检测」按钮
              </Text>
            </View>

            {/* 提示要点 */}
            <View className="flex flex-col gap-2 mt-2">
              <View className="flex items-center gap-2">
                <Text className="text-rose-400 text-lg">✓</Text>
                <Text className="text-white/80 text-xs block">保持光线充足</Text>
              </View>
              <View className="flex items-center gap-2">
                <Text className="text-rose-400 text-lg">✓</Text>
                <Text className="text-white/80 text-xs block">表情自然放松</Text>
              </View>
              <View className="flex items-center gap-2">
                <Text className="text-rose-400 text-lg">✓</Text>
                <Text className="text-white/80 text-xs block">不要移动头部</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* 顶部控制栏 */}
      <View className="absolute top-0 left-0 right-0 p-6 z-10">
        <View className="flex justify-between items-center">
          <View
            onClick={handleCancel}
            className="bg-black/30 w-10 h-10 flex items-center justify-center rounded-full active:bg-black/50 transition-colors"
          >
            <Text className="text-white text-xl block">✕</Text>
          </View>

          <View className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full">
            <Text className="text-white text-sm block">
              {flash === 'off' ? '闪光灯：关' : flash === 'on' ? '闪光灯：开' : '闪光灯：常亮'}
            </Text>
          </View>

          <View className="w-10 h-10" />
        </View>
      </View>

      {/* 底部操作区域 */}
      <View className="absolute bottom-0 left-0 right-0 z-10">
        {/* 扫描数据展示 */}
        {isScanning && (
          <View className="mx-6 mb-4 bg-black/70 backdrop-blur-sm rounded-2xl p-4">
            <View className="flex flex-col gap-2">
              <View className="flex items-center gap-3">
                <Text className="text-white text-xs w-20 block">面部轮廓</Text>
                <View className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <View 
                    className="h-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all duration-300"
                    style={{ width: `${scanData.faceOutline}%` }}
                  />
                </View>
                <Text className="text-white text-xs w-10 text-right block">{Math.round(scanData.faceOutline)}%</Text>
              </View>

              <View className="flex items-center gap-3">
                <Text className="text-white text-xs w-20 block">肤质特征</Text>
                <View className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <View 
                    className="h-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all duration-300"
                    style={{ width: `${scanData.skinFeatures}%` }}
                  />
                </View>
                <Text className="text-white text-xs w-10 text-right block">{Math.round(scanData.skinFeatures)}%</Text>
              </View>

              <View className="flex items-center gap-3">
                <Text className="text-white text-xs w-20 block">水分含量</Text>
                <View className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <View 
                    className="h-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all duration-300"
                    style={{ width: `${scanData.moisture}%` }}
                  />
                </View>
                <Text className="text-white text-xs w-10 text-right block">{Math.round(scanData.moisture)}%</Text>
              </View>

              <View className="flex items-center gap-3">
                <Text className="text-white text-xs w-20 block">皮肤纹理</Text>
                <View className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <View 
                    className="h-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all duration-300"
                    style={{ width: `${scanData.texture}%` }}
                  />
                </View>
                <Text className="text-white text-xs w-10 text-right block">{Math.round(scanData.texture)}%</Text>
              </View>
            </View>
          </View>
        )}

        {/* 提示信息卡片 */}
        <View className="mx-6 mb-4 bg-black/40 backdrop-blur-sm rounded-2xl p-4">
          <View className="flex items-center justify-center gap-2">
            <Text className="text-white text-sm text-center">
              {isScanning
                ? '💡 请保持面部在轮廓内，不要移动'
                : showFaceOutline
                ? '💡 请将面部对准轮廓，保持光线充足，表情自然'
                : '💡 点击下方「开始检测」按钮，等待人脸轮廓出现后对准'
              }
            </Text>
          </View>
        </View>

        {/* 操作按钮区域 */}
        <View className="bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-8 pb-12 px-6">
          <View className="flex items-center justify-between gap-4">
            {/* 切换摄像头按钮 */}
            <View
              onClick={handleSwitchCamera}
              className={`bg-white/20 w-14 h-14 flex items-center justify-center rounded-2xl transition-colors flex-shrink-0 ${
                isScanning ? 'opacity-50' : 'active:bg-white/30'
              }`}
            >
              <Text className="text-2xl block">🔄</Text>
            </View>

            {/* 开始检测按钮 */}
            {isScanning ? (
              <View className="relative w-24 h-24 bg-rose-400 rounded-full flex items-center justify-center shadow-2xl shadow-rose-400/50">
                <View className="absolute inset-0 bg-rose-400 rounded-full animate-ping opacity-50" />
                <View className="w-20 h-20 bg-rose-400 rounded-full border-4 border-white flex items-center justify-center">
                  <Text className="text-white text-2xl font-bold">{countdown}</Text>
                </View>
              </View>
            ) : (
              <View
                onClick={handleStartDetection}
                className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform flex-shrink-0"
              >
                <View className="absolute inset-0 bg-white rounded-full" />
                <View className="w-20 h-20 bg-rose-400 rounded-full border-4 border-white flex items-center justify-center">
                  <Text className="text-white text-sm font-bold">开始检测</Text>
                </View>
              </View>
            )}

            {/* 闪光灯切换按钮 */}
            <View
              onClick={handleSwitchFlash}
              className={`bg-white/20 w-14 h-14 flex items-center justify-center rounded-2xl transition-colors flex-shrink-0 ${
                isScanning ? 'opacity-50' : 'active:bg-white/30'
              }`}
            >
              <Text className="text-2xl block">
                {flash === 'off' ? '🔴' : flash === 'on' ? '⚪' : '💡'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

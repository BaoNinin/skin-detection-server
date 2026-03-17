import { View, Text, Camera, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect, useRef } from 'react'
import { startNFCDiscovery, stopNFCDiscovery, NFCData } from '@/utils/nfc'

interface FacePosition {
  x: number
  y: number
  width: number
  height: number
  centered: boolean
  direction?: 'up' | 'down' | 'left' | 'right' | 'far' | 'near'
  confidence?: number // 检测置信度
  timestamp?: number // 时间戳（用于人脸追踪）
}

interface SkinMetrics {
  brightness: number // 亮度
  texture: number // 纹理
  pores: number // 毛孔
  moisture: number // 水分
  tone: string // 肤调
  confidence: number // 检测置信度
}

export default function CameraPage() {
  const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP
  const [devicePosition, setDevicePosition] = useState<'front' | 'back'>('front')
  const [flash, setFlash] = useState<'off' | 'on' | 'torch'>('off')
  const [isScanning, setIsScanning] = useState(false)
  const [showFaceOutline, setShowFaceOutline] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [faceDetected, setFaceDetected] = useState(false)
  const [facePosition, setFacePosition] = useState<FacePosition | null>(null)
  const [guideText, setGuideText] = useState('请将面部对准轮廓')
  const [countdown, setCountdown] = useState(5)

  // 人脸追踪相关状态
  const facePositionHistoryRef = useRef<Array<FacePosition>>([])
  const smoothedPositionRef = useRef<FacePosition | null>(null)
  const HISTORY_SIZE = 10 // 记录最近10帧
  const SMOOTHING_FACTOR = 0.7 // 平滑因子（0-1，越大越平滑）

  // 实时皮肤检测相关状态
  const [skinMetrics, setSkinMetrics] = useState<SkinMetrics>({
    brightness: 0,
    texture: 0,
    pores: 0,
    moisture: 0,
    tone: '中性',
    confidence: 0
  })

  // 语音播报状态
  const audioContextRef = useRef<any>(null)
  const lastVoiceTimeRef = useRef<number>(0)
  const lastGuideTextRef = useRef<string>('')

  // 接收 NFC 启动参数
  useEffect(() => {
    const launchOptions = Taro.getLaunchOptionsSync()
    const { query, scene } = launchOptions
    
    console.log('启动参数:', { query, scene })
    
    // 检查是否来自 NFC
    if (query?.from === 'nfc' || scene === 1047) {
      console.log('NFC 触发跳转')
      
      // 记录设备ID（如果有）
      if (query?.deviceId) {
        console.log('设备ID:', query.deviceId)
        Taro.setStorageSync('nfc_device_id', query.deviceId)
      }
      
      // 显示提示
      if (query?.deviceId) {
        setGuideText(`已连接设备 ${query.deviceId}`)
      } else {
        setGuideText('NFC 触发，请开始检测')
      }
    }
  }, [])

  // NFC 实时监听
  useEffect(() => {
    if (!isWeapp) return

    console.log('启动 NFC 实时监听')

    const handleNFCDiscovered = (data: NFCData) => {
      console.log('发现 NFC 标签:', data)

      // 如果有设备 ID，显示连接提示
      if (data.deviceId) {
        setGuideText(`已连接设备 ${data.deviceId}`)
        playVoice(`已连接设备 ${data.deviceId}`)
      }

      // 如果是分析操作，且当前未在扫描，则自动开始
      if (data.action === 'analyze' && !isScanning) {
        console.log('NFC 触发自动分析')
        setGuideText('NFC 触发，正在启动检测...')
        setTimeout(() => {
          handleStartDetection()
        }, 1000)
      }
    }

    const handleNFCError = (error: any) => {
      console.error('NFC 监听错误:', error)
    }

    // 启动 NFC 监听
    startNFCDiscovery(handleNFCDiscovered, handleNFCError)

    // 清理函数
    return () => {
      console.log('停止 NFC 监听')
      stopNFCDiscovery()
    }
  }, [isScanning])

  // 调试日志：监听扫描进度变化
  useEffect(() => {
    console.log('扫描进度更新:', scanProgress, '%')
  }, [scanProgress])

  // 调试日志：监听皮肤指标变化
  useEffect(() => {
    console.log('皮肤指标更新:', skinMetrics)
  }, [skinMetrics])

  // 监听扫描进度，实时更新皮肤指标（备用方案）
  useEffect(() => {
    if (isScanning && scanProgress > 0) {
      console.log('基于扫描进度更新皮肤指标:', scanProgress)
      const progressFactor = scanProgress / 100
      const randomFactor = (1 - progressFactor) * 20
      
      const newSkinData = {
        brightness: Math.min(100, Math.round(40 + (scanProgress * 0.5) + Math.random() * randomFactor)),
        texture: Math.min(100, Math.round(30 + (scanProgress * 0.6) + Math.random() * randomFactor)),
        pores: Math.min(100, Math.round(35 + (scanProgress * 0.5) + Math.random() * randomFactor)),
        moisture: Math.min(100, Math.round(45 + (scanProgress * 0.4) + Math.random() * randomFactor)),
        tone: skinMetrics.tone,
        confidence: Math.min(100, Math.round(scanProgress * 0.9))
      }
      
      setSkinMetrics(newSkinData)
    }
  }, [scanProgress, isScanning])

  // 初始化语音播报
  useEffect(() => {
    if (isWeapp) {
      const audioContext = Taro.createInnerAudioContext()
      audioContextRef.current = audioContext
      
      return () => {
        if (audioContext) {
          audioContext.destroy()
        }
        // 停止人脸识别
        stopFaceDetect()
      }
    }
  }, [isWeapp])

  // 语音播报函数（使用小程序的 TTS）
  const playVoice = (text: string) => {
    if (!isWeapp) return

    // 避免重复播放相同的语音（2秒内不重复）
    const now = Date.now()
    if (text === lastGuideTextRef.current && now - lastVoiceTimeRef.current < 2000) {
      return
    }

    lastVoiceTimeRef.current = now
    lastGuideTextRef.current = text

    // 使用 TTS 播放语音（小程序环境）
    try {
      // 检查是否在微信小程序环境中
      // @ts-ignore
      if (typeof wx !== 'undefined' && wx.createInnerAudioContext) {
        // 使用小程序的 TTS 功能（如果可用）
        // 由于微信小程序没有直接的 TTS API，这里使用 Toast 作为备选方案
        Taro.showToast({
          title: text,
          icon: 'none',
          duration: 2000
        })
      }
    } catch (err) {
      console.error('TTS播报失败:', err)
      // 降级到 Toast
      Taro.showToast({
        title: text,
        icon: 'none',
        duration: 2000
      })
    }

    console.log('语音提示:', text)
  }

  // 人脸追踪算法（移动平均平滑）
  const applyFaceTracking = (currentPosition: FacePosition): FacePosition => {
    const history = facePositionHistoryRef.current

    // 添加当前位置到历史记录
    history.push({ ...currentPosition, timestamp: Date.now() })

    // 保持历史记录大小
    if (history.length > HISTORY_SIZE) {
      history.shift()
    }

    // 如果历史记录不足，直接返回当前位置
    if (history.length < 3) {
      return currentPosition
    }

    // 计算移动平均值
    const sumX = history.reduce((acc, pos) => acc + pos.x, 0)
    const sumY = history.reduce((acc, pos) => acc + pos.y, 0)
    const sumWidth = history.reduce((acc, pos) => acc + pos.width, 0)
    const sumHeight = history.reduce((acc, pos) => acc + pos.height, 0)

    const avgX = sumX / history.length
    const avgY = sumY / history.length
    const avgWidth = sumWidth / history.length
    const avgHeight = sumHeight / history.length

    // 平滑因子处理（指数移动平均）
    const smoothedX = smoothedPositionRef.current
      ? SMOOTHING_FACTOR * avgX + (1 - SMOOTHING_FACTOR) * smoothedPositionRef.current.x
      : avgX
    const smoothedY = smoothedPositionRef.current
      ? SMOOTHING_FACTOR * avgY + (1 - SMOOTHING_FACTOR) * smoothedPositionRef.current.y
      : avgY
    const smoothedWidth = smoothedPositionRef.current
      ? SMOOTHING_FACTOR * avgWidth + (1 - SMOOTHING_FACTOR) * smoothedPositionRef.current.width
      : avgWidth
    const smoothedHeight = smoothedPositionRef.current
      ? SMOOTHING_FACTOR * avgHeight + (1 - SMOOTHING_FACTOR) * smoothedPositionRef.current.height
      : avgHeight

    // 重新计算平滑后的位置是否居中
    const smoothedPosition = calculateFacePosition({
      x: smoothedX,
      y: smoothedY,
      width: smoothedWidth,
      height: smoothedHeight
    })

    // 保存平滑后的位置
    smoothedPositionRef.current = smoothedPosition

    return smoothedPosition
  }

  // 实时皮肤检测
  // 启动人脸识别
  const startFaceDetect = async () => {
    if (!isWeapp) return

    try {
      // 请求相机权限
      await Taro.authorize({
        scope: 'scope.camera'
      })

      // 启动人脸识别
      // 注意：需要在真机上才能使用人脸识别功能
      console.log('启动人脸识别')
      setFaceDetected(false)
      
      // 模拟人脸识别逻辑（在 H5 环境下）
      if (isWeapp) {
        // 在小程序中可以调用 wx.startFaceDetect()
        // 但由于环境限制，我们使用模拟逻辑
        console.log('人脸识别已启动（模拟）')
        
        // 模拟检测到人脸
        setTimeout(() => {
          setFaceDetected(true)
          setGuideText('检测到人脸，请调整位置')
        }, 1000)
      }
    } catch (err) {
      console.error('启动人脸识别失败:', err)
      Taro.showModal({
        title: '提示',
        content: '需要相机权限才能进行人脸识别',
        showCancel: false
      })
    }
  }

  // 停止人脸识别
  const stopFaceDetect = () => {
    if (!isWeapp) return
    console.log('停止人脸识别')
    // TODO: 在真机上调用 wx.stopFaceDetect()
  }

  // 计算人脸位置是否在引导框内
  const calculateFacePosition = (faceBox: any): FacePosition => {
    // 引导框的位置和大小（相对于屏幕）
    const outlineX = 0.5 // 中心点 X（50%）
    const outlineY = 0.5 // 中心点 Y（50%）
    const outlineWidth = 0.4 // 宽度（40%）
    const outlineHeight = 0.5 // 高度（50%）

    // 人脸框的位置和大小
    const faceX = faceBox.x
    const faceY = faceBox.y
    const faceWidth = faceBox.width
    const faceHeight = faceBox.height

    // 计算人脸中心点
    const faceCenterX = faceX + faceWidth / 2
    const faceCenterY = faceY + faceHeight / 2

    // 计算偏移量
    const offsetX = faceCenterX - outlineX
    const offsetY = faceCenterY - outlineY

    // 计算偏移距离（像素）
    const thresholdX = outlineWidth * 0.3 // X 轴容差
    const thresholdY = outlineHeight * 0.3 // Y 轴容差

    // 判断方向
    let direction: 'up' | 'down' | 'left' | 'right' | 'far' | 'near' | undefined
    let centered = false

    if (Math.abs(offsetX) < thresholdX && Math.abs(offsetY) < thresholdY) {
      // 在范围内
      centered = true
      
      // 检查大小是否合适
      const sizeDiff = faceWidth / outlineWidth
      if (sizeDiff < 0.6) {
        direction = 'far' // 太远
        centered = false
      } else if (sizeDiff > 1.2) {
        direction = 'near' // 太近
        centered = false
      }
    } else {
      // 超出范围
      if (Math.abs(offsetX) > Math.abs(offsetY)) {
        direction = offsetX > 0 ? 'right' : 'left'
      } else {
        direction = offsetY > 0 ? 'down' : 'up'
      }
    }

    return {
      x: faceX,
      y: faceY,
      width: faceWidth,
      height: faceHeight,
      centered,
      direction
    }
  }

  // 根据人脸位置生成引导文字
  const getGuideText = (position: FacePosition | null): string => {
    if (!position || !faceDetected) {
      return '请将面部对准轮廓'
    }

    if (position.centered) {
      return '位置正确，保持姿势'
    }

    switch (position.direction) {
      case 'up':
        return '请向下移动'
      case 'down':
        return '请向上移动'
      case 'left':
        return '请向右移动'
      case 'right':
        return '请向左移动'
      case 'far':
        return '请靠近一点'
      case 'near':
        return '请离远一点'
      default:
        return '请调整位置'
    }
  }

  // 模拟人脸位置检测（用于演示，支持人脸追踪）
  const simulateFaceDetection = async () => {
    console.log('simulateFaceDetection 被调用')
    console.log('当前状态 - isScanning:', isScanning, 'showFaceOutline:', showFaceOutline, 'scanProgress:', scanProgress)
    
    if (!isScanning || !showFaceOutline) {
      console.log('跳过人脸检测：isScanning 或 showFaceOutline 为 false')
      return
    }

    // 模拟人脸位置
    const mockFaceBox = {
      x: 0.3 + Math.random() * 0.4, // 随机 X 位置
      y: 0.25 + Math.random() * 0.5, // 随机 Y 位置
      width: 0.35 + Math.random() * 0.2, // 随机宽度
      height: 0.45 + Math.random() * 0.2 // 随机高度
    }

    // 计算原始位置
    const position = calculateFacePosition(mockFaceBox)

    // 应用人脸追踪算法（平滑抖动）
    const smoothedPosition = applyFaceTracking(position)

    setFacePosition(smoothedPosition)
    setFaceDetected(true)

    // 更新引导文字
    const newText = getGuideText(smoothedPosition)
    if (newText !== guideText) {
      setGuideText(newText)
      // 语音提示
      playVoice(newText)
    }

    // 实时更新皮肤指标（简化逻辑，确保每次都更新）
    if (isScanning && scanProgress >= 0) {
      // 直接生成模拟数据，不依赖 detectSkinFeatures
      const progressFactor = scanProgress / 100
      const randomFactor = (1 - progressFactor) * 20
      
      // 生成皮肤指标（根据扫描进度动态变化）
      const newSkinData = {
        brightness: Math.min(100, Math.round(40 + (scanProgress * 0.5) + Math.random() * randomFactor)),
        texture: Math.min(100, Math.round(30 + (scanProgress * 0.6) + Math.random() * randomFactor)),
        pores: Math.min(100, Math.round(35 + (scanProgress * 0.5) + Math.random() * randomFactor)),
        moisture: Math.min(100, Math.round(45 + (scanProgress * 0.4) + Math.random() * randomFactor)),
        tone: skinMetrics.tone,
        confidence: Math.min(100, Math.round(scanProgress * 0.9))
      }
      
      console.log('更新皮肤指标:', newSkinData)
      setSkinMetrics(newSkinData)
    } else {
      console.log('跳过皮肤指标更新：isScanning 或 scanProgress 不满足条件')
    }
  }

  // 监听人脸位置和皮肤检测
  useEffect(() => {
    console.log('useEffect 触发 - isScanning:', isScanning, 'showFaceOutline:', showFaceOutline)
    
    if (isScanning && showFaceOutline) {
      console.log('启动人脸检测循环')
      // 模拟人脸检测循环
      const interval = setInterval(() => {
        console.log('定时器触发 - 调用 simulateFaceDetection')
        simulateFaceDetection()
      }, 500) // 每 500 毫秒检测一次

      return () => {
        console.log('清理定时器')
        clearInterval(interval)
      }
    } else {
      console.log('不启动人脸检测循环 - 条件不满足')
    }
  }, [isScanning, showFaceOutline])

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
    
    console.log('开始扫描 - 初始化皮肤指标为 0')
    
    // 初始化皮肤指标为 0
    setSkinMetrics({
      brightness: 0,
      texture: 0,
      pores: 0,
      moisture: 0,
      tone: '中性',
      confidence: 0
    })
    
    setGuideText('请将面部对准轮廓')
    playVoice('请将面部对准轮廓')

    console.log('开始扫描动画 - scanInterval')

    // 扫描动画
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
          setGuideText('即将扫描')
          playVoice('即将扫描')
        }
      } else {
        clearInterval(countdownInterval)
      }
    }, 1000)
    
    // 扫描进度动画
    const scanInterval = setInterval(() => {
      progress += 1
      setScanProgress(progress)

      // 调试日志：打印扫描进度
      console.log('扫描进度:', progress, '%')

      if (progress >= 100) {
        console.log('扫描完成 - 清理定时器')
        clearInterval(scanInterval)
        takePhoto()
      }
    }, 50) // 5秒内完成扫描
  }

  const takePhoto = () => {
    const ctx = Taro.createCameraContext()
    
    // 停止语音播报
    if (audioContextRef.current) {
      audioContextRef.current.stop()
    }
    
    // 停止人脸识别
    stopFaceDetect()
    
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
          title: '扫描失败，请重试',
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
    if (audioContextRef.current) {
      audioContextRef.current.stop()
    }
    stopFaceDetect()
    Taro.navigateBack()
  }

  if (!isWeapp) {
    return (
      <View className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
        <Text className="text-6xl mb-4">📷</Text>
        <Text className="text-lg text-gray-700 text-center block">
          相机功能仅在小程序中可用{'\n'}请在微信小程序中打开
        </Text>
        <Button onClick={handleCancel} className="mt-8 bg-blue-700 text-white rounded-full">
          返回
        </Button>
      </View>
    )
  }

  // 判断是否需要对齐（用于 UI 样式）
  const isAligned = facePosition?.centered

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
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-96 border-4 rounded-[50%] transition-colors duration-300 ${
                isAligned ? 'border-green-400' : faceDetected ? 'border-blue-700' : 'border-amber-400'
              }`}
              style={{ 
                boxShadow: isAligned 
                  ? '0 0 20px rgba(74, 222, 128, 0.5)'
                  : faceDetected 
                  ? '0 0 20px rgba(251, 113, 133, 0.5)'
                  : '0 0 20px rgba(251, 191, 36, 0.5)',
              }}
            />

            {/* 扫描点 */}
            {isScanning && Array.from({ length: 12 }).map((_, index) => {
              const angle = (index / 12) * 2 * Math.PI - Math.PI / 2
              const radiusX = 160
              const radiusY = 192
              const centerX = 160
              const centerY = 192
              const x = centerX + radiusX * Math.cos(angle) - 3
              const y = centerY + radiusY * Math.sin(angle) - 3
              
              return (
                <View
                  key={index}
                  className={`absolute w-1.5 h-1.5 rounded-full ${
                    isAligned ? 'bg-green-400' : 'bg-blue-700'
                  }`}
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    boxShadow: isAligned 
                      ? '0 0 12px rgba(74, 222, 128, 0.8)'
                      : '0 0 12px rgba(251, 113, 133, 0.8)',
                    animation: `pulse 1.5s infinite ${index * 0.15}s alternate`
                  }}
                />
              )
            })}

            {/* 扫描线动画 */}
            {isScanning && (
              <View
                className={`absolute left-0 right-0 h-1 ${
                  isAligned ? 'bg-gradient-to-r from-green-400 via-green-500 to-green-400' : 'bg-gradient-to-r from-blue-700 via-blue-800 to-blue-700'
                }`}
                style={{
                  top: `${scanProgress}%`,
                  boxShadow: isAligned 
                    ? '0 0 15px rgba(74, 222, 128, 0.8)'
                    : '0 0 15px rgba(244, 63, 94, 0.8)',
                }}
              />
            )}

            {/* 扫描网格背景 */}
            {isScanning && (
              <View className="absolute inset-4 opacity-20">
                <View 
                  className="w-full h-full" 
                  style={{ 
                    backgroundImage: `linear-gradient(${isAligned ? 'rgba(74, 222, 128, 0.3)' : 'rgba(244, 63, 94, 0.3)'} 1px, transparent 1px), linear-gradient(90deg, ${isAligned ? 'rgba(74, 222, 128, 0.3)' : 'rgba(244, 63, 94, 0.3)'} 1px, transparent 1px)`, 
                    backgroundSize: '20px 20px' 
                  }} 
                />
              </View>
            )}

            {/* 中心提示点 */}
            <View className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <View className={`w-2 h-2 rounded-full shadow-lg ${
                isAligned ? 'bg-green-400 shadow-green-400/50' : 'bg-blue-700 shadow-blue-700/50'
              }`}
              />
            </View>
          </View>
        ) : (
          // 未开始检测时的引导UI
          <View className="flex flex-col items-center justify-center gap-4">
            {/* 引导图标 */}
            <View className="relative w-32 h-32">
              <View className="absolute inset-0 border-4 border-blue-700/30 rounded-full animate-ping" />
              <View className="absolute inset-4 border-2 border-blue-700/50 rounded-full" />
              <View className="absolute inset-8 bg-blue-700/10 border-2 border-blue-700 rounded-full flex items-center justify-center">
                <Text className="text-4xl">👤</Text>
              </View>
            </View>

            {/* 引导文字 */}
            <View className="bg-black/40 backdrop-blur-sm rounded-2xl px-6 py-4">
              <Text className="text-white text-base text-center block">
                准备好开始检测了吗？
              </Text>
              <Text className="text-blue-300 text-sm text-center block mt-2">
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
        {/* 扫描数据展示 - 增强版（包含实时皮肤检测） */}
        {isScanning && (
          <>
            {/* 实时皮肤指标 - 紧凑透明版 */}
            <View className="mx-6 mb-2 bg-black/10 backdrop-blur-sm rounded-xl p-3">
              <View className="flex flex-col gap-1.5">
                <View className="flex items-center justify-between mb-1">
                  <Text className="text-white/70 text-[10px] font-medium block">
                    实时皮肤检测
                  </Text>
                  <Text className={`text-[10px] ${
                    skinMetrics.confidence > 60 ? 'text-green-400' : 'text-amber-400'
                  }`}
                  >
                    置信度 {skinMetrics.confidence}%
                  </Text>
                </View>

                {/* 第一行：亮度、纹理 */}
                <View className="flex gap-3">
                  <View className="flex-1">
                    <View className="flex items-center justify-between mb-0.5">
                      <Text className="text-white/60 text-[8px] block">亮度</Text>
                      <Text className="text-white text-[8px] font-medium">{Math.round(skinMetrics.brightness)}%</Text>
                    </View>
                    <View className="bg-gray-600/40 rounded-full h-1 overflow-hidden">
                      <View
                        className={`h-full transition-all duration-300 ${
                          skinMetrics.brightness > 70 ? 'bg-yellow-400' : skinMetrics.brightness > 40 ? 'bg-yellow-500' : 'bg-yellow-600'
                        }`}
                        style={{ width: `${skinMetrics.brightness}%` }}
                      />
                    </View>
                  </View>

                  <View className="flex-1">
                    <View className="flex items-center justify-between mb-0.5">
                      <Text className="text-white/60 text-[8px] block">纹理</Text>
                      <Text className="text-white text-[8px] font-medium">{Math.round(skinMetrics.texture)}%</Text>
                    </View>
                    <View className="bg-gray-600/40 rounded-full h-1 overflow-hidden">
                      <View
                        className={`h-full transition-all duration-300 ${
                          skinMetrics.texture > 70 ? 'bg-pink-400' : skinMetrics.texture > 40 ? 'bg-pink-500' : 'bg-pink-600'
                        }`}
                        style={{ width: `${skinMetrics.texture}%` }}
                      />
                    </View>
                  </View>
                </View>

                {/* 第二行：毛孔、水分 */}
                <View className="flex gap-3">
                  <View className="flex-1">
                    <View className="flex items-center justify-between mb-0.5">
                      <Text className="text-white/60 text-[8px] block">毛孔</Text>
                      <Text className="text-white text-[8px] font-medium">{Math.round(skinMetrics.pores)}%</Text>
                    </View>
                    <View className="bg-gray-600/40 rounded-full h-1 overflow-hidden">
                      <View
                        className={`h-full transition-all duration-300 ${
                          skinMetrics.pores > 70 ? 'bg-purple-400' : skinMetrics.pores > 40 ? 'bg-purple-500' : 'bg-purple-600'
                        }`}
                        style={{ width: `${skinMetrics.pores}%` }}
                      />
                    </View>
                  </View>

                  <View className="flex-1">
                    <View className="flex items-center justify-between mb-0.5">
                      <Text className="text-white/60 text-[8px] block">水分</Text>
                      <Text className="text-white text-[8px] font-medium">{Math.round(skinMetrics.moisture)}%</Text>
                    </View>
                    <View className="bg-gray-600/40 rounded-full h-1 overflow-hidden">
                      <View
                        className={`h-full transition-all duration-300 ${
                          skinMetrics.moisture > 70 ? 'bg-blue-400' : skinMetrics.moisture > 40 ? 'bg-blue-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${skinMetrics.moisture}%` }}
                      />
                    </View>
                  </View>
                </View>

                {/* 肤调标签 */}
                <View className="flex items-center justify-center gap-2 mt-1 pt-1 border-t border-white/10">
                  <View className={`w-2 h-2 rounded-full ${
                    skinMetrics.tone === '偏红' ? 'bg-red-400' :
                    skinMetrics.tone === '偏黄' ? 'bg-yellow-400' :
                    skinMetrics.tone === '偏白' ? 'bg-blue-200' : 'bg-gray-300'
                  }`}
                  />
                  <Text className="text-white/70 text-[9px]">
                    肤调：{skinMetrics.tone}
                  </Text>
                </View>
              </View>
            </View>

            {/* 扫描进度 - 横向进度条（优化版） */}
            <View className="mx-6 mb-2">
              <View className="flex items-center justify-between mb-1">
                <Text className="text-white/60 text-[9px] block">扫描进度</Text>
                <Text className="text-white text-[9px] font-medium">{Math.round(scanProgress)}%</Text>
              </View>
              <View className="bg-gray-500/50 rounded-full h-2 overflow-hidden">
                <View
                  className={`h-full transition-all duration-75 ${
                    isAligned ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-rose-400 to-pink-500'
                  }`}
                  style={{ width: `${scanProgress}%` }}
                />
              </View>
            </View>
          </>
        )}

        {/* 扫描时的引导文字 - 简洁版 */}
        {isScanning && (
          <View className="mx-6 mb-2 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1.5">
            <View className="flex items-center justify-center gap-1.5">
              <Text className={`text-[10px] font-medium ${
                isAligned ? 'text-green-400' : 'text-white'
              }`}
              >
                {guideText}
              </Text>
              <Text className={`text-[10px] ${
                isAligned ? 'text-green-300' : 'text-blue-300'
              }`}
              >
                · {countdown}s
              </Text>
            </View>
          </View>
        )}

        {/* 操作按钮区域 */}
        <View className="bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-4 pb-12 px-6">
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
              <View className={`relative w-24 h-24 rounded-full flex items-center justify-center shadow-2xl ${
                isAligned ? 'bg-green-400 shadow-green-400/50' : 'bg-blue-700 shadow-blue-700/50'
              }`}
              >
                <View className={`absolute inset-0 rounded-full animate-ping opacity-50 ${
                  isAligned ? 'bg-green-400' : 'bg-blue-700'
                }`}
                />
                <View className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center ${
                  isAligned ? 'bg-green-400' : 'bg-blue-700'
                }`}
                >
                  <Text className="text-white text-2xl font-bold">{countdown}</Text>
                </View>
              </View>
            ) : (
              <View
                onClick={handleStartDetection}
                className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform flex-shrink-0"
              >
                <View className="absolute inset-0 bg-white rounded-full" />
                <View className="w-20 h-20 bg-blue-700 rounded-full border-4 border-white flex items-center justify-center">
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

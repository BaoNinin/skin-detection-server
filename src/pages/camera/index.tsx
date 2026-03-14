import { View, Text, Camera, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'

export default function CameraPage() {
  const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP
  const [devicePosition, setDevicePosition] = useState<'front' | 'back'>('front')
  const [flash, setFlash] = useState<'off' | 'on' | 'torch'>('off')
  const [isScanning, setIsScanning] = useState(false)
  const [showFaceOutline, setShowFaceOutline] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)

  const handleSwitchCamera = () => {
    setDevicePosition(prev => prev === 'front' ? 'back' : 'front')
  }

  const handleSwitchFlash = () => {
    // 微信小程序只支持 off、on、torch 三种模式
    const flashModes: Array<'off' | 'on' | 'torch'> = ['off', 'on', 'torch']
    const currentIndex = flashModes.indexOf(flash)
    const nextIndex = (currentIndex + 1) % flashModes.length
    const newFlash = flashModes[nextIndex]

    setFlash(newFlash)

    // 显示当前闪光灯状态
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

    // 显示人脸轮廓并开始扫描
    setShowFaceOutline(true)
    setIsScanning(true)
    setScanProgress(0)

    // 模拟扫描动画
    let progress = 0
    const scanInterval = setInterval(() => {
      progress += 2
      setScanProgress(progress)

      if (progress >= 100) {
        clearInterval(scanInterval)
        // 扫描完成，自动拍照
        takePhoto()
      }
    }, 50) // 5秒内完成扫描（100% / 2% per 50ms = 5秒）
  }

  const takePhoto = () => {
    const ctx = Taro.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        console.log('拍照成功:', res.tempImagePath)
        // 跳转到分析页面，带上识别成功标识
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
      <View className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {showFaceOutline ? (
          // 人脸检测框 - 开始检测后显示
          <View className="relative w-[280px] h-[380px]">
            {/* 面部轮廓 - 优化的形状 */}
            <View className="absolute inset-0">
              {/* 头顶轮廓 */}
              <View className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 border-t-4 border-l-4 border-r-4 border-rose-400 rounded-t-[60px]" />

            {/* 左侧脸颊轮廓 */}
            <View className="absolute top-12 left-0 w-16 h-48 border-l-4 border-rose-400 rounded-l-[80px]" />

            {/* 右侧脸颊轮廓 */}
            <View className="absolute top-12 right-0 w-16 h-48 border-r-4 border-rose-400 rounded-r-[80px]" />

            {/* 下巴轮廓 */}
            <View className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-16 border-b-4 border-l-4 border-r-4 border-rose-400 rounded-b-[40px]" />
          </View>

          {/* 扫描线动画 */}
          {isScanning && (
            <View
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-rose-400 to-transparent"
              style={{
                top: `${scanProgress}%`,
                boxShadow: '0 0 20px rgba(244, 63, 94, 0.8)',
              }}
            >
              <View className="w-full h-full bg-white opacity-50" />
            </View>
          )}

          {/* 扫描网格背景 */}
          {isScanning && (
            <View className="absolute inset-4 opacity-20">
              <View className="w-full h-full" style={{ backgroundImage: 'linear-gradient(rgba(244, 63, 94, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(244, 63, 94, 0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            </View>
          )}

          {/* 扫描进度文字 */}
          {isScanning && (
            <View className="absolute -bottom-16 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
              <Text className="text-white text-xs block text-center">
                正在扫描面部... {Math.round(scanProgress)}%
              </Text>
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
              {/* 外圈脉冲动画 */}
              <View className="absolute inset-0 border-4 border-rose-400/30 rounded-full animate-ping" />
              {/* 中圈 */}
              <View className="absolute inset-4 border-2 border-rose-400/50 rounded-full" />
              {/* 内圈 */}
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

      {/* 顶部控制栏 - 只显示取消按钮和闪光灯状态 */}
      <View className="absolute top-0 left-0 right-0 p-6 z-10">
        <View className="flex justify-between items-center">
          {/* 取消按钮 */}
          <View
            onClick={handleCancel}
            className="bg-black/30 w-10 h-10 flex items-center justify-center rounded-full active:bg-black/50 transition-colors"
          >
            <Text className="text-white text-xl block">✕</Text>
          </View>

          {/* 闪光灯状态指示器 */}
          <View className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full">
            <Text className="text-white text-sm block">
              {flash === 'off' ? '闪光灯：关' : flash === 'on' ? '闪光灯：开' : '闪光灯：常亮'}
            </Text>
          </View>

          {/* 占位，保持布局对称 */}
          <View className="w-10 h-10" />
        </View>
      </View>

      {/* 底部操作区域 */}
      <View className="absolute bottom-0 left-0 right-0 z-10">
        {/* 提示信息卡片 */}
        <View className="mx-6 mb-6 bg-black/40 backdrop-blur-sm rounded-2xl p-4">
          <View className="flex items-center justify-center gap-2">
            <Text className="text-white text-sm text-center">
              {isScanning
                ? '💡 请保持面部在轮廓内，不要移动'
                : '💡 请将面部对准轮廓，保持光线充足，表情自然'
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
                  <Text className="text-white text-2xl font-bold">{5 - Math.floor(scanProgress / 20)}</Text>
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

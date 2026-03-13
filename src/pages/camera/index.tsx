import { View, Text, Camera, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'

export default function CameraPage() {
  const [isWeapp, setIsWeapp] = useState(false)
  const [devicePosition, setDevicePosition] = useState<'front' | 'back'>('front')
  const [flash, setFlash] = useState<'off' | 'on' | 'torch'>('off')

  useEffect(() => {
    setIsWeapp(Taro.getEnv() === Taro.ENV_TYPE.WEAPP)
  }, [])

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

  const handleTakePhoto = () => {
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

    const ctx = Taro.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        console.log('拍照成功:', res.tempImagePath)
        Taro.redirectTo({
          url: `/pages/analyzing/index?imagePath=${encodeURIComponent(res.tempImagePath)}`
        })
      },
      fail: (err) => {
        console.error('拍照失败:', err)
        Taro.showToast({
          title: '拍照失败',
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

      {/* 人脸检测框 */}
      <View className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <View className="relative w-[300px] h-[400px]">
          {/* 四个角落的装饰 */}
          <View className="absolute top-0 left-0 w-16 h-16">
            <View className="w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
          </View>
          <View className="absolute top-0 right-0 w-16 h-16">
            <View className="w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
          </View>
          <View className="absolute bottom-0 left-0 w-16 h-16">
            <View className="w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
          </View>
          <View className="absolute bottom-0 right-0 w-16 h-16">
            <View className="w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
          </View>

          {/* 内部虚线框 */}
          <View className="absolute inset-4 border-2 border-white/30 rounded-lg" />

          {/* 中心提示点 */}
          <View className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <View className="w-3 h-3 bg-white/50 rounded-full" />
          </View>
        </View>
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
              💡 请将面部对准框内，保持光线充足，表情自然
            </Text>
          </View>
        </View>

        {/* 操作按钮区域 */}
        <View className="bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-8 pb-12 px-6">
          <View className="flex items-center justify-between gap-4">
            {/* 切换摄像头按钮 */}
            <View
              onClick={handleSwitchCamera}
              className="bg-white/20 w-14 h-14 flex items-center justify-center rounded-2xl active:bg-white/30 transition-colors flex-shrink-0"
            >
              <Text className="text-2xl block">🔄</Text>
            </View>

            {/* 拍照按钮 */}
            <View
              onClick={handleTakePhoto}
              className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform flex-shrink-0"
            >
              <View className="absolute inset-0 bg-white rounded-full" />
              <View className="w-20 h-20 bg-rose-400 rounded-full border-4 border-white" />
            </View>

            {/* 闪光灯切换按钮 */}
            <View
              onClick={handleSwitchFlash}
              className="bg-white/20 w-14 h-14 flex items-center justify-center rounded-2xl active:bg-white/30 transition-colors flex-shrink-0"
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

import { View, Text, Camera, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'

export default function CameraPage() {
  const [isWeapp, setIsWeapp] = useState(false)
  const [devicePosition, setDevicePosition] = useState<'front' | 'back'>('front')
  const [flash, setFlash] = useState<'off' | 'on' | 'auto'>('off')

  useEffect(() => {
    setIsWeapp(Taro.getEnv() === Taro.ENV_TYPE.WEAPP)
  }, [])

  const handleSwitchCamera = () => {
    setDevicePosition(prev => prev === 'front' ? 'back' : 'front')
  }

  const handleSwitchFlash = () => {
    const flashModes: Array<'off' | 'on' | 'auto'> = ['off', 'on', 'auto']
    const currentIndex = flashModes.indexOf(flash)
    const nextIndex = (currentIndex + 1) % flashModes.length
    setFlash(flashModes[nextIndex])
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
    <View className="h-screen bg-black relative">
      <Camera
        className="w-full h-full"
        devicePosition={devicePosition}
        mode="normal"
        flash={flash}
      />

      <View className="absolute inset-0 flex items-center justify-center">
        <View className="relative">
          <View className="w-[280px] h-[360px] border-4 border-white/50 rounded-[50%] border-dashed" />
          <View className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
            <View className="w-6 h-6 border-t-4 border-l-4 border-rose-400 rounded-tl-lg" />
          </View>
          <View className="absolute top-0 right-0 translate-x-2 -translate-y-2">
            <View className="w-6 h-6 border-t-4 border-r-4 border-rose-400 rounded-tr-lg" />
          </View>
          <View className="absolute bottom-0 left-0 -translate-x-2 translate-y-2">
            <View className="w-6 h-6 border-b-4 border-l-4 border-rose-400 rounded-bl-lg" />
          </View>
          <View className="absolute bottom-0 right-0 translate-x-2 translate-y-2">
            <View className="w-6 h-6 border-b-4 border-r-4 border-rose-400 rounded-br-lg" />
          </View>
        </View>
      </View>

      <View className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start bg-gradient-to-b from-black/50 to-transparent">
        <Button
          onClick={handleCancel}
          size="mini"
          className="bg-white/20 text-white border-0"
        >
          ✕
        </Button>
        <Button
          onClick={handleSwitchFlash}
          size="mini"
          className="bg-white/20 text-white border-0"
        >
          {flash === 'off' ? '⚫' : flash === 'on' ? '⚪' : '💡'}
        </Button>
      </View>

      <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-8 pb-12 px-4">
        <Text className="text-white text-center text-sm mb-8 block">
          请将面部对准框内，保持光线充足
        </Text>

        <View className="flex items-center justify-between px-4">
          <Button
            onClick={handleSwitchCamera}
            size="mini"
            className="bg-white/20 text-white border-0 text-2xl w-12 h-12 flex items-center justify-center"
          >
            🔄
          </Button>

          <View
            onClick={handleTakePhoto}
            className="w-20 h-20 bg-white rounded-full border-4 border-white/50 flex items-center justify-center shadow-lg"
          >
            <View className="w-16 h-16 bg-rose-400 rounded-full" />
          </View>

          <View className="w-12 h-12" />
        </View>
      </View>
    </View>
  )
}

import { View, Text, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'

export default function CameraPreviewPage() {
  // 从 Storage 读路径，避免 URL 参数长度限制截断
  const imagePath = Taro.getStorageSync('pendingPreviewPath') || ''
  const sysInfo = Taro.getSystemInfoSync()
  const statusBarHeight = sysInfo.statusBarHeight || 44
  const screenHeight = sysInfo.screenHeight || 667

  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  const checkCooldown = (): boolean => {
    const last = Taro.getStorageSync('lastAnalysisTime')
    if (last) {
      const CD = 5 * 60 * 1000
      const elapsed = Date.now() - last
      if (elapsed < CD) {
        const s = Math.ceil((CD - elapsed) / 1000)
        const m = Math.floor(s / 60)
        Taro.showToast({ title: `冷却中，还需 ${m}:${String(s % 60).padStart(2, '0')}`, icon: 'none', duration: 2500 })
        return false
      }
    }
    return true
  }

  const handleConfirm = () => {
    if (!imagePath) {
      Taro.showToast({ title: '照片获取失败，请重新拍照', icon: 'none' })
      Taro.navigateBack()
      return
    }
    if (!checkCooldown()) return
    Taro.setStorageSync('lastAnalysisTime', Date.now())
    Taro.redirectTo({
      url: `/pages/analyzing/index?imagePath=${encodeURIComponent(imagePath)}&scanSuccess=true`
    })
  }

  const handleRetake = () => {
    Taro.navigateBack()
  }

  return (
    <View style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#111', display: 'flex', flexDirection: 'column' }}>

      {/* 顶部导航 */}
      <View style={{ paddingTop: `${statusBarHeight + 8}px`, paddingBottom: '8px', paddingLeft: '16px', paddingRight: '16px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <View
          onClick={handleRetake}
          style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}
        >
          <Text style={{ color: 'white', fontSize: '22px' }}>‹</Text>
        </View>
        <Text style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>确认照片</Text>
      </View>

      {/* 照片展示区 */}
      <View style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', position: 'relative' }}>
        {imgError ? (
          <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', textAlign: 'center' }}>照片加载失败</Text>
            <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', textAlign: 'center' }}>{imagePath.slice(0, 40)}</Text>
          </View>
        ) : (
          <Image
            src={imagePath}
            mode="aspectFit"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            style={{
              width: '100%',
              height: `${Math.round(screenHeight * 0.58)}px`,
              borderRadius: '16px',
              display: 'block',
            }}
          />
        )}
        {!imgLoaded && !imgError && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>加载中...</Text>
          </View>
        )}
      </View>

      <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', textAlign: 'center', display: 'block', padding: '8px 32px 12px', flexShrink: 0 }}>
        照片仅用于本次皮肤状态分析，分析完成后立即删除
      </Text>

      {/* 操作按钮 */}
      <View style={{ padding: '0 24px 48px', display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>
        <Button
          onClick={handleConfirm}
          style={{ background: 'white', color: '#1d4ed8', borderRadius: '50px', fontSize: '17px', fontWeight: '700', height: '52px', lineHeight: '52px', border: 'none', margin: 0 }}
        >
          开始分析
        </Button>
        <Button
          onClick={handleRetake}
          style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '50px', fontSize: '15px', height: '48px', lineHeight: '48px', border: 'none', margin: 0 }}
        >
          重新拍照
        </Button>
      </View>
    </View>
  )
}

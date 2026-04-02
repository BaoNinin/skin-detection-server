import { View, Text, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { cameraState } from '@/utils/cameraState'

export default function CameraPreviewPage() {
  const imageSrc = cameraState.previewImageSrc
  const sysInfo = Taro.getSystemInfoSync()
  const statusBarHeight = sysInfo.statusBarHeight || 44
  const screenHeight = sysInfo.screenHeight || 667

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
    if (!imageSrc) {
      Taro.showToast({ title: '照片获取失败，请重新拍照', icon: 'none' })
      Taro.navigateBack()
      return
    }
    if (!checkCooldown()) return
    Taro.setStorageSync('lastAnalysisTime', Date.now())
    // 如果是 base64 data URI，需要先保存为文件再传给分析页
    if (imageSrc.startsWith('data:')) {
      // 把 base64 写入临时文件后跳转
      try {
        const fs = Taro.getFileSystemManager()
        const base64 = imageSrc.replace(/^data:image\/\w+;base64,/, '')
        const tmpPath = `${Taro.env.USER_DATA_PATH || ''}/skin_confirm_${Date.now()}.jpg`
        // 若 USER_DATA_PATH 为空则用写入方式（wx全局）
        const wxGlobal = (globalThis as any).wx
        const userDataPath = wxGlobal?.env?.USER_DATA_PATH || ''
        if (!userDataPath) {
          // 无法写文件，直接跳转（分析页可能无法加载）
          Taro.redirectTo({ url: `/pages/analyzing/index?imagePath=${encodeURIComponent(imageSrc.slice(0, 200))}&scanSuccess=true` })
          return
        }
        const dest = `${userDataPath}/skin_confirm_${Date.now()}.jpg`
        fs.writeFile({
          filePath: dest,
          data: base64,
          encoding: 'base64',
          success: () => {
            Taro.redirectTo({ url: `/pages/analyzing/index?imagePath=${encodeURIComponent(dest)}&scanSuccess=true` })
          },
          fail: () => {
            Taro.showToast({ title: '图片处理失败，请重拍', icon: 'none' })
          }
        })
      } catch {
        Taro.showToast({ title: '图片处理失败，请重拍', icon: 'none' })
      }
    } else {
      Taro.redirectTo({ url: `/pages/analyzing/index?imagePath=${encodeURIComponent(imageSrc)}&scanSuccess=true` })
    }
  }

  const handleRetake = () => {
    cameraState.previewImageSrc = ''
    Taro.navigateBack()
  }

  return (
    <View style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#111', display: 'flex', flexDirection: 'column' }}>

      <View style={{ paddingTop: `${statusBarHeight + 8}px`, paddingBottom: '8px', paddingLeft: '16px', paddingRight: '16px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <View onClick={handleRetake} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
          <Text style={{ color: 'white', fontSize: '22px' }}>‹</Text>
        </View>
        <Text style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>确认照片</Text>
      </View>

      <View style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px' }}>
        {imageSrc ? (
          <Image
            src={imageSrc}
            mode="aspectFit"
            style={{ width: '100%', height: `${Math.round(screenHeight * 0.6)}px`, borderRadius: '16px', display: 'block' }}
          />
        ) : (
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: `${Math.round(screenHeight * 0.6)}px` }}>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>未获取到照片，请重新拍照</Text>
          </View>
        )}
      </View>

      <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', textAlign: 'center', display: 'block', padding: '8px 32px 12px', flexShrink: 0 }}>
        照片仅用于本次皮肤状态分析，分析完成后立即删除
      </Text>

      <View style={{ padding: '0 24px 48px', display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>
        <Button onClick={handleConfirm} style={{ background: 'white', color: '#1d4ed8', borderRadius: '50px', fontSize: '17px', fontWeight: '700', height: '52px', lineHeight: '52px', border: 'none', margin: 0 }}>
          开始分析
        </Button>
        <Button onClick={handleRetake} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '50px', fontSize: '15px', height: '48px', lineHeight: '48px', border: 'none', margin: 0 }}>
          重新拍照
        </Button>
      </View>
    </View>
  )
}

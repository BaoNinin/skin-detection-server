import { View, Camera, CoverView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect, useRef } from 'react'
import { startNFCDiscovery, stopNFCDiscovery, NFCData } from '@/utils/nfc'

type FlashMode = 'off' | 'on' | 'torch'
const FLASH_NEXT: Record<FlashMode, FlashMode> = { off: 'on', on: 'torch', torch: 'off' }
const FLASH_LABEL: Record<FlashMode, string> = { off: '闪光关', on: '闪光开', torch: '常亮' }

export default function CameraPage() {
  const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP
  const sysInfo = Taro.getSystemInfoSync()
  const statusBarHeight = sysInfo.statusBarHeight || 44
  const screenHeight = sysInfo.screenHeight || 667
  const screenWidth = sysInfo.screenWidth || 375

  const [devicePosition, setDevicePosition] = useState<'front' | 'back'>('front')
  const [flashMode, setFlashMode] = useState<FlashMode>('off')

  // 冷却弹窗状态
  const [showCoolingModal, setShowCoolingModal] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)
  const [cooldownDisplay, setCooldownDisplay] = useState({ minutes: 0, seconds: 0 })

  // 相机初始化完成标志
  const [cameraReady, setCameraReady] = useState(false)

  // 扫描动画状态
  const [scanning, setScanning] = useState(false)
  const [countdown, setCountdown] = useState(4)
  const [scanY, setScanY] = useState(10)
  const scanDirRef = useRef(1)
  const takingPhotoRef = useRef(false)

  // 椭圆框尺寸
  const ovalW = Math.round(screenWidth * 0.68)
  const ovalH = Math.round(ovalW * 1.28)
  const ovalL = Math.round((screenWidth - ovalW) / 2)
  const ovalT = Math.round(screenHeight * 0.12)

  const navY = statusBarHeight + 8
  const flashBtnLeft = screenWidth - 70
  const btnTop = ovalT + ovalH + Math.round((screenHeight - ovalT - ovalH) * 0.42)
  const shutterLeft = Math.round((screenWidth - 72) / 2)
  const albumLeft = Math.round(screenWidth * 0.16)
  const flipLeft = screenWidth - Math.round(screenWidth * 0.16) - 54

  // 冷却倒计时
  useEffect(() => {
    if (!showCoolingModal || remainingTime <= Date.now()) return
    const interval = setInterval(() => {
      const remainingSeconds = Math.ceil((remainingTime - Date.now()) / 1000)
      setCooldownDisplay({ minutes: Math.floor(remainingSeconds / 60), seconds: remainingSeconds % 60 })
      if (remainingSeconds <= 0) setShowCoolingModal(false)
    }, 1000)
    return () => clearInterval(interval)
  }, [showCoolingModal, remainingTime])

  // 冷却检查
  const checkCooldown = (): boolean => {
    const last = Taro.getStorageSync('lastAnalysisTime')
    if (last) {
      const CD = 5 * 60 * 1000
      const elapsed = Date.now() - last
      if (elapsed < CD) {
        const remaining = CD - elapsed
        setRemainingTime(Date.now() + remaining)
        const s = Math.ceil(remaining / 1000)
        setCooldownDisplay({ minutes: Math.floor(s / 60), seconds: s % 60 })
        setShowCoolingModal(true)
        return false
      }
    }
    return true
  }

  // NFC
  useEffect(() => {
    if (!isWeapp) return
    const handleNFC = (data: NFCData) => { if (data.action === 'analyze') pickFromAlbum() }
    startNFCDiscovery(handleNFC, console.error)
    return () => stopNFCDiscovery()
  }, [])

  // 相机就绪后 500ms 开始扫描倒计时
  useEffect(() => {
    if (!cameraReady) return
    const t = setTimeout(() => {
      setCountdown(4)
      setScanY(10)
      scanDirRef.current = 1
      setScanning(true)
    }, 500)
    return () => clearTimeout(t)
  }, [cameraReady])

  // useEffect 驱动倒计时：归零时静默拍照
  useEffect(() => {
    if (!scanning) return

    if (countdown <= 0) {
      setScanning(false)
      if (takingPhotoRef.current) return
      takingPhotoRef.current = true

      try {
        const ctx = Taro.createCameraContext()
        ctx.takePhoto({
          quality: 'high',
          success: (res: any) => {
            takingPhotoRef.current = false
            goToAnalyzing(res.tempImagePath)
          },
          fail: (err: any) => {
            // takePhoto 失败：降级到系统相机
            console.error('takePhoto fail, fallback to chooseMedia', JSON.stringify(err))
            takingPhotoRef.current = false
            openSystemCamera()
          },
        })
      } catch (e) {
        // createCameraContext 异常：降级
        takingPhotoRef.current = false
        openSystemCamera()
      }
      return
    }

    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [scanning, countdown])

  // 扫描线动画
  useEffect(() => {
    if (!scanning) return
    const id = setInterval(() => {
      setScanY(prev => {
        const next = prev + scanDirRef.current * 2
        if (next >= 90) { scanDirRef.current = -1; return 90 }
        if (next <= 10) { scanDirRef.current = 1; return 10 }
        return next
      })
    }, 18)
    return () => clearInterval(id)
  }, [scanning])

  const goToAnalyzing = (path: string) => {
    if (!checkCooldown()) {
      // 冷却中：重新开始扫描
      takingPhotoRef.current = false
      setTimeout(() => {
        setCountdown(4)
        setScanY(10)
        scanDirRef.current = 1
        setScanning(true)
      }, 500)
      return
    }
    Taro.setStorageSync('lastAnalysisTime', Date.now())
    Taro.redirectTo({
      url: `/pages/analyzing/index?imagePath=${encodeURIComponent(path)}&scanSuccess=true`,
    })
  }

  // 降级方案：用原始的 chooseMedia 打开系统相机（原始代码的可靠做法）
  const openSystemCamera = () => {
    Taro.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      camera: 'front',
      success: (res) => {
        const path = res.tempFiles[0]?.tempFilePath
        if (path) goToAnalyzing(path)
      },
      fail: () => {
        // 用户取消或失败，重新开始扫描
        setTimeout(() => {
          setCountdown(4)
          setScanY(10)
          scanDirRef.current = 1
          setScanning(true)
        }, 800)
      },
    })
  }

  // 手动快门
  const doTakePhoto = () => {
    if (takingPhotoRef.current) return
    takingPhotoRef.current = true
    setScanning(false)
    try {
      const ctx = Taro.createCameraContext()
      ctx.takePhoto({
        quality: 'high',
        success: (res: any) => {
          takingPhotoRef.current = false
          goToAnalyzing(res.tempImagePath)
        },
        fail: () => {
          takingPhotoRef.current = false
          openSystemCamera()
        },
      })
    } catch {
      takingPhotoRef.current = false
      openSystemCamera()
    }
  }

  // 相册
  const pickFromAlbum = () => {
    setScanning(false)
    Taro.chooseMedia({
      count: 1, mediaType: ['image'], sourceType: ['camera', 'album'], camera: 'front',
      success: (res) => {
        const path = res.tempFiles[0]?.tempFilePath
        if (path) goToAnalyzing(path)
      },
      fail: (err) => {
        if (err.errMsg && !err.errMsg.includes('cancel')) {
          Taro.showToast({ title: '获取图片失败', icon: 'none' })
        }
        setTimeout(() => {
          setCountdown(4)
          setScanning(true)
        }, 800)
      },
    })
  }

  const toggleCamera = () => {
    setScanning(false)
    setCameraReady(false)
    setDevicePosition(prev => prev === 'front' ? 'back' : 'front')
  }

  // 扫描线坐标
  const scanTop  = ovalT + Math.round(ovalH * scanY / 100)
  const scanLeft = ovalL + Math.round(ovalW * 0.08)
  const scanW    = Math.round(ovalW * 0.84)

  return (
    <View style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#000', overflow: 'hidden' }}>

      {/* 全屏 Camera — onInitDone 确保就绪后才开始倒计时 */}
      {isWeapp && (
        <Camera
          devicePosition={devicePosition}
          flash={flashMode}
          mode="normal"
          onInitDone={() => setCameraReady(true)}
          onError={(e: any) => {
            console.error('camera error', JSON.stringify(e))
            // 相机初始化失败时直接降级
            setCameraReady(false)
            setScanning(false)
            openSystemCamera()
          }}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        />
      )}

      {/* CoverView 覆盖层 */}
      <CoverView style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>

        <CoverView onClick={() => Taro.navigateBack()}
          style={{ position: 'absolute', top: `${navY}px`, left: '16px', width: '40px', height: '40px', borderRadius: '20px', backgroundColor: 'rgba(0,0,0,0.6)', fontSize: '22px', color: 'white', textAlign: 'center', lineHeight: '40px' }}>‹</CoverView>

        <CoverView style={{ position: 'absolute', top: `${navY + 10}px`, left: `${Math.round(screenWidth / 2) - 40}px`, width: '80px', fontSize: '16px', fontWeight: '600', color: 'white', textAlign: 'center' }}>皮肤检测</CoverView>

        <CoverView onClick={() => setFlashMode(FLASH_NEXT[flashMode])}
          style={{ position: 'absolute', top: `${navY}px`, left: `${flashBtnLeft}px`, width: '54px', height: '40px', borderRadius: '20px', backgroundColor: 'rgba(0,0,0,0.6)', fontSize: '11px', color: flashMode !== 'off' ? '#fbbf24' : 'white', textAlign: 'center', lineHeight: '40px' }}>{FLASH_LABEL[flashMode]}</CoverView>

        {/* 椭圆引导框 */}
        <CoverView style={{
          position: 'absolute', top: `${ovalT}px`, left: `${ovalL}px`,
          width: `${ovalW}px`, height: `${ovalH}px`,
          borderRadius: `${Math.round(ovalW / 2)}px`,
          borderWidth: '3px', borderStyle: 'solid',
          borderColor: scanning ? '#4ade80' : 'rgba(255,255,255,0.7)',
          backgroundColor: 'transparent',
        }} />

        {/* 扫描线 */}
        {scanning && (
          <CoverView style={{ position: 'absolute', top: `${scanTop}px`, left: `${scanLeft}px`, width: `${scanW}px`, height: '2px', backgroundColor: '#4ade80', borderRadius: '1px' }} />
        )}

        {/* 提示文字 */}
        <CoverView style={{ position: 'absolute', top: `${ovalT + ovalH + 14}px`, left: 0, width: '100%', fontSize: '13px', color: scanning ? '#4ade80' : 'rgba(255,255,255,0.85)', textAlign: 'center' }}>
          {!cameraReady ? '相机准备中...' : scanning ? '正在识别，请保持面部不动' : '请将面部对准椭圆框'}
        </CoverView>

        {/* 相册 */}
        <CoverView onClick={pickFromAlbum}
          style={{ position: 'absolute', top: `${btnTop}px`, left: `${albumLeft}px`, width: '54px', height: '54px', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.18)', fontSize: '12px', color: 'white', textAlign: 'center', lineHeight: '54px' }}>相册</CoverView>

        {/* 手动快门 */}
        <CoverView onClick={doTakePhoto}
          style={{ position: 'absolute', top: `${btnTop - 9}px`, left: `${shutterLeft}px`, width: '72px', height: '72px', borderRadius: '36px', backgroundColor: 'rgba(255,255,255,0.95)' }}>
          <CoverView style={{ position: 'absolute', top: '6px', left: '6px', width: '60px', height: '60px', borderRadius: '30px', borderWidth: '2px', borderStyle: 'solid', borderColor: 'rgba(0,0,0,0.15)', backgroundColor: 'transparent' }} />
        </CoverView>

        {/* 翻转 */}
        <CoverView onClick={toggleCamera}
          style={{ position: 'absolute', top: `${btnTop}px`, left: `${flipLeft}px`, width: '54px', height: '54px', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.18)', fontSize: '12px', color: 'white', textAlign: 'center', lineHeight: '54px' }}>翻转</CoverView>

        {/* 冷却弹窗 */}
        {showCoolingModal && (
          <CoverView style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <CoverView style={{ position: 'absolute', top: `${Math.round(screenHeight * 0.3)}px`, left: '24px', width: `${screenWidth - 48}px`, backgroundColor: '#fff', borderRadius: '16px', padding: '24px' }}>
              <CoverView style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', textAlign: 'center', marginBottom: '8px' }}>检测冷却中</CoverView>
              <CoverView style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', marginBottom: '20px' }}>为确保检测准确性，请稍后再试</CoverView>
              <CoverView style={{ backgroundColor: '#eff6ff', borderRadius: '12px', padding: '16px', marginBottom: '20px', textAlign: 'center' }}>
                <CoverView style={{ fontSize: '36px', fontWeight: '700', color: '#1d4ed8' }}>
                  {String(cooldownDisplay.minutes).padStart(2, '0')}:{String(cooldownDisplay.seconds).padStart(2, '0')}
                </CoverView>
              </CoverView>
              <CoverView onClick={() => setShowCoolingModal(false)}
                style={{ backgroundColor: '#f3f4f6', borderRadius: '12px', height: '44px', textAlign: 'center', lineHeight: '44px', fontSize: '15px', color: '#374151' }}>知道了</CoverView>
            </CoverView>
          </CoverView>
        )}

      </CoverView>
    </View>
  )
}

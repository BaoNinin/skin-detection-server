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

  // 倒计时状态 — 用 React state + useEffect 驱动，不依赖 setInterval + ref 闭包
  const [scanning, setScanning] = useState(false)   // 扫描动画开关
  const [countdown, setCountdown] = useState(4)      // 4→3→2→1→0 触发拍照
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

  // NFC
  useEffect(() => {
    if (!isWeapp) return
    const handleNFC = (data: NFCData) => { if (data.action === 'analyze') pickFromAlbum() }
    startNFCDiscovery(handleNFC, console.error)
    return () => stopNFCDiscovery()
  }, [])

  // 进入页面 1s 后自动开始扫描
  useEffect(() => {
    const t = setTimeout(() => {
      setCountdown(4)
      setScanning(true)
    }, 1000)
    return () => clearTimeout(t)
  }, [])

  // 核心：useEffect 驱动倒计时 + 自动拍照（取代 setInterval + doTakePhotoRef）
  useEffect(() => {
    if (!scanning) return

    // 倒计时归零时静默拍照
    if (countdown <= 0) {
      setScanning(false)
      if (takingPhotoRef.current) return
      takingPhotoRef.current = true
      const ctx = Taro.createCameraContext()
      ctx.takePhoto({
        quality: 'high',
        success: (res: any) => {
          takingPhotoRef.current = false
          Taro.redirectTo({
            url: `/pages/analyzing/index?imagePath=${encodeURIComponent(res.tempFilePath)}&scanSuccess=true`,
          })
        },
        fail: (err: any) => {
          console.error('autoTakePhoto fail', JSON.stringify(err))
          takingPhotoRef.current = false
          // 拍照失败时静默重试
          setTimeout(() => {
            setCountdown(4)
            setScanning(true)
          }, 1500)
        },
      })
      return
    }

    // 每秒递减
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

  const startScan = () => {
    if (takingPhotoRef.current) return
    setCountdown(4)
    setScanY(10)
    scanDirRef.current = 1
    setScanning(true)
  }

  // 手动拍照按钮
  const doTakePhoto = () => {
    if (takingPhotoRef.current) return
    takingPhotoRef.current = true
    setScanning(false)
    const ctx = Taro.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res: any) => {
        takingPhotoRef.current = false
        Taro.redirectTo({
          url: `/pages/analyzing/index?imagePath=${encodeURIComponent(res.tempFilePath)}&scanSuccess=true`,
        })
      },
      fail: (err: any) => {
        console.error('manualTakePhoto fail', JSON.stringify(err))
        takingPhotoRef.current = false
        Taro.showToast({ title: '拍照失败，请重试', icon: 'none' })
        setTimeout(() => startScan(), 1200)
      },
    })
  }

  const pickFromAlbum = () => {
    setScanning(false)
    Taro.chooseMedia({
      count: 1, mediaType: ['image'], sourceType: ['camera', 'album'], camera: 'front',
      success: (res) => {
        const path = res.tempFiles[0]?.tempFilePath
        if (path) {
          Taro.redirectTo({
            url: `/pages/analyzing/index?imagePath=${encodeURIComponent(path)}&scanSuccess=true`,
          })
        }
      },
      fail: (err) => {
        if (err.errMsg && !err.errMsg.includes('cancel')) {
          Taro.showToast({ title: '获取图片失败', icon: 'none' })
        }
        setTimeout(() => startScan(), 800)
      },
    })
  }

  const toggleCamera = () => {
    setScanning(false)
    setDevicePosition(prev => prev === 'front' ? 'back' : 'front')
    setTimeout(() => startScan(), 900)
  }

  // 扫描线坐标
  const scanTop  = ovalT + Math.round(ovalH * scanY / 100)
  const scanLeft = ovalL + Math.round(ovalW * 0.08)
  const scanW    = Math.round(ovalW * 0.84)

  return (
    <View style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#000', overflow: 'hidden' }}>

      {/* 全屏 Camera */}
      {isWeapp && (
        <Camera
          devicePosition={devicePosition}
          flash={flashMode}
          mode="normal"
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

        {/* 扫描线（仅扫描中显示）*/}
        {scanning && (
          <CoverView style={{ position: 'absolute', top: `${scanTop}px`, left: `${scanLeft}px`, width: `${scanW}px`, height: '2px', backgroundColor: '#4ade80', borderRadius: '1px' }} />
        )}

        {/* 提示文字 */}
        <CoverView style={{ position: 'absolute', top: `${ovalT + ovalH + 14}px`, left: 0, width: '100%', fontSize: '13px', color: scanning ? '#4ade80' : 'rgba(255,255,255,0.85)', textAlign: 'center' }}>
          {scanning ? '正在识别，请保持面部不动' : '请将面部对准椭圆框'}
        </CoverView>

        {/* 相册按钮 */}
        <CoverView onClick={pickFromAlbum}
          style={{ position: 'absolute', top: `${btnTop}px`, left: `${albumLeft}px`, width: '54px', height: '54px', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.18)', fontSize: '12px', color: 'white', textAlign: 'center', lineHeight: '54px' }}>相册</CoverView>

        {/* 手动快门 */}
        <CoverView onClick={doTakePhoto}
          style={{ position: 'absolute', top: `${btnTop - 9}px`, left: `${shutterLeft}px`, width: '72px', height: '72px', borderRadius: '36px', backgroundColor: 'rgba(255,255,255,0.95)' }}>
          <CoverView style={{ position: 'absolute', top: '6px', left: '6px', width: '60px', height: '60px', borderRadius: '30px', borderWidth: '2px', borderStyle: 'solid', borderColor: 'rgba(0,0,0,0.15)', backgroundColor: 'transparent' }} />
        </CoverView>

        {/* 翻转按钮 */}
        <CoverView onClick={toggleCamera}
          style={{ position: 'absolute', top: `${btnTop}px`, left: `${flipLeft}px`, width: '54px', height: '54px', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.18)', fontSize: '12px', color: 'white', textAlign: 'center', lineHeight: '54px' }}>翻转</CoverView>

      </CoverView>
    </View>
  )
}

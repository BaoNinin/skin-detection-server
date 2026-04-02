import { View, Camera, CoverView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect, useRef } from 'react'
import { startNFCDiscovery, stopNFCDiscovery, NFCData } from '@/utils/nfc'
import { cameraState } from '@/utils/cameraState'

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

  const [countdown, setCountdown] = useState(5)
  const [countingDown, setCountingDown] = useState(false)
  const [scanY, setScanY] = useState(10)
  const scanDirRef = useRef(1)
  const takingPhotoRef = useRef(false)
  const cdTimerRef = useRef<any>(null)
  const cdValueRef = useRef(5)
  const doTakePhotoRef = useRef<() => void>(() => {})

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

  // 进入页面 1s 后自动开始倒计时
  useEffect(() => {
    const t = setTimeout(() => startCountdown(), 1000)
    return () => { clearTimeout(t); stopCountdown() }
  }, [])

  // 从预览页返回时重新开始倒计时
  useEffect(() => {
    const handler = () => {
      takingPhotoRef.current = false
      setTimeout(() => startCountdown(), 600)
    }
    // 监听页面显示事件（从预览页返回）
    Taro.eventCenter.on('cameraPageShow', handler)
    return () => Taro.eventCenter.off('cameraPageShow', handler)
  }, [])

  // 扫描线动画
  useEffect(() => {
    if (!countingDown) return
    const id = setInterval(() => {
      setScanY(prev => {
        const next = prev + scanDirRef.current * 2
        if (next >= 90) { scanDirRef.current = -1; return 90 }
        if (next <= 10) { scanDirRef.current = 1; return 10 }
        return next
      })
    }, 18)
    return () => clearInterval(id)
  }, [countingDown])

  const stopCountdown = () => {
    if (cdTimerRef.current) { clearInterval(cdTimerRef.current); cdTimerRef.current = null }
    setCountingDown(false)
  }

  const startCountdown = () => {
    if (takingPhotoRef.current) return
    if (cdTimerRef.current) clearInterval(cdTimerRef.current)
    cdValueRef.current = 5
    setCountdown(5)
    setScanY(10)
    scanDirRef.current = 1
    setCountingDown(true)
    cdTimerRef.current = setInterval(() => {
      cdValueRef.current -= 1
      setCountdown(cdValueRef.current)
      if (cdValueRef.current <= 0) {
        clearInterval(cdTimerRef.current)
        cdTimerRef.current = null
        doTakePhotoRef.current()
      }
    }, 1000)
  }

  // 把文件读成 base64 存入内存，完全不依赖跨页面文件路径
  const readFileToMemory = (filePath: string): Promise<string> => {
    return new Promise((resolve) => {
      try {
        const fs = Taro.getFileSystemManager()
        fs.readFile({
          filePath,
          encoding: 'base64',
          success: (res: any) => resolve(`data:image/jpeg;base64,${res.data}`),
          fail: () => resolve(filePath), // fallback: 直接用路径
        })
      } catch {
        resolve(filePath)
      }
    })
  }

  const goToPreview = (path: string) => {
    readFileToMemory(path).then((src) => {
      cameraState.previewImageSrc = src
      Taro.navigateTo({ url: '/pages/camera-preview/index' })
    })
  }

  const doTakePhoto = () => {
    if (takingPhotoRef.current) return
    takingPhotoRef.current = true
    stopCountdown()
    const ctx = Taro.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        takingPhotoRef.current = false
        goToPreview(res.tempFilePath)
      },
      fail: (err) => {
        console.error('takePhoto fail', JSON.stringify(err))
        takingPhotoRef.current = false
        Taro.showToast({ title: '拍照失败，请重试', icon: 'none' })
        setTimeout(() => startCountdown(), 1200)
      },
    })
  }
  doTakePhotoRef.current = doTakePhoto

  const pickFromAlbum = () => {
    stopCountdown()
    Taro.chooseMedia({
      count: 1, mediaType: ['image'], sourceType: ['camera', 'album'], camera: 'front',
      success: (res) => {
        const path = res.tempFiles[0]?.tempFilePath
        if (path) goToPreview(path)
      },
      fail: (err) => {
        if (err.errMsg && !err.errMsg.includes('cancel')) {
          Taro.showToast({ title: '获取图片失败', icon: 'none' })
        }
        setTimeout(() => startCountdown(), 800)
      },
    })
  }

  const toggleCamera = () => {
    stopCountdown()
    setDevicePosition(prev => prev === 'front' ? 'back' : 'front')
    setTimeout(() => startCountdown(), 900)
  }

  // 扫描线坐标
  const scanTop  = ovalT + Math.round(ovalH * scanY / 100)
  const scanLeft = ovalL + Math.round(ovalW * 0.08)
  const scanW    = Math.round(ovalW * 0.84)
  const badgeW   = 96
  const badgeLeft = Math.round((screenWidth - badgeW) / 2)
  const badgeTop  = ovalT + ovalH + 14

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
          borderColor: countingDown ? '#4ade80' : 'rgba(255,255,255,0.7)',
          backgroundColor: 'transparent',
        }} />

        {/* 扫描线 */}
        {countingDown && (
          <CoverView style={{ position: 'absolute', top: `${scanTop}px`, left: `${scanLeft}px`, width: `${scanW}px`, height: '2px', backgroundColor: '#4ade80', borderRadius: '1px' }} />
        )}

        {/* 倒计时徽章 */}
        {countingDown && countdown > 0 && (
          <CoverView style={{ position: 'absolute', top: `${badgeTop}px`, left: `${badgeLeft}px`, width: `${badgeW}px`, height: '36px', borderRadius: '18px', backgroundColor: '#4ade80', fontSize: '16px', fontWeight: '700', color: '#000', textAlign: 'center', lineHeight: '36px' }}>{countdown} 秒后拍照</CoverView>
        )}

        <CoverView style={{ position: 'absolute', top: `${badgeTop + 46}px`, left: 0, width: '100%', fontSize: '13px', color: countingDown ? '#4ade80' : 'rgba(255,255,255,0.85)', textAlign: 'center' }}>
          {countingDown ? '请保持面部不动' : '请将面部对准椭圆框'}
        </CoverView>

        <CoverView onClick={pickFromAlbum}
          style={{ position: 'absolute', top: `${btnTop}px`, left: `${albumLeft}px`, width: '54px', height: '54px', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.18)', fontSize: '12px', color: 'white', textAlign: 'center', lineHeight: '54px' }}>相册</CoverView>

        <CoverView onClick={doTakePhoto}
          style={{ position: 'absolute', top: `${btnTop - 9}px`, left: `${shutterLeft}px`, width: '72px', height: '72px', borderRadius: '36px', backgroundColor: 'rgba(255,255,255,0.95)' }}>
          <CoverView style={{ position: 'absolute', top: '6px', left: '6px', width: '60px', height: '60px', borderRadius: '30px', borderWidth: '2px', borderStyle: 'solid', borderColor: 'rgba(0,0,0,0.15)', backgroundColor: 'transparent' }} />
        </CoverView>

        <CoverView onClick={toggleCamera}
          style={{ position: 'absolute', top: `${btnTop}px`, left: `${flipLeft}px`, width: '54px', height: '54px', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.18)', fontSize: '12px', color: 'white', textAlign: 'center', lineHeight: '54px' }}>翻转</CoverView>

      </CoverView>
    </View>
  )
}

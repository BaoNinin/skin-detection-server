import { View, Text, Camera, Image, Button, CoverView } from '@tarojs/components'
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

  const [countdown, setCountdown] = useState(5)
  const [countingDown, setCountingDown] = useState(false)
  const [scanY, setScanY] = useState(10)
  const scanDirRef = useRef(1)
  const takingPhotoRef = useRef(false)
  const cdTimerRef = useRef<any>(null)       // 倒计时 interval ref
  const cdValueRef = useRef(5)               // 当前倒计时值 ref（不依赖 state）
  const doTakePhotoRef = useRef<() => void>(() => {})

  const [capturedPath, setCapturedPath] = useState('')
  const capturedPathRef = useRef('')
  const [showPreview, setShowPreview] = useState(false)
  const [previewReady, setPreviewReady] = useState(false) // 图片加载完毕标志

  const [showCooling, setShowCooling] = useState(false)
  const [cooldown, setCooldown] = useState({ minutes: 0, seconds: 0 })
  const coolingEndRef = useRef(0)

  // 椭圆框尺寸
  const ovalW = Math.round(screenWidth * 0.68)
  const ovalH = Math.round(ovalW * 1.28)
  const ovalL = Math.round((screenWidth - ovalW) / 2)
  const ovalT = Math.round(screenHeight * 0.12)

  const navY = statusBarHeight + 8
  const flashBtnLeft = screenWidth - 70

  // 底部按钮区 Y 坐标
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
    return () => clearTimeout(t)
  }, [])

  const startCountdown = () => {
    if (takingPhotoRef.current) return
    // 清除可能存在的旧计时器
    if (cdTimerRef.current) { clearInterval(cdTimerRef.current); cdTimerRef.current = null }
    cdValueRef.current = 5
    setCountdown(5)
    setScanY(10)
    scanDirRef.current = 1
    setCountingDown(true)
    // 用 ref 驱动倒计时，避免 useEffect 闭包问题
    cdTimerRef.current = setInterval(() => {
      cdValueRef.current -= 1
      setCountdown(cdValueRef.current)
      if (cdValueRef.current <= 0) {
        clearInterval(cdTimerRef.current)
        cdTimerRef.current = null
        // 直接通过 ref 调用最新版本的 doTakePhoto
        doTakePhotoRef.current()
      }
    }, 1000)
  }

  const stopCountdown = () => {
    if (cdTimerRef.current) { clearInterval(cdTimerRef.current); cdTimerRef.current = null }
    setCountingDown(false)
  }

  // 扫描线动画
  useEffect(() => {
    if (!countingDown) return
    const interval = setInterval(() => {
      setScanY(prev => {
        const next = prev + scanDirRef.current * 2
        if (next >= 90) { scanDirRef.current = -1; return 90 }
        if (next <= 10) { scanDirRef.current = 1;  return 10 }
        return next
      })
    }, 18)
    return () => clearInterval(interval)
  }, [countingDown])

  // 冷却倒计时
  useEffect(() => {
    if (!showCooling) return
    const interval = setInterval(() => {
      const s = Math.ceil((coolingEndRef.current - Date.now()) / 1000)
      if (s <= 0) { setShowCooling(false); return }
      setCooldown({ minutes: Math.floor(s / 60), seconds: s % 60 })
    }, 1000)
    return () => clearInterval(interval)
  }, [showCooling])

  const checkCooldown = (): boolean => {
    const last = Taro.getStorageSync('lastAnalysisTime')
    if (last) {
      const CD = 5 * 60 * 1000
      const elapsed = Date.now() - last
      if (elapsed < CD) {
        coolingEndRef.current = Date.now() + (CD - elapsed)
        const s = Math.ceil((CD - elapsed) / 1000)
        setCooldown({ minutes: Math.floor(s / 60), seconds: s % 60 })
        setShowCooling(true)
        return false
      }
    }
    return true
  }

  const doTakePhoto = () => {
    if (takingPhotoRef.current) return
    takingPhotoRef.current = true
    stopCountdown()
    const ctx = Taro.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        // 直接用 tempFilePath —— Camera 组件保持挂载（只是缩成 0x0），
        // 所以 tempFilePath 始终有效，不需要 copyFile
        takingPhotoRef.current = false
        capturedPathRef.current = res.tempFilePath
        setCapturedPath(res.tempFilePath)
        setPreviewReady(false)
        setShowPreview(true)
      },
      fail: (err) => {
        console.error('takePhoto fail:', JSON.stringify(err))
        takingPhotoRef.current = false
        Taro.showToast({ title: '拍照失败，请重试', icon: 'none' })
        setTimeout(() => startCountdown(), 1200)
      }
    })
  }
  // 保持 ref 始终指向最新版本
  doTakePhotoRef.current = doTakePhoto

  const resetAndRetry = () => {
    stopCountdown()
    setShowPreview(false)
    setPreviewReady(false)
    capturedPathRef.current = ''
    setCapturedPath('')
    takingPhotoRef.current = false
    setTimeout(() => startCountdown(), 800)
  }

  const pickFromAlbum = () => {
    stopCountdown()
    Taro.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera', 'album'],
      camera: 'front',
      success: (res) => {
        const path = res.tempFiles[0]?.tempFilePath
        if (path) {
          capturedPathRef.current = path
          setCapturedPath(path)
          setPreviewReady(false)
          setShowPreview(true)
        }
      },
      fail: (err) => {
        if (err.errMsg && !err.errMsg.includes('cancel')) {
          Taro.showToast({ title: '获取图片失败，请重试', icon: 'none' })
        }
        setTimeout(() => startCountdown(), 800)
      }
    })
  }

  const toggleCamera = () => {
    stopCountdown()
    setDevicePosition(prev => prev === 'front' ? 'back' : 'front')
    setTimeout(() => startCountdown(), 900)
  }

  const handleConfirm = () => {
    const path = capturedPathRef.current || capturedPath
    if (!path) {
      Taro.showToast({ title: '照片获取失败，请重新拍照', icon: 'none' })
      resetAndRetry()
      return
    }
    if (!checkCooldown()) return
    Taro.setStorageSync('lastAnalysisTime', Date.now())
    Taro.redirectTo({
      url: `/pages/analyzing/index?imagePath=${encodeURIComponent(path)}&scanSuccess=true`
    })
  }

  // 扫描线坐标
  const scanLineTop  = ovalT + Math.round(ovalH * scanY / 100)
  const scanLineLeft = ovalL + Math.round(ovalW * 0.08)
  const scanLineW    = Math.round(ovalW * 0.84)

  // 倒计时徽章（椭圆下方居中）
  const badgeW = 96
  const badgeLeft = Math.round((screenWidth - badgeW) / 2)
  const badgeTop = ovalT + ovalH + 14

  return (
    <View style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#000', overflow: 'hidden' }}>

      {/* Camera 永远挂载，showPreview 时缩成 0x0 保持 tempFilePath 有效 */}
      {isWeapp && (
        <Camera
          devicePosition={devicePosition}
          flash={flashMode}
          mode="normal"
          style={{
            position: 'absolute', top: 0, left: 0,
            width: showPreview ? '0px' : '100%',
            height: showPreview ? '0px' : '100%',
          }}
        />
      )}

      {/* ══ CoverView 覆盖层（仅 Camera 模式显示） ══ */}
      {!showPreview && (
        <CoverView style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>

          {/* 返回按钮 — 文字直接放在 CoverView 里，不用 Text 标签 */}
          <CoverView
            onClick={() => Taro.navigateBack()}
            style={{ position: 'absolute', top: `${navY}px`, left: '16px', width: '40px', height: '40px', borderRadius: '20px', backgroundColor: 'rgba(0,0,0,0.6)', fontSize: '22px', color: 'white', textAlign: 'center', lineHeight: '40px' }}
          >‹</CoverView>

          {/* 标题 */}
          <CoverView style={{ position: 'absolute', top: `${navY + 10}px`, left: `${Math.round(screenWidth / 2) - 40}px`, width: '80px', fontSize: '16px', fontWeight: '600', color: 'white', textAlign: 'center' }}>
            皮肤检测
          </CoverView>

          {/* 闪光灯 */}
          <CoverView
            onClick={() => setFlashMode(FLASH_NEXT[flashMode])}
            style={{ position: 'absolute', top: `${navY}px`, left: `${flashBtnLeft}px`, width: '54px', height: '40px', borderRadius: '20px', backgroundColor: 'rgba(0,0,0,0.6)', fontSize: '11px', color: flashMode !== 'off' ? '#fbbf24' : 'white', textAlign: 'center', lineHeight: '40px' }}
          >{FLASH_LABEL[flashMode]}</CoverView>

          {/* 椭圆引导框 */}
          <CoverView style={{
            position: 'absolute',
            top: `${ovalT}px`,
            left: `${ovalL}px`,
            width: `${ovalW}px`,
            height: `${ovalH}px`,
            borderRadius: `${Math.round(ovalW / 2)}px`,
            borderWidth: '3px',
            borderStyle: 'solid',
            borderColor: countingDown ? '#4ade80' : 'rgba(255,255,255,0.7)',
            backgroundColor: 'transparent',
          }} />

          {/* 扫描线 */}
          {countingDown && (
            <CoverView style={{
              position: 'absolute',
              top: `${scanLineTop}px`,
              left: `${scanLineLeft}px`,
              width: `${scanLineW}px`,
              height: '2px',
              backgroundColor: '#4ade80',
              borderRadius: '1px',
            }} />
          )}

          {/* 倒计时徽章 */}
          {countingDown && countdown > 0 && (
            <CoverView style={{
              position: 'absolute',
              top: `${badgeTop}px`,
              left: `${badgeLeft}px`,
              width: `${badgeW}px`,
              height: '36px',
              borderRadius: '18px',
              backgroundColor: '#4ade80',
              fontSize: '16px',
              fontWeight: '700',
              color: '#000',
              textAlign: 'center',
              lineHeight: '36px',
            }}>{countdown} 秒后拍照</CoverView>
          )}

          {/* 状态文字（倒计时徽章下方） */}
          <CoverView style={{
            position: 'absolute',
            top: `${badgeTop + 46}px`,
            left: 0,
            width: '100%',
            fontSize: '13px',
            color: countingDown ? '#4ade80' : 'rgba(255,255,255,0.85)',
            textAlign: 'center',
          }}>
            {countingDown ? '请保持面部不动' : '请将面部对准椭圆框'}
          </CoverView>

          {/* 相册 */}
          <CoverView
            onClick={pickFromAlbum}
            style={{ position: 'absolute', top: `${btnTop}px`, left: `${albumLeft}px`, width: '54px', height: '54px', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.18)', fontSize: '12px', color: 'white', textAlign: 'center', lineHeight: '54px' }}
          >相册</CoverView>

          {/* 快门（大白圆） */}
          <CoverView
            onClick={doTakePhoto}
            style={{ position: 'absolute', top: `${btnTop - 9}px`, left: `${shutterLeft}px`, width: '72px', height: '72px', borderRadius: '36px', backgroundColor: 'rgba(255,255,255,0.95)' }}
          >
            <CoverView style={{
              position: 'absolute',
              top: '6px', left: '6px',
              width: '60px', height: '60px',
              borderRadius: '30px',
              borderWidth: '2px',
              borderStyle: 'solid',
              borderColor: 'rgba(0,0,0,0.15)',
              backgroundColor: 'transparent',
            }} />
          </CoverView>

          {/* 翻转 */}
          <CoverView
            onClick={toggleCamera}
            style={{ position: 'absolute', top: `${btnTop}px`, left: `${flipLeft}px`, width: '54px', height: '54px', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.18)', fontSize: '12px', color: 'white', textAlign: 'center', lineHeight: '54px' }}
          >翻转</CoverView>

        </CoverView>
      )}

      {/* ══ 预览页（Camera 已卸载，普通 View，按钮完全可点）══ */}
      {showPreview && (
        <View style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#111', display: 'flex', flexDirection: 'column' }}>

          <View style={{ paddingTop: `${statusBarHeight + 8}px`, paddingBottom: '8px', paddingLeft: '16px', paddingRight: '16px', display: 'flex', alignItems: 'center' }}>
            <View
              onClick={resetAndRetry}
              style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}
            >
              <Text style={{ color: 'white', fontSize: '22px' }}>‹</Text>
            </View>
            <Text style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>确认照片</Text>
          </View>

          {/* 照片预览 */}
          <View style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Image
              src={capturedPathRef.current || capturedPath}
              mode="aspectFill"
              onLoad={() => setPreviewReady(true)}
              onError={() => Taro.showToast({ title: '图片加载失败', icon: 'none' })}
              style={{
                width: `${ovalW}px`,
                height: `${ovalH}px`,
                borderRadius: `${Math.round(ovalW / 2)}px`,
                display: 'block',
                opacity: previewReady ? 1 : 0,
              }}
            />
            {!previewReady && (
              <View style={{ position: 'absolute', width: `${ovalW}px`, height: `${ovalH}px`, borderRadius: `${Math.round(ovalW / 2)}px`, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>加载中...</Text>
              </View>
            )}
          </View>

          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', textAlign: 'center', display: 'block', padding: '0 32px 12px' }}>
            照片仅用于本次皮肤状态分析，分析完成后立即删除
          </Text>

          <View style={{ padding: '0 24px 48px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Button
              onClick={handleConfirm}
              style={{ background: 'white', color: '#1d4ed8', borderRadius: '50px', fontSize: '17px', fontWeight: '700', height: '52px', lineHeight: '52px', border: 'none', margin: 0 }}
            >
              开始分析
            </Button>
            <Button
              onClick={resetAndRetry}
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '50px', fontSize: '15px', height: '48px', lineHeight: '48px', border: 'none', margin: 0 }}
            >
              重新拍照
            </Button>
          </View>
        </View>
      )}

      {/* ══ 冷却弹窗 ══ */}
      {showCooling && (
        <View style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ background: 'white', borderRadius: '20px', padding: '28px 24px', width: '280px' }}>
            <Text style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', textAlign: 'center', display: 'block', marginBottom: '8px' }}>检测冷却中</Text>
            <Text style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', display: 'block', marginBottom: '16px' }}>为确保检测准确性，请稍后再试</Text>
            <View style={{ background: '#eff6ff', borderRadius: '12px', padding: '14px', marginBottom: '16px', textAlign: 'center' }}>
              <Text style={{ fontSize: '32px', fontWeight: '700', color: '#1d4ed8', display: 'block' }}>
                {String(cooldown.minutes).padStart(2, '0')}:{String(cooldown.seconds).padStart(2, '0')}
              </Text>
            </View>
            <Button
              onClick={() => setShowCooling(false)}
              style={{ background: '#f3f4f6', color: '#4b5563', borderRadius: '50px', fontSize: '15px', height: '48px', lineHeight: '48px', border: 'none', margin: 0 }}
            >
              知道了
            </Button>
          </View>
        </View>
      )}
    </View>
  )
}

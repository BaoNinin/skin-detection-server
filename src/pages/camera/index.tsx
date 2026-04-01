import { View, Text, Camera, Image, Button, CoverView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect, useRef } from 'react'
import { startNFCDiscovery, stopNFCDiscovery, NFCData } from '@/utils/nfc'

type FlashMode = 'off' | 'on' | 'torch'
const FLASH_NEXT: Record<FlashMode, FlashMode> = { off: 'on', on: 'torch', torch: 'off' }
const FLASH_ICON: Record<FlashMode, string> = { off: '⚡', on: '🔦', torch: '💡' }

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
  const countdownRef = useRef(false) // avoid stale closure

  const [capturedPath, setCapturedPath] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const [showCooling, setShowCooling] = useState(false)
  const [cooldown, setCooldown] = useState({ minutes: 0, seconds: 0 })
  const coolingEndRef = useRef(0)

  // 椭圆框尺寸（居中偏上）
  const ovalW = Math.round(screenWidth * 0.64)
  const ovalH = Math.round(ovalW * 1.3)
  const ovalL = Math.round((screenWidth - ovalW) / 2)
  const ovalT = Math.round(screenHeight * 0.13)

  // NFC
  useEffect(() => {
    if (!isWeapp) return
    const handleNFC = (data: NFCData) => { if (data.action === 'analyze') pickFromAlbum() }
    startNFCDiscovery(handleNFC, console.error)
    return () => stopNFCDiscovery()
  }, [])

  // 进入页面 1.2s 后自动开始倒计时
  useEffect(() => {
    const t = setTimeout(() => startCountdown(), 1200)
    return () => clearTimeout(t)
  }, [])

  const startCountdown = () => {
    setCountdown(5)
    setScanY(10)
    scanDirRef.current = 1
    setCountingDown(true)
    countdownRef.current = true
  }

  // 倒计时 ticker
  useEffect(() => {
    if (!countingDown) return
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); doTakePhoto(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [countingDown])

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
    const ctx = Taro.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        takingPhotoRef.current = false
        setCountingDown(false)
        countdownRef.current = false
        setCapturedPath(res.tempFilePath)
        setShowPreview(true)
      },
      fail: () => {
        takingPhotoRef.current = false
        Taro.showToast({ title: '拍照失败，请重试', icon: 'none' })
        setCountingDown(false)
        setTimeout(() => startCountdown(), 1200)
      }
    })
  }

  const resetAndRetry = () => {
    setShowPreview(false)
    setCapturedPath('')
    takingPhotoRef.current = false
    setTimeout(() => startCountdown(), 800)
  }

  const pickFromAlbum = () => {
    setCountingDown(false)
    countdownRef.current = false
    Taro.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera', 'album'],
      camera: 'front',
      success: (res) => {
        const path = res.tempFiles[0]?.tempFilePath
        if (path) { setCapturedPath(path); setShowPreview(true) }
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
    setCountingDown(false)
    setDevicePosition(prev => prev === 'front' ? 'back' : 'front')
    setTimeout(() => startCountdown(), 900)
  }

  const handleConfirm = () => {
    if (!capturedPath) {
      Taro.showToast({ title: '照片获取失败，请重新拍照', icon: 'none' })
      resetAndRetry()
      return
    }
    if (!checkCooldown()) return
    Taro.setStorageSync('lastAnalysisTime', Date.now())
    Taro.redirectTo({
      url: `/pages/analyzing/index?imagePath=${encodeURIComponent(capturedPath)}&scanSuccess=true`
    })
  }

  // 扫描线绝对坐标（在椭圆内）
  const scanLineTop  = ovalT + Math.round(ovalH * scanY / 100)
  const scanLineLeft = ovalL + Math.round(ovalW * 0.1)
  const scanLineW    = Math.round(ovalW * 0.8)

  // 倒计时圆心
  const cdCX = ovalL + Math.round(ovalW / 2) - 30
  const cdCY = ovalT + Math.round(ovalH / 2) - 30

  // 顶部按钮行 Y 轴
  const navY = statusBarHeight + 8

  return (
    <View style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#000', overflow: 'hidden' }}>

      {/* 全屏 Camera（原生组件） */}
      {isWeapp && !showPreview && (
        <Camera
          devicePosition={devicePosition}
          flash={flashMode}
          mode="normal"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        />
      )}

      {/* CoverView 覆盖层（叠在 Camera 上方） */}
      {!showPreview && (
        <CoverView style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>

          {/* 返回按钮 */}
          <CoverView
            onClick={() => Taro.navigateBack()}
            style={{ position: 'absolute', top: `${navY}px`, left: '16px', width: '40px', height: '40px', borderRadius: '20px', backgroundColor: 'rgba(0,0,0,0.55)' }}
          >
            <Text style={{ color: 'white', fontSize: '24px', lineHeight: '40px', textAlign: 'center', display: 'block' }}>‹</Text>
          </CoverView>

          {/* 标题 */}
          <CoverView style={{ position: 'absolute', top: `${navY + 8}px`, left: `${Math.round(screenWidth / 2) - 36}px`, width: '72px' }}>
            <Text style={{ color: 'white', fontSize: '16px', fontWeight: '600', textAlign: 'center', display: 'block' }}>皮肤检测</Text>
          </CoverView>

          {/* 闪光灯按钮 */}
          <CoverView
            onClick={() => setFlashMode(FLASH_NEXT[flashMode])}
            style={{ position: 'absolute', top: `${navY}px`, right: '16px', width: '40px', height: '40px', borderRadius: '20px', backgroundColor: 'rgba(0,0,0,0.55)' }}
          >
            <Text style={{ fontSize: '18px', lineHeight: '40px', textAlign: 'center', display: 'block' }}>{FLASH_ICON[flashMode]}</Text>
          </CoverView>

          {/* ── 椭圆面部引导框 ── */}
          <CoverView style={{
            position: 'absolute',
            top: `${ovalT}px`,
            left: `${ovalL}px`,
            width: `${ovalW}px`,
            height: `${ovalH}px`,
            borderRadius: '50%',
            border: `3px solid ${countingDown ? '#4ade80' : 'rgba(255,255,255,0.75)'}`,
            backgroundColor: 'transparent',
          }} />

          {/* 扫描线（倒计时时显示） */}
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

          {/* 倒计时数字（椭圆中心） */}
          {countingDown && countdown > 0 && (
            <CoverView style={{
              position: 'absolute',
              top: `${cdCY}px`,
              left: `${cdCX}px`,
              width: '60px',
              height: '60px',
              borderRadius: '30px',
              backgroundColor: 'rgba(0,0,0,0.6)',
            }}>
              <Text style={{ color: 'white', fontSize: '28px', fontWeight: 'bold', lineHeight: '60px', textAlign: 'center', display: 'block' }}>
                {countdown}
              </Text>
            </CoverView>
          )}

          {/* 状态文字（椭圆下方） */}
          <CoverView style={{ position: 'absolute', top: `${ovalT + ovalH + 20}px`, left: 0, right: 0 }}>
            <Text style={{ color: countingDown ? '#4ade80' : 'rgba(255,255,255,0.9)', fontSize: '15px', textAlign: 'center', display: 'block' }}>
              {countingDown ? `${countdown} 秒后自动拍照` : '请将面部移至框内'}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', textAlign: 'center', display: 'block', marginTop: '6px' }}>
              请保持面部自然，确保光线充足
            </Text>
          </CoverView>

          {/* 底部操作按钮 */}
          <CoverView
            onClick={pickFromAlbum}
            style={{ position: 'absolute', bottom: '48px', left: `${Math.round(screenWidth * 0.2) - 27}px`, width: '54px', height: '54px', borderRadius: '14px', backgroundColor: 'rgba(0,0,0,0.55)' }}
          >
            <Text style={{ fontSize: '26px', lineHeight: '54px', textAlign: 'center', display: 'block' }}>🖼️</Text>
          </CoverView>

          <CoverView
            onClick={toggleCamera}
            style={{ position: 'absolute', bottom: '48px', right: `${Math.round(screenWidth * 0.2) - 27}px`, width: '54px', height: '54px', borderRadius: '14px', backgroundColor: 'rgba(0,0,0,0.55)' }}
          >
            <Text style={{ fontSize: '26px', lineHeight: '54px', textAlign: 'center', display: 'block' }}>🔄</Text>
          </CoverView>

        </CoverView>
      )}

      {/* ══ 预览页（fixed 全屏，无原生组件，按钮正常可点）══════════ */}
      {showPreview && (
        <View style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: '#111', display: 'flex', flexDirection: 'column' }}>
          <View style={{ paddingTop: `${statusBarHeight + 8}px`, paddingBottom: '8px', paddingLeft: '16px', paddingRight: '16px', display: 'flex', alignItems: 'center' }}>
            <View
              onClick={resetAndRetry}
              style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}
            >
              <Text style={{ color: 'white', fontSize: '22px' }}>‹</Text>
            </View>
            <Text style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>确认照片</Text>
          </View>

          <View style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
            {capturedPath ? (
              <View style={{ borderRadius: '16px', overflow: 'hidden', border: '3px solid rgba(255,255,255,0.15)', width: `${Math.round(screenWidth * 0.78)}px`, height: `${Math.round(screenWidth * 0.78 * 1.3)}px` }}>
                <Image
                  src={capturedPath}
                  mode="aspectFill"
                  style={{ width: `${Math.round(screenWidth * 0.78)}px`, height: `${Math.round(screenWidth * 0.78 * 1.3)}px`, display: 'block' }}
                />
              </View>
            ) : (
              <View style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '16px', width: `${Math.round(screenWidth * 0.78)}px`, height: `${Math.round(screenWidth * 0.78 * 1.3)}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>照片加载中...</Text>
              </View>
            )}
          </View>

          <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', textAlign: 'center', display: 'block', padding: '0 32px 12px' }}>
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

      {/* ══ 冷却弹窗 ══════════════════════════════════════════════════ */}
      {showCooling && (
        <View style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ background: 'white', borderRadius: '20px', padding: '28px 24px', width: '280px' }}>
            <Text style={{ fontSize: '32px', textAlign: 'center', display: 'block', marginBottom: '12px' }}>⏱️</Text>
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

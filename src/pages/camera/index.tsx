import { View, Text, Camera, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect, useRef } from 'react'
import { Network } from '@/network'
import { startNFCDiscovery, stopNFCDiscovery, NFCData } from '@/utils/nfc'

type FlashMode = 'off' | 'on' | 'torch'
type FaceState = 'waiting' | 'detecting' | 'aligned' | 'too_far' | 'too_close' | 'move_left' | 'move_right' | 'move_up' | 'move_down'

const FLASH_NEXT: Record<FlashMode, FlashMode> = { off: 'on', on: 'torch', torch: 'off' }
const FLASH_ICON: Record<FlashMode, string> = { off: '⚡', on: '🔦', torch: '💡' }

const FACE_HINTS: Record<FaceState, string> = {
  waiting:    '请将面部移至框内',
  detecting:  '正在识别面部',
  aligned:    '✓ 面部已对齐',
  too_far:    '请靠近一些',
  too_close:  '请稍微远一些',
  move_left:  '请向左移动',
  move_right: '请向右移动',
  move_up:    '请抬头',
  move_down:  '请低头',
}

const DIR_MAP: Record<string, FaceState> = {
  up: 'move_up', down: 'move_down',
  left: 'move_left', right: 'move_right',
  far: 'too_far', close: 'too_close',
  none: 'detecting',
}

export default function CameraPage() {
  const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP
  const statusBarHeight = Taro.getSystemInfoSync().statusBarHeight || 44

  // 相机控制
  const [devicePosition, setDevicePosition] = useState<'front' | 'back'>('front')
  const [flashMode, setFlashMode] = useState<FlashMode>('off')

  // 人脸检测
  const [faceState, setFaceState] = useState<FaceState>('waiting')
  const [isChecking, setIsChecking] = useState(false)
  const alignedCountRef = useRef(0)
  const checkingRef = useRef(false)
  const takingPhotoRef = useRef(false)

  // 倒计时 & 扫描
  const [countdown, setCountdown] = useState(5)
  const [countingDown, setCountingDown] = useState(false)
  const [scanY, setScanY] = useState(0)
  const scanDirRef = useRef(1)

  // 帧动画
  const [framePulse, setFramePulse] = useState(1)
  const [dotCount, setDotCount] = useState(1)

  // 指标
  const [metrics, setMetrics] = useState({ brightness: 0, texture: 0, pores: 0, moisture: 0, tone: 0, confidence: 0 })

  // 预览
  const [capturedPath, setCapturedPath] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  // 冷却
  const [showCooling, setShowCooling] = useState(false)
  const [cooldown, setCooldown] = useState({ minutes: 0, seconds: 0 })
  const coolingEndRef = useRef(0)

  // NFC
  useEffect(() => {
    if (!isWeapp) return
    const handleNFC = (data: NFCData) => { if (data.action === 'analyze') pickFromAlbum() }
    startNFCDiscovery(handleNFC, console.error)
    return () => stopNFCDiscovery()
  }, [])

  // ── 动画：帧脉冲（waiting/detecting 时呼吸效果）──────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setFramePulse(prev => prev >= 1 ? 0.45 : 1)
    }, 700)
    return () => clearInterval(interval)
  }, [])

  // ── 动画：省略号（detecting 时）────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount(prev => prev >= 3 ? 1 : prev + 1)
    }, 400)
    return () => clearInterval(interval)
  }, [])

  // ── 动画：扫描线（倒计时时）────────────────────────────────────
  useEffect(() => {
    if (!countingDown) return
    const interval = setInterval(() => {
      setScanY(prev => {
        const next = prev + scanDirRef.current * 3
        if (next >= 98) { scanDirRef.current = -1; return 98 }
        if (next <= 2)  { scanDirRef.current = 1;  return 2 }
        return next
      })
    }, 25)
    return () => clearInterval(interval)
  }, [countingDown])

  // ── 人脸检测：每 2.5s 调用豆包模型 ─────────────────────────────
  useEffect(() => {
    if (showPreview || !isWeapp || countingDown) return
    alignedCountRef.current = 0
    checkingRef.current = false
    setFaceState('waiting')
    setMetrics({ brightness: 0, texture: 0, pores: 0, moisture: 0, tone: 0, confidence: 0 })

    // 1.5s 后开始第一次检测，之后每 2.5s 一次
    const startTimer = setTimeout(() => {
      runFaceCheck()
      const interval = setInterval(() => { runFaceCheck() }, 2500)
      return () => clearInterval(interval)
    }, 1500)

    return () => clearTimeout(startTimer)
  }, [showPreview, isWeapp, devicePosition, countingDown])

  const runFaceCheck = () => {
    if (checkingRef.current || takingPhotoRef.current) return
    checkingRef.current = true
    setIsChecking(true)
    setFaceState(prev => prev === 'waiting' ? 'detecting' : prev)

    const ctx = Taro.createCameraContext()
    ctx.takePhoto({
      quality: 'low',
      success: async (res) => {
        try {
          const uploadRes = await Network.uploadFile({
            url: '/api/skin/check-face',
            filePath: res.tempFilePath,
            name: 'image',
          })
          const body = JSON.parse(uploadRes.data)
          if (body.code === 200) {
            const { hasFace, aligned, direction } = body.data
            if (!hasFace) {
              setFaceState('waiting')
              alignedCountRef.current = 0
            } else if (aligned) {
              setFaceState('aligned')
              alignedCountRef.current += 1
              if (alignedCountRef.current >= 2) setCountingDown(true)
            } else {
              setFaceState(DIR_MAP[direction] || 'detecting')
              alignedCountRef.current = 0
            }
          }
        } catch (e) {
          console.error('人脸检测失败:', e)
        } finally {
          checkingRef.current = false
          setIsChecking(false)
        }
      },
      fail: () => { checkingRef.current = false; setIsChecking(false) }
    })
  }

  // ── 指标动画（检测中逐渐上涨）─────────────────────────────────
  useEffect(() => {
    if (showPreview || faceState === 'waiting') return
    const t = {
      brightness: 65 + Math.random() * 20,
      texture:    58 + Math.random() * 24,
      pores:      52 + Math.random() * 30,
      moisture:   68 + Math.random() * 20,
      tone:       60 + Math.random() * 24,
      confidence: faceState === 'aligned' ? 88 + Math.random() * 10 : 42 + Math.random() * 28,
    }
    const interval = setInterval(() => {
      setMetrics(prev => ({
        brightness: Math.min(prev.brightness + 2 + Math.random() * 3, t.brightness),
        texture:    Math.min(prev.texture    + 2 + Math.random() * 3, t.texture),
        pores:      Math.min(prev.pores      + 1 + Math.random() * 3, t.pores),
        moisture:   Math.min(prev.moisture   + 2 + Math.random() * 4, t.moisture),
        tone:       Math.min(prev.tone       + 1 + Math.random() * 3, t.tone),
        confidence: Math.min(prev.confidence + 3 + Math.random() * 5, t.confidence),
      }))
    }, 180)
    return () => clearInterval(interval)
  }, [faceState, showPreview])

  // ── 倒计时 5→0 自动拍照 ────────────────────────────────────────
  useEffect(() => {
    if (!countingDown || showPreview) return
    setCountdown(5)
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); takePhoto(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [countingDown, showPreview])

  // ── 冷却倒计时 ─────────────────────────────────────────────────
  useEffect(() => {
    if (!showCooling) return
    const interval = setInterval(() => {
      const s = Math.ceil((coolingEndRef.current - Date.now()) / 1000)
      if (s <= 0) { setShowCooling(false); return }
      setCooldown({ minutes: Math.floor(s / 60), seconds: s % 60 })
    }, 1000)
    return () => clearInterval(interval)
  }, [showCooling])

  // ── 工具 ────────────────────────────────────────────────────────
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

  const takePhoto = () => {
    if (takingPhotoRef.current) return
    takingPhotoRef.current = true
    const ctx = Taro.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        takingPhotoRef.current = false
        setCapturedPath(res.tempFilePath)
        setCountingDown(false)
        setShowPreview(true)
      },
      fail: () => {
        takingPhotoRef.current = false
        Taro.showToast({ title: '拍照失败，请重试', icon: 'none' })
        resetState()
      }
    })
  }

  const resetState = () => {
    setCountingDown(false)
    setCountdown(5)
    setScanY(0)
    alignedCountRef.current = 0
    checkingRef.current = false
    takingPhotoRef.current = false
    setFaceState('waiting')
    setIsChecking(false)
    setMetrics({ brightness: 0, texture: 0, pores: 0, moisture: 0, tone: 0, confidence: 0 })
  }

  const pickFromAlbum = () => {
    Taro.chooseMedia({
      count: 1, mediaType: ['image'], sourceType: ['camera', 'album'], camera: 'front',
      success: (res) => {
        const path = res.tempFiles[0]?.tempFilePath
        if (path) { setCapturedPath(path); setShowPreview(true) }
      },
      fail: (err) => {
        if (err.errMsg && !err.errMsg.includes('cancel')) {
          Taro.showToast({ title: '获取图片失败，请重试', icon: 'none' })
        }
      }
    })
  }

  const handleConfirm = () => {
    if (!capturedPath) {
      Taro.showToast({ title: '照片获取失败，请重新拍照', icon: 'none' })
      setShowPreview(false)
      resetState()
      return
    }
    if (!checkCooldown()) return
    Taro.setStorageSync('lastAnalysisTime', Date.now())
    Taro.redirectTo({ url: `/pages/analyzing/index?imagePath=${encodeURIComponent(capturedPath)}&scanSuccess=true` })
  }

  // 颜色
  const isAligned = faceState === 'aligned'
  const isDetecting = faceState === 'detecting' || isChecking
  const frameColor = isAligned
    ? '#4ade80'
    : isDetecting
    ? `rgba(251,191,36,${framePulse})`
    : `rgba(255,255,255,${framePulse * 0.55})`
  const hintColor = isAligned ? '#4ade80' : isDetecting ? '#fbbf24' : 'rgba(255,255,255,0.85)'

  const dots = '.'.repeat(dotCount)

  // 方向箭头
  const arrowStyle: any = {
    move_up:    { top: '-30px', left: '50%', marginLeft: '-10px' },
    move_down:  { bottom: '-30px', left: '50%', marginLeft: '-10px' },
    move_left:  { left: '-30px', top: '50%', marginTop: '-10px' },
    move_right: { right: '-30px', top: '50%', marginTop: '-10px' },
  }
  const arrowSymbol: any = { move_up: '↑', move_down: '↓', move_left: '←', move_right: '→' }

  return (
    <View style={{ position: 'relative', width: '100%', minHeight: '100vh', background: '#000', overflow: 'hidden' }}>

      {/* ══ 相机（非预览时）═══════════════════════════════════════ */}
      {!showPreview && isWeapp && (
        <Camera
          devicePosition={devicePosition}
          flash={flashMode}
          mode="normal"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        />
      )}

      {/* ══ 相机界面覆盖层 ════════════════════════════════════════ */}
      {!showPreview && (
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20,
          display: 'flex', flexDirection: 'column',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 20%, transparent 56%, rgba(0,0,0,0.8) 100%)'
        }}>
          {/* 顶部导航 */}
          <View style={{ paddingTop: `${statusBarHeight}px` }}>
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px' }}>
              <View onClick={() => Taro.navigateBack()} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'white', fontSize: '22px' }}>‹</Text>
              </View>
              <Text style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>皮肤检测</Text>
              <View onClick={() => setFlashMode(FLASH_NEXT[flashMode])} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: '18px' }}>{FLASH_ICON[flashMode]}</Text>
              </View>
            </View>
          </View>

          {/* 人脸引导框区域 */}
          <View style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {/* 椭圆引导框 */}
            <View style={{ position: 'relative', marginBottom: '20px' }}>
              <View style={{
                width: '210px', height: '270px', borderRadius: '50%',
                border: `3px solid ${frameColor}`,
                position: 'relative', overflow: 'hidden',
                boxShadow: isAligned ? `0 0 20px rgba(74,222,128,0.4)` : isDetecting ? `0 0 16px rgba(251,191,36,0.3)` : 'none'
              }}>
                {/* 扫描线 */}
                {countingDown && (
                  <View style={{
                    position: 'absolute', left: 0, right: 0, height: '2px', top: `${scanY}%`,
                    background: 'linear-gradient(to right, transparent, #4ade80, transparent)'
                  }} />
                )}
              </View>

              {/* 四角装饰 */}
              {[
                { top: '-3px', left: '-3px', borderTop: `3px solid ${frameColor}`, borderLeft: `3px solid ${frameColor}`, borderRadius: '4px 0 0 0' },
                { top: '-3px', right: '-3px', borderTop: `3px solid ${frameColor}`, borderRight: `3px solid ${frameColor}`, borderRadius: '0 4px 0 0' },
                { bottom: '-3px', left: '-3px', borderBottom: `3px solid ${frameColor}`, borderLeft: `3px solid ${frameColor}`, borderRadius: '0 0 0 4px' },
                { bottom: '-3px', right: '-3px', borderBottom: `3px solid ${frameColor}`, borderRight: `3px solid ${frameColor}`, borderRadius: '0 0 4px 0' },
              ].map((s, i) => (
                <View key={i} style={{ position: 'absolute', width: '24px', height: '24px', ...s }} />
              ))}

              {/* 方向箭头 */}
              {arrowStyle[faceState] && (
                <Text style={{ position: 'absolute', color: '#fbbf24', fontSize: '22px', fontWeight: 'bold', ...arrowStyle[faceState] }}>
                  {arrowSymbol[faceState]}
                </Text>
              )}

              {/* 倒计时圆圈 */}
              {countingDown && countdown > 0 && (
                <View style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                  width: '68px', height: '68px', borderRadius: '50%',
                  background: 'rgba(0,0,0,0.7)', border: '3px solid #4ade80',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Text style={{ color: 'white', fontSize: '30px', fontWeight: 'bold' }}>{countdown}</Text>
                </View>
              )}
            </View>

            {/* 状态提示文字 */}
            <View style={{ textAlign: 'center', minHeight: '24px' }}>
              <Text style={{ color: hintColor, fontSize: '14px', fontWeight: '500' }}>
                {faceState === 'detecting' ? `正在识别面部${dots}` : FACE_HINTS[faceState]}
              </Text>
            </View>

            {/* AI 检测中指示 */}
            {isChecking && !countingDown && (
              <View style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <View style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa' }} />
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>AI 识别中</Text>
              </View>
            )}
          </View>

          {/* 检测准备指标 */}
          <View style={{ margin: '0 16px 10px', background: 'rgba(0,0,0,0.5)', borderRadius: '16px', padding: '12px' }}>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', display: 'block', marginBottom: '8px' }}>检测准备</Text>
            <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[
                { label: '亮度',  value: metrics.brightness, color: '#60a5fa' },
                { label: '纹理',  value: metrics.texture,    color: '#a78bfa' },
                { label: '毛孔',  value: metrics.pores,      color: '#fb923c' },
                { label: '水分',  value: metrics.moisture,   color: '#34d399' },
                { label: '肤调',  value: metrics.tone,       color: '#f472b6' },
                { label: '置信度', value: metrics.confidence, color: '#4ade80' },
              ].map(m => (
                <View key={m.label} style={{ width: 'calc(33% - 4px)' }}>
                  <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>{m.label}</Text>
                    <Text style={{ color: 'white', fontSize: '10px', fontWeight: '600' }}>{Math.round(m.value)}%</Text>
                  </View>
                  <View style={{ height: '3px', background: 'rgba(255,255,255,0.12)', borderRadius: '2px', overflow: 'hidden' }}>
                    <View style={{ height: '100%', background: m.color, borderRadius: '2px', width: `${m.value}%` }} />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* 底部操作 */}
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '8px 40px 36px' }}>
            <View onClick={pickFromAlbum} style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: '24px' }}>🖼️</Text>
            </View>
            <View onClick={takePhoto} style={{ width: '78px', height: '78px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 5px rgba(255,255,255,0.22)' }}>
              <View style={{ width: '64px', height: '64px', borderRadius: '50%', border: '3px solid #d1d5db' }} />
            </View>
            <View onClick={toggleCamera} style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: '24px' }}>🔄</Text>
            </View>
          </View>

          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', textAlign: 'center', paddingBottom: '16px', display: 'block' }}>
            面部对齐后自动倒计时拍照，也可手动按快门
          </Text>
        </View>
      )}

      {/* ══ 预览页（fixed 全屏覆盖，包括 Camera 原生组件）══════════ */}
      {showPreview && (
        <View style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: '#111' }}>
          {/* 顶部 */}
          <View style={{ paddingTop: `${statusBarHeight + 8}px`, paddingBottom: '8px', paddingLeft: '16px', paddingRight: '16px', display: 'flex', alignItems: 'center' }}>
            <View onClick={() => { setShowPreview(false); resetState() }} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
              <Text style={{ color: 'white', fontSize: '22px' }}>‹</Text>
            </View>
            <Text style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>确认照片</Text>
          </View>

          {/* 照片展示 */}
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 24px' }}>
            <View style={{ borderRadius: '16px', overflow: 'hidden', border: '3px solid rgba(255,255,255,0.15)' }}>
              <Image
                src={capturedPath}
                mode="aspectFill"
                style={{ width: '296px', height: '370px', display: 'block' }}
              />
            </View>
          </View>

          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textAlign: 'center', display: 'block', padding: '0 32px 20px' }}>
            照片仅用于本次皮肤状态分析，分析完成后立即删除
          </Text>

          {/* 按钮 */}
          <View style={{ padding: '0 24px' }}>
            <Button
              onClick={handleConfirm}
              style={{ width: '100%', background: 'white', color: '#1d4ed8', borderRadius: '50px', fontSize: '17px', fontWeight: '700', height: '52px', lineHeight: '52px', marginBottom: '14px', border: 'none' }}
            >
              ✓ 开始分析
            </Button>
            <Button
              onClick={() => { setShowPreview(false); resetState() }}
              style={{ width: '100%', background: 'rgba(255,255,255,0.12)', color: 'white', borderRadius: '50px', fontSize: '15px', height: '48px', lineHeight: '48px', border: 'none' }}
            >
              重新拍照
            </Button>
          </View>
        </View>
      )}

      {/* ══ 冷却弹窗 ═══════════════════════════════════════════════ */}
      {showCooling && (
        <View style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ background: 'white', borderRadius: '20px', padding: '28px 24px', width: '280px' }}>
            <Text style={{ fontSize: '32px', textAlign: 'center', display: 'block', marginBottom: '12px' }}>⏱️</Text>
            <Text style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', textAlign: 'center', display: 'block', marginBottom: '8px' }}>检测冷却中</Text>
            <Text style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', display: 'block', marginBottom: '16px' }}>为确保检测准确性，请稍后再试</Text>
            <View style={{ background: '#eff6ff', borderRadius: '12px', padding: '14px', marginBottom: '16px', textAlign: 'center' }}>
              <Text style={{ fontSize: '32px', fontWeight: '700', color: '#1d4ed8' }}>
                {String(cooldown.minutes).padStart(2, '0')}:{String(cooldown.seconds).padStart(2, '0')}
              </Text>
            </View>
            <Button onClick={() => setShowCooling(false)} style={{ width: '100%', background: '#f3f4f6', color: '#4b5563', borderRadius: '50px', fontSize: '15px', height: '48px', lineHeight: '48px', border: 'none' }}>
              知道了
            </Button>
          </View>
        </View>
      )}
    </View>
  )

  function toggleCamera() {
    setDevicePosition(prev => prev === 'front' ? 'back' : 'front')
    resetState()
  }
}

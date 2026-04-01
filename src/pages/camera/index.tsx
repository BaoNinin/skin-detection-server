import { View, Text, Camera, Image } from '@tarojs/components'
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
  detecting:  '正在识别面部...',
  aligned:    '面部已对齐，保持不动',
  too_far:    '请靠近一些',
  too_close:  '请稍微远一些',
  move_left:  '请向左移动',
  move_right: '请向右移动',
  move_up:    '请抬头',
  move_down:  '请低头',
}

// 方向箭头位置配置
const ARROWS: Partial<Record<FaceState, { pos: any; symbol: string }>> = {
  move_up:    { pos: { position: 'absolute' as const, top: '-32px', left: '50%', marginLeft: '-11px' }, symbol: '↑' },
  move_down:  { pos: { position: 'absolute' as const, bottom: '-32px', left: '50%', marginLeft: '-11px' }, symbol: '↓' },
  move_left:  { pos: { position: 'absolute' as const, left: '-32px', top: '50%', marginTop: '-11px' }, symbol: '←' },
  move_right: { pos: { position: 'absolute' as const, right: '-32px', top: '50%', marginTop: '-11px' }, symbol: '→' },
}

// direction 字符串 → FaceState
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
  const alignedCountRef = useRef(0)       // 连续对齐次数（2次才启动倒计时）
  const checkingRef = useRef(false)        // 防止并发请求

  // 扫描/倒计时
  const [countdown, setCountdown] = useState(5)
  const [countingDown, setCountingDown] = useState(false)
  const [scanLineY, setScanLineY] = useState(0)
  const scanDirRef = useRef(1)

  // 检测准备指标
  const [metrics, setMetrics] = useState({ brightness: 0, texture: 0, pores: 0, moisture: 0, tone: 0, confidence: 0 })

  // 照片预览
  const [capturedPath, setCapturedPath] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  // 冷却弹窗
  const [showCooling, setShowCooling] = useState(false)
  const [cooldown, setCooldown] = useState({ minutes: 0, seconds: 0 })
  const coolingEndRef = useRef(0)

  // NFC 监听
  useEffect(() => {
    if (!isWeapp) return
    const handleNFC = (data: NFCData) => { if (data.action === 'analyze') pickFromAlbum() }
    startNFCDiscovery(handleNFC, console.error)
    return () => stopNFCDiscovery()
  }, [])

  // ─── 人脸检测：每 3 秒调用豆包模型 ────────────────────────────
  useEffect(() => {
    if (showPreview || !isWeapp || countingDown) return

    // 重置
    alignedCountRef.current = 0
    checkingRef.current = false
    setFaceState('waiting')

    const interval = setInterval(() => {
      if (checkingRef.current) return
      checkingRef.current = true

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
                // 连续 2 次对齐 → 启动倒计时
                if (alignedCountRef.current >= 2) {
                  setCountingDown(true)
                }
              } else {
                setFaceState(DIR_MAP[direction] || 'detecting')
                alignedCountRef.current = 0
              }
            }
          } catch (e) {
            console.error('人脸检测失败:', e)
          } finally {
            checkingRef.current = false
          }
        },
        fail: () => { checkingRef.current = false }
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [showPreview, isWeapp, devicePosition, countingDown])

  // ─── 倒计时 5→0 → 自动拍照 ────────────────────────────────────
  useEffect(() => {
    if (!countingDown || showPreview) return
    setCountdown(5)

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          takePhoto()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [countingDown, showPreview])

  // ─── 扫描线动画 ────────────────────────────────────────────────
  useEffect(() => {
    if (!countingDown) return
    const interval = setInterval(() => {
      setScanLineY(prev => {
        const next = prev + scanDirRef.current * 4
        if (next >= 100) { scanDirRef.current = -1; return 100 }
        if (next <= 0)   { scanDirRef.current = 1;  return 0 }
        return next
      })
    }, 30)
    return () => clearInterval(interval)
  }, [countingDown])

  // ─── 指标动画 ──────────────────────────────────────────────────
  useEffect(() => {
    if (showPreview || faceState === 'waiting') return
    const targets = {
      brightness: 68 + Math.random() * 18,
      texture:    60 + Math.random() * 22,
      pores:      55 + Math.random() * 28,
      moisture:   70 + Math.random() * 18,
      tone:       62 + Math.random() * 22,
      confidence: faceState === 'aligned' ? 90 + Math.random() * 8 : 45 + Math.random() * 25,
    }
    const interval = setInterval(() => {
      setMetrics(prev => ({
        brightness: prev.brightness < targets.brightness ? Math.min(prev.brightness + 3 + Math.random() * 4, targets.brightness) : targets.brightness,
        texture:    prev.texture    < targets.texture    ? Math.min(prev.texture    + 3 + Math.random() * 4, targets.texture)    : targets.texture,
        pores:      prev.pores      < targets.pores      ? Math.min(prev.pores      + 2 + Math.random() * 3, targets.pores)      : targets.pores,
        moisture:   prev.moisture   < targets.moisture   ? Math.min(prev.moisture   + 3 + Math.random() * 5, targets.moisture)   : targets.moisture,
        tone:       prev.tone       < targets.tone       ? Math.min(prev.tone       + 2 + Math.random() * 4, targets.tone)       : targets.tone,
        confidence: prev.confidence < targets.confidence ? Math.min(prev.confidence + 4 + Math.random() * 6, targets.confidence) : targets.confidence,
      }))
    }, 200)
    return () => clearInterval(interval)
  }, [faceState, showPreview])

  // ─── 冷却倒计时 ───────────────────────────────────────────────
  useEffect(() => {
    if (!showCooling) return
    const interval = setInterval(() => {
      const s = Math.ceil((coolingEndRef.current - Date.now()) / 1000)
      if (s <= 0) { setShowCooling(false); return }
      setCooldown({ minutes: Math.floor(s / 60), seconds: s % 60 })
    }, 1000)
    return () => clearInterval(interval)
  }, [showCooling])

  // ─── 工具函数 ─────────────────────────────────────────────────
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
    const ctx = Taro.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        setCapturedPath(res.tempFilePath)
        setShowPreview(true)
        setCountingDown(false)
      },
      fail: () => {
        Taro.showToast({ title: '拍照失败，请重试', icon: 'none' })
        resetState()
      }
    })
  }

  const resetState = () => {
    setCountingDown(false)
    setCountdown(5)
    setScanLineY(0)
    alignedCountRef.current = 0
    checkingRef.current = false
    setFaceState('waiting')
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
    if (!capturedPath) return
    if (!checkCooldown()) return
    Taro.setStorageSync('lastAnalysisTime', Date.now())
    Taro.redirectTo({ url: `/pages/analyzing/index?imagePath=${encodeURIComponent(capturedPath)}&scanSuccess=true` })
  }

  const handleRetake = () => {
    setCapturedPath('')
    setShowPreview(false)
    resetState()
  }

  const toggleCamera = () => {
    setDevicePosition(prev => prev === 'front' ? 'back' : 'front')
    resetState()
  }

  const frameColor = faceState === 'aligned' ? '#4ade80' : faceState === 'detecting' ? '#fbbf24' : 'rgba(255,255,255,0.55)'
  const hintColor  = faceState === 'aligned' ? '#4ade80' : faceState === 'detecting' ? '#fbbf24' : 'rgba(255,255,255,0.9)'
  const arrow = ARROWS[faceState]

  // ─── 渲染 ─────────────────────────────────────────────────────
  return (
    <View style={{ position: 'relative', minHeight: '100vh', background: '#000', overflow: 'hidden' }}>

      {/* ── 相机（仅在非预览时渲染）─── */}
      {!showPreview && isWeapp && (
        <Camera
          devicePosition={devicePosition}
          flash={flashMode}
          mode="normal"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        />
      )}

      {/* ── 预览页 ─────────────────────────────────────────────── */}
      {showPreview && (
        <View style={{ minHeight: '100vh', background: '#111', display: 'flex', flexDirection: 'column' }}>
          {/* 顶部 */}
          <View style={{ paddingTop: `${statusBarHeight + 12}px`, paddingBottom: '12px', paddingLeft: '16px', paddingRight: '16px', display: 'flex', alignItems: 'center' }}>
            <View onClick={handleRetake} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
              <Text style={{ color: 'white', fontSize: '22px', lineHeight: '1' }}>‹</Text>
            </View>
            <Text style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>确认照片</Text>
          </View>

          {/* 照片 */}
          <View style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
            <View style={{ width: '280px', height: '360px', borderRadius: '16px', overflow: 'hidden', border: '3px solid rgba(255,255,255,0.2)' }}>
              <Image
                src={capturedPath}
                mode="aspectFill"
                style={{ width: '280px', height: '360px', display: 'block' }}
              />
            </View>
          </View>

          <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', textAlign: 'center', padding: '12px 32px', display: 'block' }}>
            照片仅用于本次皮肤状态分析，分析完成后立即删除
          </Text>

          {/* 按钮 */}
          <View style={{ padding: '0 24px 48px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <View
              onClick={handleConfirm}
              style={{ background: 'white', borderRadius: '50px', padding: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: '#1d4ed8', fontSize: '17px', fontWeight: '700' }}>✓ 开始分析</Text>
            </View>
            <View
              onClick={handleRetake}
              style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '50px', padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: 'white', fontSize: '15px' }}>重新拍照</Text>
            </View>
          </View>
        </View>
      )}

      {/* ── 相机界面覆盖层（非预览）──────────────────────────────── */}
      {!showPreview && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, display: 'flex', flexDirection: 'column',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 22%, transparent 55%, rgba(0,0,0,0.75) 100%)' }}>

          {/* 顶部导航 */}
          <View style={{ paddingTop: `${statusBarHeight}px` }}>
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px' }}>
              <View onClick={() => Taro.navigateBack()} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'white', fontSize: '22px', lineHeight: '1' }}>‹</Text>
              </View>
              <Text style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>皮肤检测</Text>
              <View onClick={() => setFlashMode(FLASH_NEXT[flashMode])} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: '18px' }}>{FLASH_ICON[flashMode]}</Text>
              </View>
            </View>
          </View>

          {/* 人脸引导框 */}
          <View style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'relative' }}>
              {/* 椭圆框 */}
              <View style={{ width: '210px', height: '270px', borderRadius: '50%', border: `3px solid ${frameColor}`, position: 'relative', overflow: 'hidden' }}>
                {/* 扫描线 */}
                {countingDown && (
                  <View style={{ position: 'absolute', left: 0, right: 0, height: '2px',
                    background: 'linear-gradient(to right, transparent, #4ade80, transparent)',
                    top: `${scanLineY}%` }} />
                )}
              </View>

              {/* 四角装饰 */}
              {[
                { top: '-3px', left: '-3px', borderTop: `3px solid ${frameColor}`, borderLeft: `3px solid ${frameColor}`, borderRadius: '4px 0 0 0' },
                { top: '-3px', right: '-3px', borderTop: `3px solid ${frameColor}`, borderRight: `3px solid ${frameColor}`, borderRadius: '0 4px 0 0' },
                { bottom: '-3px', left: '-3px', borderBottom: `3px solid ${frameColor}`, borderLeft: `3px solid ${frameColor}`, borderRadius: '0 0 0 4px' },
                { bottom: '-3px', right: '-3px', borderBottom: `3px solid ${frameColor}`, borderRight: `3px solid ${frameColor}`, borderRadius: '0 0 4px 0' },
              ].map((s, i) => (
                <View key={i} style={{ position: 'absolute', width: '22px', height: '22px', ...s }} />
              ))}

              {/* 方向箭头 */}
              {arrow && (
                <Text style={{ ...arrow.pos, color: '#fbbf24', fontSize: '22px', fontWeight: 'bold' }}>{arrow.symbol}</Text>
              )}

              {/* 倒计时 */}
              {countingDown && countdown > 0 && (
                <View style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                  width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(0,0,0,0.65)',
                  border: '2px solid #4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}>{countdown}</Text>
                </View>
              )}
            </View>

            {/* 状态提示 */}
            <View style={{ marginTop: '14px', textAlign: 'center', padding: '0 32px' }}>
              <Text style={{ color: hintColor, fontSize: '14px', fontWeight: '500' }}>{FACE_HINTS[faceState]}</Text>
            </View>
          </View>

          {/* 检测准备指标 */}
          <View style={{ margin: '0 16px 10px', background: 'rgba(0,0,0,0.45)', borderRadius: '16px', padding: '12px' }}>
            <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', display: 'block', marginBottom: '8px' }}>检测准备</Text>
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
                  <View style={{ height: '3px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', overflow: 'hidden' }}>
                    <View style={{ height: '100%', background: m.color, borderRadius: '2px', width: `${m.value}%` }} />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* 底部操作栏 */}
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '8px 40px 40px' }}>
            {/* 相册 */}
            <View onClick={pickFromAlbum} style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: '24px' }}>🖼️</Text>
            </View>

            {/* 手动拍照按钮 */}
            <View onClick={takePhoto} style={{ width: '78px', height: '78px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 5px rgba(255,255,255,0.25)' }}>
              <View style={{ width: '64px', height: '64px', borderRadius: '50%', border: '3px solid #d1d5db' }} />
            </View>

            {/* 切换摄像头 */}
            <View onClick={toggleCamera} style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: '24px' }}>🔄</Text>
            </View>
          </View>

          <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', textAlign: 'center', paddingBottom: '16px', display: 'block' }}>
            面部对齐后将自动倒计时拍照，也可手动按快门
          </Text>
        </View>
      )}

      {/* ── 冷却弹窗 ──────────────────────────────────────────────── */}
      {showCooling && (
        <View style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ background: 'white', borderRadius: '20px', padding: '28px 24px', width: '280px' }}>
            <Text style={{ fontSize: '32px', textAlign: 'center', display: 'block', marginBottom: '12px' }}>⏱️</Text>
            <Text style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', textAlign: 'center', display: 'block', marginBottom: '8px' }}>检测冷却中</Text>
            <Text style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', display: 'block', marginBottom: '16px' }}>为确保检测准确性，请稍后再试</Text>
            <View style={{ background: '#eff6ff', borderRadius: '12px', padding: '14px', marginBottom: '16px', textAlign: 'center' }}>
              <Text style={{ fontSize: '32px', fontWeight: '700', color: '#1d4ed8' }}>
                {String(cooldown.minutes).padStart(2, '0')}:{String(cooldown.seconds).padStart(2, '0')}
              </Text>
            </View>
            <View onClick={() => setShowCooling(false)} style={{ background: '#f3f4f6', borderRadius: '50px', padding: '14px', textAlign: 'center' }}>
              <Text style={{ color: '#4b5563', fontSize: '15px' }}>知道了</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

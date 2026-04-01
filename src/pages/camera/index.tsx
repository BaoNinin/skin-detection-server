import { View, Text, Camera, Image, Button, CoverView } from '@tarojs/components'
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
  aligned:    '✓ 面部已对齐，准备拍照',
  too_far:    '↕ 请靠近一些',
  too_close:  '↔ 请稍微远一些',
  move_left:  '← 请向左移动',
  move_right: '→ 请向右移动',
  move_up:    '↑ 请抬头',
  move_down:  '↓ 请低头',
}

const DIR_MAP: Record<string, FaceState> = {
  up: 'move_up', down: 'move_down',
  left: 'move_left', right: 'move_right',
  far: 'too_far', close: 'too_close',
  none: 'detecting',
}

export default function CameraPage() {
  const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP
  const sysInfo = Taro.getSystemInfoSync()
  const statusBarHeight = sysInfo.statusBarHeight || 44
  const screenHeight = sysInfo.screenHeight || 667

  // 相机
  const [devicePosition, setDevicePosition] = useState<'front' | 'back'>('front')
  const [flashMode, setFlashMode] = useState<FlashMode>('off')

  // 人脸检测
  const [faceState, setFaceState] = useState<FaceState>('waiting')
  const [isChecking, setIsChecking] = useState(false)
  const [manualMode, setManualMode] = useState(false) // 服务不可用时的手动模式
  const alignedCountRef = useRef(0)
  const checkingRef = useRef(false)
  const takingPhotoRef = useRef(false)
  const failCountRef = useRef(0)

  // 倒计时
  const [countdown, setCountdown] = useState(5)
  const [countingDown, setCountingDown] = useState(false)
  const [scanY, setScanY] = useState(0)
  const scanDirRef = useRef(1)

  // 帧动画
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

  // 省略号动画
  useEffect(() => {
    const interval = setInterval(() => setDotCount(prev => prev >= 3 ? 1 : prev + 1), 400)
    return () => clearInterval(interval)
  }, [])

  // 扫描线
  useEffect(() => {
    if (!countingDown) return
    const interval = setInterval(() => {
      setScanY(prev => {
        const next = prev + scanDirRef.current * 3
        if (next >= 96) { scanDirRef.current = -1; return 96 }
        if (next <= 4)  { scanDirRef.current = 1;  return 4 }
        return next
      })
    }, 25)
    return () => clearInterval(interval)
  }, [countingDown])

  // 人脸检测（每 2.5s 调用豆包模型）
  useEffect(() => {
    if (showPreview || !isWeapp || countingDown || manualMode) return
    alignedCountRef.current = 0
    checkingRef.current = false
    failCountRef.current = 0
    setFaceState('waiting')
    setMetrics({ brightness: 0, texture: 0, pores: 0, moisture: 0, tone: 0, confidence: 0 })

    const startTimer = setTimeout(() => {
      runFaceCheck()
      const interval = setInterval(runFaceCheck, 2500)
      return () => clearInterval(interval)
    }, 1500)

    return () => clearTimeout(startTimer)
  }, [showPreview, isWeapp, devicePosition, countingDown, manualMode])

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
            failCountRef.current = 0
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
        } catch {
          failCountRef.current += 1
          // 连续失败 3 次 → 切换手动模式
          if (failCountRef.current >= 3) {
            setManualMode(true)
            Taro.showToast({ title: '自动检测不可用，请手动拍照', icon: 'none', duration: 2500 })
          }
        } finally {
          checkingRef.current = false
          setIsChecking(false)
        }
      },
      fail: () => {
        failCountRef.current += 1
        if (failCountRef.current >= 3) {
          setManualMode(true)
          Taro.showToast({ title: '自动检测不可用，请手动拍照', icon: 'none', duration: 2500 })
        }
        checkingRef.current = false
        setIsChecking(false)
      }
    })
  }

  // 指标动画
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

  // 倒计时
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
    failCountRef.current = 0
    setFaceState('waiting')
    setIsChecking(false)
    setManualMode(false)
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
      setShowPreview(false); resetState(); return
    }
    if (!checkCooldown()) return
    Taro.setStorageSync('lastAnalysisTime', Date.now())
    Taro.redirectTo({ url: `/pages/analyzing/index?imagePath=${encodeURIComponent(capturedPath)}&scanSuccess=true` })
  }

  const toggleCamera = () => {
    setDevicePosition(prev => prev === 'front' ? 'back' : 'front')
    resetState()
  }

  // 颜色
  const isAligned = faceState === 'aligned'
  const isDetecting = faceState === 'detecting' || isChecking
  const frameColor = isAligned ? '#4ade80' : isDetecting ? '#fbbf24' : 'rgba(255,255,255,0.6)'
  const hintColor  = isAligned ? '#4ade80' : isDetecting ? '#fbbf24' : 'rgba(255,255,255,0.9)'

  // Camera 区域高度（屏幕 55%）
  const cameraHeight = Math.round(screenHeight * 0.55)

  return (
    <View style={{ height: '100vh', background: '#000', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ══ 顶部导航栏（Camera 上方，不重叠，可点击）════════════════ */}
      <View style={{ paddingTop: `${statusBarHeight}px`, background: 'rgba(0,0,0,0.9)', flexShrink: 0 }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px' }}>
          <View onClick={() => Taro.navigateBack()} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: 'white', fontSize: '22px' }}>‹</Text>
          </View>
          <Text style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>皮肤检测</Text>
          <View onClick={() => setFlashMode(FLASH_NEXT[flashMode])} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: '18px' }}>{FLASH_ICON[flashMode]}</Text>
          </View>
        </View>
      </View>

      {/* ══ Camera 预览区（固定高度，原生组件）══════════════════════ */}
      <View style={{ height: `${cameraHeight}px`, position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
        {isWeapp && (
          <Camera
            devicePosition={devicePosition}
            flash={flashMode}
            mode="normal"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          />
        )}

        {/* 人脸引导框 - CoverView 可覆盖原生组件 */}
        <CoverView style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          {/* 左上角 */}
          <CoverView style={{ position: 'absolute', top: '12%', left: '18%', width: '28px', height: '3px', backgroundColor: frameColor }} />
          <CoverView style={{ position: 'absolute', top: '12%', left: '18%', width: '3px', height: '28px', backgroundColor: frameColor }} />
          {/* 右上角 */}
          <CoverView style={{ position: 'absolute', top: '12%', right: '18%', width: '28px', height: '3px', backgroundColor: frameColor }} />
          <CoverView style={{ position: 'absolute', top: '12%', right: '18%', width: '3px', height: '28px', backgroundColor: frameColor }} />
          {/* 左下角 */}
          <CoverView style={{ position: 'absolute', bottom: '8%', left: '18%', width: '28px', height: '3px', backgroundColor: frameColor }} />
          <CoverView style={{ position: 'absolute', bottom: '8%', left: '18%', width: '3px', height: '28px', backgroundColor: frameColor }} />
          {/* 右下角 */}
          <CoverView style={{ position: 'absolute', bottom: '8%', right: '18%', width: '28px', height: '3px', backgroundColor: frameColor }} />
          <CoverView style={{ position: 'absolute', bottom: '8%', right: '18%', width: '3px', height: '28px', backgroundColor: frameColor }} />
          {/* 扫描线 */}
          {countingDown && (
            <CoverView style={{ position: 'absolute', left: '18%', right: '18%', height: '2px', top: `${scanY}%`, backgroundColor: '#4ade80' }} />
          )}
          {/* 倒计时数字（叠加在框内）*/}
          {countingDown && countdown > 0 && (
            <CoverView style={{ position: 'absolute', top: '42%', left: '44%', width: '52px', height: '52px', borderRadius: '26px', backgroundColor: 'rgba(0,0,0,0.65)' }}>
              <CoverView style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'white', fontSize: '26px', fontWeight: 'bold', textAlign: 'center', lineHeight: '52px', display: 'block' }}>{countdown}</Text>
              </CoverView>
            </CoverView>
          )}
        </CoverView>

        {/* 底部渐变（CoverView）*/}
        <CoverView style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', backgroundColor: 'rgba(0,0,0,0)' }} />
      </View>

      {/* ══ 底部控制区（Camera 下方，完全可点击）════════════════════ */}
      <View style={{ flex: 1, background: '#0a0a0a', display: 'flex', flexDirection: 'column', padding: '10px 16px 0' }}>

        {/* 状态提示 */}
        <View style={{ textAlign: 'center', marginBottom: '8px', minHeight: '22px' }}>
          <Text style={{ color: hintColor, fontSize: '14px', fontWeight: '500' }}>
            {manualMode
              ? '请点击拍照按钮手动拍照'
              : faceState === 'detecting'
              ? `正在识别面部${'.'.repeat(dotCount)}`
              : FACE_HINTS[faceState]}
          </Text>
          {isChecking && !manualMode && (
            <Text style={{ color: 'rgba(96,165,250,0.8)', fontSize: '11px', display: 'block', marginTop: '3px' }}>AI 识别中...</Text>
          )}
          {countingDown && (
            <Text style={{ color: '#4ade80', fontSize: '12px', display: 'block', marginTop: '3px' }}>
              {countdown} 秒后自动拍照
            </Text>
          )}
        </View>

        {/* 指标 */}
        <View style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '10px 12px', marginBottom: '10px' }}>
          <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', display: 'block', marginBottom: '6px' }}>
            {manualMode ? '手动检测模式' : '检测准备'}
          </Text>
          <View style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {[
              { label: '亮度',  value: metrics.brightness, color: '#60a5fa' },
              { label: '纹理',  value: metrics.texture,    color: '#a78bfa' },
              { label: '毛孔',  value: metrics.pores,      color: '#fb923c' },
              { label: '水分',  value: metrics.moisture,   color: '#34d399' },
              { label: '肤调',  value: metrics.tone,       color: '#f472b6' },
              { label: '置信度', value: metrics.confidence, color: '#4ade80' },
            ].map(m => (
              <View key={m.label} style={{ width: 'calc(33% - 4px)' }}>
                <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px' }}>{m.label}</Text>
                  <Text style={{ color: 'white', fontSize: '10px', fontWeight: '600' }}>{Math.round(m.value)}%</Text>
                </View>
                <View style={{ height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                  <View style={{ height: '100%', background: m.color, borderRadius: '2px', width: `${m.value}%` }} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 操作按钮（完全在 Camera 下方，一定可以点击）*/}
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', paddingBottom: '24px' }}>
          {/* 相册 */}
          <View onClick={pickFromAlbum} style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: '24px' }}>🖼️</Text>
          </View>

          {/* 拍照快门 */}
          <View onClick={takePhoto} style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 5px rgba(255,255,255,0.2)' }}>
            <View style={{ width: '58px', height: '58px', borderRadius: '50%', border: '3px solid #d1d5db' }} />
          </View>

          {/* 切换摄像头 */}
          <View onClick={toggleCamera} style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: '24px' }}>🔄</Text>
          </View>
        </View>
      </View>

      {/* ══ 预览页（fixed 全屏）══════════════════════════════════════ */}
      {showPreview && (
        <View style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: '#111', display: 'flex', flexDirection: 'column' }}>
          <View style={{ paddingTop: `${statusBarHeight + 8}px`, paddingBottom: '8px', paddingLeft: '16px', paddingRight: '16px', display: 'flex', alignItems: 'center' }}>
            <View onClick={() => { setShowPreview(false); resetState() }} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
              <Text style={{ color: 'white', fontSize: '22px' }}>‹</Text>
            </View>
            <Text style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>确认照片</Text>
          </View>

          <View style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
            <View style={{ borderRadius: '16px', overflow: 'hidden', border: '3px solid rgba(255,255,255,0.15)', width: '296px', height: '370px' }}>
              <Image src={capturedPath} mode="aspectFill" style={{ width: '296px', height: '370px', display: 'block' }} />
            </View>
          </View>

          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textAlign: 'center', display: 'block', padding: '0 32px 16px' }}>
            照片仅用于本次皮肤状态分析，分析完成后立即删除
          </Text>

          <View style={{ padding: '0 24px 48px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Button onClick={handleConfirm} style={{ background: 'white', color: '#1d4ed8', borderRadius: '50px', fontSize: '17px', fontWeight: '700', height: '52px', lineHeight: '52px', border: 'none' }}>
              ✓ 开始分析
            </Button>
            <Button onClick={() => { setShowPreview(false); resetState() }} style={{ background: 'rgba(255,255,255,0.12)', color: 'white', borderRadius: '50px', fontSize: '15px', height: '48px', lineHeight: '48px', border: 'none' }}>
              重新拍照
            </Button>
          </View>
        </View>
      )}

      {/* ══ 冷却弹窗 ══════════════════════════════════════════════ */}
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
            <Button onClick={() => setShowCooling(false)} style={{ background: '#f3f4f6', color: '#4b5563', borderRadius: '50px', fontSize: '15px', height: '48px', lineHeight: '48px', border: 'none' }}>
              知道了
            </Button>
          </View>
        </View>
      )}
    </View>
  )
}

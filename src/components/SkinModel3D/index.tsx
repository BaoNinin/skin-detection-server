import { View, Canvas, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect } from 'react'

interface SkinModel3DProps {
  result: {
    skinType: string
    concerns: string[]
    moisture: number
    oiliness: number
    sensitivity: number
    acne?: number
    wrinkles?: number
    spots?: number
    pores?: number
    blackheads?: number
    recommendations: string[]
  }
  width?: number
  height?: number
}

export default function SkinModel3D({ result, width = 300, height = 400 }: SkinModel3DProps) {
  const canvasId = `skinModel_${Math.random().toString(36).substr(2, 9)}`

  useEffect(() => {
    const ctx = Taro.createCanvasContext(canvasId)
    
    // 绘制伪 3D 皮肤模型
    drawSkinModel(ctx, width, height)
    
    ctx.draw()
  }, [width, height, result])

  const drawSkinModel = (ctx: any, w: number, h: number) => {
    // 背景渐变
    const bgGradient = ctx.createLinearGradient(0, 0, 0, h)
    bgGradient.addColorStop(0, '#FFF5F5')
    bgGradient.addColorStop(1, '#FFE4E1')
    ctx.setFillStyle(bgGradient)
    ctx.fillRect(0, 0, w, h)

    // 3D 模型参数
    const centerX = w / 2
    const centerY = h / 2
    const modelWidth = w * 0.7
    const modelHeight = h * 0.6
    
    // 绘制面部轮廓（椭圆变形模拟 3D）
    ctx.beginPath()
    ctx.ellipse(centerX, centerY, modelWidth / 2, modelHeight / 2, 0, 0, 2 * Math.PI)
    ctx.setFillStyle('#FFE4D4')
    ctx.fill()
    ctx.setStrokeStyle('#E8C8B8')
    ctx.setLineWidth(2)
    ctx.stroke()

    // 添加阴影效果（模拟 3D）
    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
    ctx.shadowBlur = 10
    ctx.shadowOffsetX = 5
    ctx.shadowOffsetY = 5
    ctx.restore()

    // 绘制面部特征区域（简化版）
    // 额头
    ctx.beginPath()
    ctx.ellipse(centerX, centerY - modelHeight * 0.3, modelWidth * 0.4, modelHeight * 0.15, 0, 0, 2 * Math.PI)
    ctx.setFillStyle('#FFE8E0')
    ctx.fill()

    // 左脸颊
    ctx.beginPath()
    ctx.ellipse(centerX - modelWidth * 0.25, centerY, modelWidth * 0.15, modelHeight * 0.2, -0.2, 0, 2 * Math.PI)
    ctx.setFillStyle('#FFE4D4')
    ctx.fill()

    // 右脸颊
    ctx.beginPath()
    ctx.ellipse(centerX + modelWidth * 0.25, centerY, modelWidth * 0.15, modelHeight * 0.2, 0.2, 0, 2 * Math.PI)
    ctx.setFillStyle('#FFE4D4')
    ctx.fill()

    // 绘制问题区域（热力图效果）
    result.concerns.forEach((problem, index) => {
      const colors: Record<string, string> = {
        '痘痘': '#EF4444',
        '黑头': '#6B7280',
        '毛孔': '#8B4513',
        '色斑': '#A0522D',
        '皱纹': '#D4AF37',
        '敏感': '#FF6B6B',
        '干燥': '#60A5FA',
        '油性': '#F59E0B'
      }

      const color = colors[problem] || '#EF4444'
      const positions = [
        { x: centerX - modelWidth * 0.25, y: centerY - modelHeight * 0.1 }, // 左脸颊
        { x: centerX + modelWidth * 0.25, y: centerY - modelHeight * 0.1 }, // 右脸颊
        { x: centerX, y: centerY - modelHeight * 0.3 }, // 额头
        { x: centerX - modelWidth * 0.1, y: centerY + modelHeight * 0.15 }, // 鼻翼左侧
        { x: centerX + modelWidth * 0.1, y: centerY + modelHeight * 0.15 }, // 鼻翼右侧
        { x: centerX, y: centerY + modelHeight * 0.25 }, // 下巴
      ]

      const pos = positions[index % positions.length]
      const size = 20 + Math.random() * 10

      // 绘制热力点
      const problemGradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, size)
      problemGradient.addColorStop(0, `${color}CC`)
      problemGradient.addColorStop(0.5, `${color}66`)
      problemGradient.addColorStop(1, `${color}00`)
      
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, size, 0, 2 * Math.PI)
      ctx.setFillStyle(problemGradient)
      ctx.fill()
    })

    // 绘制脸部轮廓线
    ctx.beginPath()
    ctx.ellipse(centerX, centerY, modelWidth / 2, modelHeight / 2, 0, 0, 2 * Math.PI)
    ctx.setStrokeStyle('#D4A984')
    ctx.setLineWidth(1)
    ctx.stroke()

    // 绘制高光效果（模拟 3D 光照）
    const highlightPositions = [
      { x: centerX - modelWidth * 0.2, y: centerY - modelHeight * 0.35 },
      { x: centerX + modelWidth * 0.2, y: centerY - modelHeight * 0.35 },
      { x: centerX, y: centerY - modelHeight * 0.4 }
    ]

    highlightPositions.forEach(pos => {
      const highlightGradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 15)
      highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)')
      highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 15, 0, 2 * Math.PI)
      ctx.setFillStyle(highlightGradient)
      ctx.fill()
    })

    // 绘制标签
    if (result.concerns.length > 0) {
      ctx.setFontSize(12)
      ctx.setFillStyle('#666')
      ctx.setTextAlign('center')
      ctx.fillText('皮肤问题分布', centerX, h - 30)
    }
  }

  return (
    <View className="flex flex-col items-center">
      <Canvas
        id={canvasId}
        canvasId={canvasId}
        style={{ width: `${width}px`, height: `${height}px` }}
      />
      {result.concerns.length > 0 && (
        <View className="mt-2 flex flex-wrap justify-center gap-2">
          {result.concerns.map((problem, index) => (
            <View key={index} className="flex items-center gap-1">
              <View
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: problem === '痘痘' ? '#EF4444' :
                                   problem === '黑头' ? '#6B7280' :
                                   problem === '毛孔' ? '#8B4513' :
                                   problem === '色斑' ? '#A0522D' :
                                   problem === '皱纹' ? '#D4AF37' :
                                   problem === '敏感' ? '#FF6B6B' :
                                   problem === '干燥' ? '#60A5FA' :
                                   problem === '油性' ? '#F59E0B' : '#EF4444'
                }}
              />
              <Text className="text-xs text-gray-600 block">{problem}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

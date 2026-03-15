import { View, Canvas } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect } from 'react'

interface RadarChartProps {
  data: {
    name: string
    value: number
    color: string
  }[]
  width?: number
  height?: number
}

export default function RadarChart({ data, width = 300, height = 300 }: RadarChartProps) {
  const canvasId = 'radarChart'

  useEffect(() => {
    if (data.length === 0) return

    // 绘制雷达图
    drawRadarChart()
  }, [data])

  const drawRadarChart = () => {
    const query = Taro.createSelectorQuery()
    query.select(`#${canvasId}`)
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res || !res[0]) return

        const canvas = res[0].node
        const ctx = canvas.getContext('2d')

        // 设置画布尺寸
        const dpr = Taro.getSystemInfoSync().pixelRatio
        canvas.width = width * dpr
        canvas.height = height * dpr
        ctx.scale(dpr, dpr)

        const centerX = width / 2
        const centerY = height / 2
        const maxRadius = Math.min(width, height) / 2 - 40
        const sides = data.length
        const angleStep = (Math.PI * 2) / sides

        // 绘制背景网格（五边形）
        ctx.strokeStyle = '#E5E7EB'
        ctx.lineWidth = 1

        for (let level = 1; level <= 5; level++) {
          const radius = (maxRadius / 5) * level
          ctx.beginPath()
          for (let i = 0; i <= sides; i++) {
            const angle = i * angleStep - Math.PI / 2
            const x = centerX + radius * Math.cos(angle)
            const y = centerY + radius * Math.sin(angle)
            if (i === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          }
          ctx.closePath()
          ctx.stroke()
        }

        // 绘制轴线
        ctx.strokeStyle = '#E5E7EB'
        for (let i = 0; i < sides; i++) {
          const angle = i * angleStep - Math.PI / 2
          const x = centerX + maxRadius * Math.cos(angle)
          const y = centerY + maxRadius * Math.sin(angle)
          ctx.beginPath()
          ctx.moveTo(centerX, centerY)
          ctx.lineTo(x, y)
          ctx.stroke()
        }

        // 绘制数据区域
        ctx.fillStyle = 'rgba(255, 182, 193, 0.3)'
        ctx.strokeStyle = '#EC4899'
        ctx.lineWidth = 2

        ctx.beginPath()
        for (let i = 0; i <= sides; i++) {
          const dataIndex = i % sides
          const value = data[dataIndex].value
          const radius = (maxRadius * value) / 100
          const angle = i * angleStep - Math.PI / 2
          const x = centerX + radius * Math.cos(angle)
          const y = centerY + radius * Math.sin(angle)

          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.closePath()
        ctx.fill()
        ctx.stroke()

        // 绘制数据点
        data.forEach((item, index) => {
          const value = item.value
          const radius = (maxRadius * value) / 100
          const angle = index * angleStep - Math.PI / 2
          const x = centerX + radius * Math.cos(angle)
          const y = centerY + radius * Math.sin(angle)

          ctx.beginPath()
          ctx.arc(x, y, 5, 0, Math.PI * 2)
          ctx.fillStyle = '#EC4899'
          ctx.fill()

          // 绘制标签
          const labelRadius = maxRadius + 20
          const labelX = centerX + labelRadius * Math.cos(angle)
          const labelY = centerY + labelRadius * Math.sin(angle)

          ctx.font = '12px sans-serif'
          ctx.fillStyle = '#374151'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(item.name, labelX, labelY)
        })
      })
  }

  return (
    <View className="flex flex-col items-center">
      <Canvas
        id={canvasId}
        type="2d"
        style={{ width: `${width}px`, height: `${height}px` }}
      />
    </View>
  )
}

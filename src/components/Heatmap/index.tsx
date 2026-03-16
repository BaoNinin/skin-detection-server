import { View, Text } from '@tarojs/components'

interface HeatmapProps {
  concerns: string[]
  width?: number
  height?: number
}

export default function Heatmap({ concerns, width = 300, height = 400 }: HeatmapProps) {
  const getColorBySeverity = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const concernPositions = concerns.map((concern) => {
    const severityMap: Record<string, 'low' | 'medium' | 'high'> = {
      '干燥': 'low',
      '出油': 'low',
      '敏感': 'medium',
      '痘痘': 'high',
      '毛孔粗大': 'medium',
      '黑头': 'medium',
      '色斑': 'medium',
      '皱纹': 'high',
      '暗沉': 'low',
      '泛红': 'medium'
    }

    const severity = severityMap[concern] || 'low'
    const valueMap: Record<string, number> = {
      '干燥': 30,
      '出油': 25,
      '敏感': 50,
      '痘痘': 80,
      '毛孔粗大': 45,
      '黑头': 40,
      '色斑': 55,
      '皱纹': 70,
      '暗沉': 35,
      '泛红': 45
    }

    const positionMap: Record<string, { x: number; y: number }> = {
      '干燥': { x: 50, y: 50 },
      '出油': { x: 50, y: 40 },
      '敏感': { x: 50, y: 35 },
      '痘痘': { x: 40, y: 30 },
      '毛孔粗大': { x: 50, y: 45 },
      '黑头': { x: 50, y: 55 },
      '色斑': { x: 60, y: 40 },
      '皱纹': { x: 65, y: 30 },
      '暗沉': { x: 55, y: 50 },
      '泛红': { x: 45, y: 35 }
    }

    return {
      name: concern,
      value: valueMap[concern] || 40,
      x: positionMap[concern]?.x || 50,
      y: positionMap[concern]?.y || 50,
      severity
    }
  })

  return (
    <View className="flex flex-col items-center">
      <View
        className="relative bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl overflow-hidden"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        {/* 面部轮廓背景 */}
        <View className="absolute inset-0 flex items-center justify-center">
          <View
            className="relative"
            style={{
              width: `${width * 0.7}px`,
              height: `${height * 0.6}px`
            }}
          >
            {/* 简化的面部轮廓 */}
            <View className="absolute inset-0 rounded-full bg-rose-100" />
            
            {/* 热力点 */}
            {concernPositions.map((problem, index) => (
              <View
                key={index}
                className={`absolute rounded-full opacity-60 ${getColorBySeverity(problem.severity)} animate-pulse`}
                style={{
                  left: `${problem.x}%`,
                  top: `${problem.y}%`,
                  width: `${40 + problem.value / 2}px`,
                  height: `${40 + problem.value / 2}px`,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: `0 0 ${20 + problem.value / 2}px ${problem.severity === 'high' ? 'rgba(239, 68, 68, 0.6)' : problem.severity === 'medium' ? 'rgba(245, 158, 11, 0.6)' : 'rgba(16, 185, 129, 0.6)'}`
                }}
              />
            ))}

            {/* 问题标签 */}
            {concernPositions.map((problem, index) => (
              <View
                key={`label-${index}`}
                className={`absolute rounded-full px-2 py-1 shadow-lg ${getColorBySeverity(problem.severity)} text-white text-xs font-medium`}
                style={{
                  left: `${problem.x}%`,
                  top: `${problem.y - 15}%`,
                  transform: 'translate(-50%, -50%)',
                  whiteSpace: 'nowrap'
                }}
              >
                {problem.name}
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* 图例 */}
      <View className="mt-4 flex items-center gap-4">
        <View className="flex items-center gap-1">
          <View className="w-4 h-4 rounded-full bg-green-500" />
          <Text className="text-xs text-gray-600 block">轻微</Text>
        </View>
        <View className="flex items-center gap-1">
          <View className="w-4 h-4 rounded-full bg-yellow-500" />
          <Text className="text-xs text-gray-600 block">中等</Text>
        </View>
        <View className="flex items-center gap-1">
          <View className="w-4 h-4 rounded-full bg-red-500" />
          <Text className="text-xs text-gray-600 block">严重</Text>
        </View>
      </View>
    </View>
  )
}

import { View, Text } from '@tarojs/components'
import { useEffect, useState } from 'react'

interface OverallScoreProps {
  score: number
  rating: string
}

export default function OverallScore({ score, rating }: OverallScoreProps) {
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayScore((prev) => {
        if (prev >= score) {
          clearInterval(interval)
          return score
        }
        return prev + 1
      })
    }, 20)

    return () => clearInterval(interval)
  }, [score])

  const getScoreColor = () => {
    if (score >= 80) return '#10B981'
    if (score >= 60) return '#F59E0B'
    return '#EF4444'
  }

  const getScoreIcon = () => {
    if (score >= 80) return '🌟'
    if (score >= 60) return '⭐'
    return '📊'
  }

  const getRatingColor = () => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <View className="bg-white rounded-2xl p-6 shadow-sm">
      <View className="flex items-center justify-between mb-4">
        <View className="flex-1">
          <Text className="text-sm text-gray-500 block mb-1">综合评分</Text>
          <View className="flex items-baseline">
            <View className="flex items-baseline">
              <Text className="text-5xl font-bold mr-2" style={{ color: getScoreColor() }}>
                {displayScore}
              </Text>
              <Text className="text-2xl text-gray-600">分</Text>
            </View>
          </View>
          <View className="inline-flex items-center px-3 py-1 rounded-full mt-2 bg-gray-100">
            <Text className={`text-sm font-medium ${getRatingColor()}`}>
              {rating}
            </Text>
          </View>
        </View>
        <View
          className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: getScoreColor() }}
        >
          <Text className="text-4xl">{getScoreIcon()}</Text>
        </View>
      </View>

      {/* 半圆形进度条 */}
      <View className="relative mt-4">
        <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <View
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${score}%`,
              backgroundColor: getScoreColor()
            }}
          />
        </View>
        <View className="flex justify-between mt-2 text-xs text-gray-500">
          <Text>0</Text>
          <Text>50</Text>
          <Text>100</Text>
        </View>
      </View>
    </View>
  )
}

import { View, Text, Image, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'

interface SkinAnalysisResult {
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

interface Indicator {
  icon: string
  name: string
  value: number
  evaluation: string
  color: string
}

export default function ResultPage() {
  const [result, setResult] = useState<SkinAnalysisResult | null>(null)
  const [imagePath, setImagePath] = useState('')
  const [indicators, setIndicators] = useState<Indicator[]>([])

  useEffect(() => {
    const analysisResult = Taro.getStorageSync('skinAnalysisResult')
    const currentImage = Taro.getStorageSync('currentImagePath')

    if (analysisResult) {
      setResult(analysisResult)
      setImagePath(currentImage || '')

      const inds: Indicator[] = [
        {
          icon: '💧',
          name: '水分',
          value: analysisResult.moisture,
          evaluation: analysisResult.moisture >= 60 ? '充足' : analysisResult.moisture >= 30 ? '偏低' : '严重缺水',
          color: analysisResult.moisture >= 60 ? '#10B981' : analysisResult.moisture >= 30 ? '#F59E0B' : '#EF4444'
        },
        {
          icon: '🛢️',
          name: '油分',
          value: analysisResult.oiliness,
          evaluation: analysisResult.oiliness <= 30 ? '低' : analysisResult.oiliness <= 70 ? '适中' : '偏高',
          color: analysisResult.oiliness <= 30 ? '#10B981' : analysisResult.oiliness <= 70 ? '#F59E0B' : '#EF4444'
        },
        {
          icon: '🌡️',
          name: '敏感度',
          value: analysisResult.sensitivity,
          evaluation: analysisResult.sensitivity <= 20 ? '不敏感' : analysisResult.sensitivity <= 50 ? '轻度敏感' : '高度敏感',
          color: analysisResult.sensitivity <= 20 ? '#10B981' : analysisResult.sensitivity <= 50 ? '#F59E0B' : '#EF4444'
        },
        {
          icon: '🔴',
          name: '痘痘',
          value: analysisResult.acne ?? 0,
          evaluation: (analysisResult.acne ?? 0) <= 10 ? '几乎无' : (analysisResult.acne ?? 0) <= 40 ? '轻微' : (analysisResult.acne ?? 0) <= 70 ? '中度' : '严重',
          color: (analysisResult.acne ?? 0) <= 10 ? '#10B981' : (analysisResult.acne ?? 0) <= 40 ? '#F59E0B' : (analysisResult.acne ?? 0) <= 70 ? '#F97316' : '#EF4444'
        },
        {
          icon: '🌀',
          name: '皱纹',
          value: analysisResult.wrinkles ?? 0,
          evaluation: (analysisResult.wrinkles ?? 0) <= 20 ? '几乎无' : (analysisResult.wrinkles ?? 0) <= 50 ? '轻微' : (analysisResult.wrinkles ?? 0) <= 80 ? '中度' : '严重',
          color: (analysisResult.wrinkles ?? 0) <= 20 ? '#10B981' : (analysisResult.wrinkles ?? 0) <= 50 ? '#F59E0B' : (analysisResult.wrinkles ?? 0) <= 80 ? '#F97316' : '#EF4444'
        },
        {
          icon: '🟤',
          name: '色斑',
          value: analysisResult.spots ?? 0,
          evaluation: (analysisResult.spots ?? 0) <= 10 ? '几乎无' : (analysisResult.spots ?? 0) <= 40 ? '轻微' : (analysisResult.spots ?? 0) <= 70 ? '中度' : '严重',
          color: (analysisResult.spots ?? 0) <= 10 ? '#10B981' : (analysisResult.spots ?? 0) <= 40 ? '#F59E0B' : (analysisResult.spots ?? 0) <= 70 ? '#F97316' : '#EF4444'
        },
        {
          icon: '⚫',
          name: '毛孔',
          value: analysisResult.pores ?? 0,
          evaluation: (analysisResult.pores ?? 0) <= 30 ? '几乎无' : (analysisResult.pores ?? 0) <= 60 ? '轻微' : (analysisResult.pores ?? 0) <= 80 ? '中度' : '粗大',
          color: (analysisResult.pores ?? 0) <= 30 ? '#10B981' : (analysisResult.pores ?? 0) <= 60 ? '#F59E0B' : (analysisResult.pores ?? 0) <= 80 ? '#F97316' : '#EF4444'
        },
        {
          icon: '⚫',
          name: '黑头',
          value: analysisResult.blackheads ?? 0,
          evaluation: (analysisResult.blackheads ?? 0) <= 20 ? '几乎无' : (analysisResult.blackheads ?? 0) <= 50 ? '轻微' : (analysisResult.blackheads ?? 0) <= 80 ? '中度' : '严重',
          color: (analysisResult.blackheads ?? 0) <= 20 ? '#10B981' : (analysisResult.blackheads ?? 0) <= 50 ? '#F59E0B' : (analysisResult.blackheads ?? 0) <= 80 ? '#F97316' : '#EF4444'
        }
      ]
      setIndicators(inds)
    } else {
      Taro.showToast({
        title: '未找到检测结果',
        icon: 'none'
      })
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/index/index' })
      }, 1500)
    }
  }, [])

  const calculateOverallScore = () => {
    if (!result) return 0
    const scores = [result.moisture, 100 - result.oiliness, 100 - result.sensitivity]
    if (result.acne) scores.push(100 - result.acne)
    if (result.wrinkles) scores.push(100 - result.wrinkles)
    if (result.spots) scores.push(100 - result.spots)
    if (result.pores) scores.push(100 - result.pores)
    if (result.blackheads) scores.push(100 - result.blackheads)
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }

  const overallScore = calculateOverallScore()
  const scoreRating = overallScore >= 80 ? '优秀' : overallScore >= 60 ? '良好' : '需改善'

  const handleViewRecommendations = () => {
    Taro.navigateTo({
      url: '/pages/recommend/index'
    })
  }

  const handleReDetect = () => {
    Taro.redirectTo({
      url: '/pages/camera/index'
    })
  }

  const handleSaveRecord = () => {
    Taro.showToast({
      title: '记录已保存',
      icon: 'success'
    })
  }

  if (!result) {
    return null
  }

  return (
    <View className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <ScrollView scrollY className="h-screen">
        <View className="p-4">
          <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <View className="flex items-center mb-4">
              {imagePath && (
                <Image
                  src={imagePath}
                  mode="aspectFill"
                  className="w-20 h-20 rounded-xl mr-4"
                />
              )}
              <View className="flex-1">
                <Text className="text-sm text-gray-500 block">综合评分</Text>
                <Text className="text-4xl font-bold text-rose-400 block">{overallScore}分</Text>
                <Text className="text-base text-gray-600 block">{scoreRating}</Text>
              </View>
              <View className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: overallScore >= 80 ? '#10B981' : overallScore >= 60 ? '#F59E0B' : '#EF4444' }}>
                <Text className="text-3xl">🌟</Text>
              </View>
            </View>

            <View className="border-t border-gray-100 pt-4">
              <Text className="text-sm text-gray-500 mb-2 block">皮肤类型</Text>
              <View className="inline-flex items-center px-3 py-1 rounded-full bg-rose-100">
                <Text className="text-base text-rose-600 font-medium block">{result.skinType}</Text>
              </View>
            </View>
          </View>

          <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <Text className="text-lg font-semibold text-gray-800 mb-4 block">各项指标</Text>
            <ScrollView scrollX className="whitespace-nowrap">
              <View className="inline-flex gap-3 pb-2">
                {indicators.map((indicator, index) => (
                  <View key={index} className="bg-gray-50 rounded-xl p-4 min-w-[120px]">
                    <Text className="text-2xl mb-2 block">{indicator.icon}</Text>
                    <Text className="text-sm text-gray-600 block">{indicator.name}</Text>
                    <Text className="text-2xl font-bold mb-1 block" style={{ color: indicator.color }}>
                      {indicator.value}
                    </Text>
                    <Text className="text-xs" style={{ color: indicator.color }}>{indicator.evaluation}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {result.concerns && result.concerns.length > 0 && (
            <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <Text className="text-lg font-semibold text-gray-800 mb-3 block">主要问题</Text>
              <View className="flex flex-wrap gap-2">
                {result.concerns.map((concern, index) => (
                  <View key={index} className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100">
                    <Text className="text-sm text-amber-600 block">{concern}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {result.recommendations && result.recommendations.length > 0 && (
            <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <Text className="text-lg font-semibold text-gray-800 mb-3 block">护肤建议</Text>
              {result.recommendations.map((rec, index) => (
                <View key={index} className="flex items-start mb-2">
                  <Text className="text-rose-400 mr-2 block">•</Text>
                  <Text className="text-sm text-gray-700 flex-1 block">{rec}</Text>
                </View>
              ))}
            </View>
          )}

          {/* 操作按钮区域 - 随页面滚动 */}
          <View className="bg-white border-t border-gray-100 p-4 space-y-3 mt-4">
            <Button
              onClick={handleViewRecommendations}
              className="w-full bg-rose-400 text-white rounded-full py-3 font-medium"
            >
              查看推荐产品
            </Button>

            <View className="flex gap-3">
              <Button
                onClick={handleReDetect}
                className="flex-1 bg-white text-gray-700 border-2 border-gray-200 rounded-full py-3"
              >
                重新检测
              </Button>
              <Button
                onClick={handleSaveRecord}
                className="flex-1 bg-white text-gray-700 border-2 border-gray-200 rounded-full py-3"
              >
                保存记录
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

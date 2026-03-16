import { View, Text, Image, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import React, { useState, useEffect } from 'react'
import RadarChart from '@/components/RadarChart'
import OverallScore from '@/components/OverallScore'
import SkinModel3D from '@/components/SkinModel3D'
import Heatmap from '@/components/Heatmap'

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

export default function ResultPage() {
  const [result, setResult] = useState<SkinAnalysisResult | null>(null)
  const [imagePath, setImagePath] = useState('')

  // 使用 useMemo 计算综合评分
  const overallScore = React.useMemo(() => {
    if (!result) return 0
    const scores = [result.moisture, 100 - result.oiliness, 100 - result.sensitivity]
    console.log('=== 计算综合评分 ===')
    console.log('基础指标:', scores)
    if (result.acne) {
      scores.push(100 - result.acne)
      console.log('添加痘痘指标:', 100 - result.acne)
    }
    if (result.wrinkles) {
      scores.push(100 - result.wrinkles)
      console.log('添加皱纹指标:', 100 - result.wrinkles)
    }
    if (result.spots) {
      scores.push(100 - result.spots)
      console.log('添加色斑指标:', 100 - result.spots)
    }
    if (result.pores) {
      scores.push(100 - result.pores)
      console.log('添加毛孔指标:', 100 - result.pores)
    }
    if (result.blackheads) {
      scores.push(100 - result.blackheads)
      console.log('添加黑头指标:', 100 - result.blackheads)
    }
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    console.log('总分:', scores.reduce((a, b) => a + b, 0))
    console.log('平均分:', avg)
    const finalScore = Math.round(avg)
    console.log('最终评分:', finalScore)
    return finalScore
  }, [result])

  const scoreRating = overallScore >= 80 ? '优秀' : overallScore >= 60 ? '良好' : '需改善'

  useEffect(() => {
    const analysisResult = Taro.getStorageSync('skinAnalysisResult')
    const currentImage = Taro.getStorageSync('currentImagePath')

    console.log('=== result 页面数据加载 ===')
    console.log('analysisResult:', analysisResult)
    console.log('currentImage:', currentImage)

    if (analysisResult) {
      setResult(analysisResult)
      setImagePath(currentImage || '')
      
      // 打印各项指标
      console.log('各项指标:')
      console.log('  skinType:', analysisResult.skinType)
      console.log('  concerns:', analysisResult.concerns)
      console.log('  moisture:', analysisResult.moisture)
      console.log('  oiliness:', analysisResult.oiliness)
      console.log('  sensitivity:', analysisResult.sensitivity)
      console.log('  acne:', analysisResult.acne)
      console.log('  wrinkles:', analysisResult.wrinkles)
      console.log('  spots:', analysisResult.spots)
      console.log('  pores:', analysisResult.pores)
      console.log('  blackheads:', analysisResult.blackheads)
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

  const getRadarData = () => {
    if (!result) return []

    return [
      { name: '水分', value: result.moisture, color: '#3B82F6' },
      { name: '油性', value: 100 - result.oiliness, color: '#10B981' },
      { name: '敏感度', value: 100 - result.sensitivity, color: '#F59E0B' },
      { name: '痘痘', value: 100 - (result.acne || 0), color: '#EF4444' },
      { name: '皱纹', value: 100 - (result.wrinkles || 0), color: '#8B5CF6' }
    ]
  }

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

  const handleViewDetail = () => {
    Taro.navigateTo({
      url: '/pages/result-detail/index'
    })
  }

  const handleViewHistory = () => {
    Taro.switchTab({
      url: '/pages/history/index'
    })
  }

  if (!result) {
    return null
  }

  return (
    <View className="min-h-screen bg-rose-50">
      <ScrollView scrollY className="h-screen">
        <View className="p-4">
          {/* 综合评分 */}
          <OverallScore score={overallScore} rating={scoreRating} />

          {/* 皮肤类型和图片 */}
          <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <View className="flex items-center gap-4">
              {imagePath && (
                <Image
                  src={imagePath}
                  mode="aspectFill"
                  className="w-24 h-24 rounded-xl"
                />
              )}
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-2 block">皮肤类型</Text>
                <View className="inline-flex items-center px-4 py-2 rounded-full bg-rose-100">
                  <Text className="text-lg text-rose-600 font-semibold block">{result.skinType}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 五维雷达图 */}
          <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <View className="flex items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-gray-800 block">五维雷达图</Text>
              <Text className="text-sm text-gray-500 block">基于 2000 万数据分析</Text>
            </View>
            <RadarChart data={getRadarData()} width={280} height={280} />
            <View className="mt-4 text-center">
              <Text className="text-sm text-gray-500 block">
                您的肌肤综合指数为 <Text className="font-bold text-rose-400">{overallScore}分</Text>
              </Text>
            </View>
          </View>

          {/* 3D 皮肤模型 */}
          {result && (
            <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <View className="flex items-center justify-between mb-4">
                <Text className="text-lg font-semibold text-gray-800 block">3D 肌肤模型</Text>
                <Text className="text-sm text-gray-500 block">问题分布可视化</Text>
              </View>
              <SkinModel3D result={result} />
            </View>
          )}

          {/* 肌肤热力图 */}
          {result && result.concerns && result.concerns.length > 0 && (
            <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <View className="flex items-center justify-between mb-4">
                <Text className="text-lg font-semibold text-gray-800 block">肌肤热力图</Text>
                <Text className="text-sm text-gray-500 block">问题严重程度分析</Text>
              </View>
              <Heatmap concerns={result.concerns} />
            </View>
          )}

          {/* 五大指标详情 */}
          <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <Text className="text-lg font-semibold text-gray-800 mb-4 block">五大指标详情</Text>
            <View className="space-y-3">
              <View className="flex items-center justify-between">
                <View className="flex items-center gap-2">
                  <View className="w-3 h-3 rounded-full bg-blue-500" />
                  <Text className="text-sm text-gray-700 block">水分</Text>
                </View>
                <View className="flex items-center gap-2">
                  <Text className="text-2xl font-bold text-blue-500 block">{result.moisture}</Text>
                  <Text className="text-xs text-gray-500 block">分</Text>
                </View>
              </View>
              <View className="flex items-center justify-between">
                <View className="flex items-center gap-2">
                  <View className="w-3 h-3 rounded-full bg-green-500" />
                  <Text className="text-sm text-gray-700 block">控油</Text>
                </View>
                <View className="flex items-center gap-2">
                  <Text className="text-2xl font-bold text-green-500 block">{100 - result.oiliness}</Text>
                  <Text className="text-xs text-gray-500 block">分</Text>
                </View>
              </View>
              <View className="flex items-center justify-between">
                <View className="flex items-center gap-2">
                  <View className="w-3 h-3 rounded-full bg-yellow-500" />
                  <Text className="text-sm text-gray-700 block">舒缓</Text>
                </View>
                <View className="flex items-center gap-2">
                  <Text className="text-2xl font-bold text-yellow-500 block">{100 - result.sensitivity}</Text>
                  <Text className="text-xs text-gray-500 block">分</Text>
                </View>
              </View>
              <View className="flex items-center justify-between">
                <View className="flex items-center gap-2">
                  <View className="w-3 h-3 rounded-full bg-red-500" />
                  <Text className="text-sm text-gray-700 block">祛痘</Text>
                </View>
                <View className="flex items-center gap-2">
                  <Text className="text-2xl font-bold text-red-500 block">{100 - (result.acne || 0)}</Text>
                  <Text className="text-xs text-gray-500 block">分</Text>
                </View>
              </View>
              <View className="flex items-center justify-between">
                <View className="flex items-center gap-2">
                  <View className="w-3 h-3 rounded-full bg-purple-500" />
                  <Text className="text-sm text-gray-700 block">抗皱</Text>
                </View>
                <View className="flex items-center gap-2">
                  <Text className="text-2xl font-bold text-purple-500 block">{100 - (result.wrinkles || 0)}</Text>
                  <Text className="text-xs text-gray-500 block">分</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 主要问题 */}
          {result.concerns && result.concerns.length > 0 && (
            <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <Text className="text-lg font-semibold text-gray-800 mb-3 block">主要问题</Text>
              <View className="flex flex-wrap gap-2">
                {result.concerns.map((concern, index) => (
                  <View key={index} className="inline-flex items-center px-3 py-1.5 rounded-full bg-amber-100">
                    <Text className="text-sm text-amber-700 block">{concern}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 操作按钮 */}
          <View className="space-y-3 mb-8">
            <Button
              onClick={handleViewDetail}
              className="w-full bg-rose-400 text-white rounded-full py-4 font-medium"
            >
              下一步
            </Button>
            <Text className="text-sm text-gray-500 text-center block">查看详细报告</Text>

            <View className="flex gap-3">
              <Button
                onClick={handleViewRecommendations}
                className="flex-1 bg-white text-rose-400 border-2 border-rose-400 rounded-full py-3"
              >
                查看推荐
              </Button>
              <Button
                onClick={handleViewHistory}
                className="flex-1 bg-white text-gray-700 border-2 border-gray-200 rounded-full py-3"
              >
                历史记录
              </Button>
            </View>

            <Button
              onClick={handleReDetect}
              className="w-full bg-white text-gray-700 border-2 border-gray-200 rounded-full py-3"
            >
              重新检测
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

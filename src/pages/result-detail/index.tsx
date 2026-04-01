import { View, Text, Image, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import RadarChart from '@/components/RadarChart'
import OverallScore from '@/components/OverallScore'
import BackHomeNavBar from '@/components/BackHomeNavBar'

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

export default function ResultDetailPage() {
  const [result, setResult] = useState<SkinAnalysisResult | null>(null)
  const [imagePath, setImagePath] = useState('')

  useEffect(() => {
    const analysisResult = Taro.getStorageSync('skinAnalysisResult')
    const currentImage = Taro.getStorageSync('currentImagePath')

    if (analysisResult) {
      setResult(analysisResult)
      setImagePath(currentImage || '')
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

  const handleShare = () => {
    Taro.showToast({
      title: '分享功能开发中',
      icon: 'none'
    })
  }

  const handleDownload = () => {
    Taro.showToast({
      title: '报告下载中',
      icon: 'loading'
    })
    setTimeout(() => {
      Taro.showToast({
        title: '报告已保存',
        icon: 'success'
      })
    }, 1500)
  }

  if (!result) {
    return null
  }

  const statusBarHeight = Taro.getSystemInfoSync().statusBarHeight || 44
  const navBarHeight = statusBarHeight + 44

  return (
    <View className="min-h-screen bg-gray-50">
      {/* 自定义导航栏 */}
      <BackHomeNavBar
        title="详细报告"
        backgroundColor="#1E40AF"
        textColor="#FFFFFF"
      />

      {/* 导航栏占位 */}
      <View style={{ height: `${navBarHeight}px` }} />

      <ScrollView scrollY className="h-screen" style={{ height: `calc(100vh - ${navBarHeight}px)` }}>
        <View className="p-4">
          {/* 报告头部 */}
          <View className="bg-gradient-to-r from-blue-700 to-blue-800 rounded-2xl p-6 text-white mb-4">
            <Text className="text-2xl font-bold block">肌肤检测报告</Text>
            <Text className="text-sm opacity-90 block mt-2">
              {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>
          </View>

          {/* 综合评分 */}
          <OverallScore score={overallScore} rating={scoreRating} />

          {/* 面部图片 */}
          {imagePath && (
            <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <Text className="text-lg font-semibold text-gray-800 mb-3 block">检测图像</Text>
              <Image
                src={imagePath}
                mode="aspectFill"
                lazyLoad
                className="w-full h-80 rounded-xl"
              />
            </View>
          )}

          {/* 五维雷达图 */}
          <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <Text className="text-lg font-semibold text-gray-800 mb-4 block">五维雷达图</Text>
            <RadarChart data={getRadarData()} width={280} height={280} />
          </View>

          {/* 皮肤类型详情 */}
          <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <Text className="text-lg font-semibold text-gray-800 mb-3 block">皮肤类型</Text>
            <View className="bg-slate-50 rounded-xl p-4">
              <Text className="text-2xl font-bold text-blue-800 block mb-2">{result.skinType}</Text>
              <Text className="text-sm text-gray-600 block">
                {result.skinType === '干性' && '肌肤干燥，容易产生细纹，需要加强保湿'}
                {result.skinType === '油性' && '皮脂分泌旺盛，容易出油和长痘，需要控油祛痘'}
                {result.skinType === '混合性' && 'T区出油，两颊干燥，需要分区护理'}
                {result.skinType === '中性' && '水油平衡，状态理想，做好日常保养即可'}
                {result.skinType === '敏感性' && '肌肤屏障脆弱，容易受刺激，需要温和护理'}
              </Text>
            </View>
          </View>

          {/* 各项指标详细分析 */}
          <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <Text className="text-lg font-semibold text-gray-800 mb-4 block">各项指标详细分析</Text>
            <View className="space-y-4">
              {/* 水分 */}
              <View>
                <View className="flex items-center justify-between mb-2">
                  <View className="flex items-center gap-2">
                    <Text className="text-xl block">💧</Text>
                    <Text className="text-base font-medium text-gray-800 block">水分</Text>
                  </View>
                  <Text className={`text-xl font-bold ${result.moisture >= 60 ? 'text-green-500' : result.moisture >= 30 ? 'text-yellow-500' : 'text-red-500'} block`}>
                    {result.moisture}
                  </Text>
                </View>
                <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <View
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${result.moisture}%`,
                      backgroundColor: result.moisture >= 60 ? '#10B981' : result.moisture >= 30 ? '#F59E0B' : '#EF4444'
                    }}
                  />
                </View>
                <Text className="text-xs text-gray-500 block">
                  {result.moisture >= 60 ? '水分充足，状态良好' : result.moisture >= 30 ? '水分偏低，建议加强保湿' : '严重缺水，急需补水'}
                </Text>
              </View>

              {/* 油性 */}
              <View>
                <View className="flex items-center justify-between mb-2">
                  <View className="flex items-center gap-2">
                    <Text className="text-xl block">🛢️</Text>
                    <Text className="text-base font-medium text-gray-800 block">油性</Text>
                  </View>
                  <Text className={`text-xl font-bold ${result.oiliness <= 30 ? 'text-green-500' : result.oiliness <= 70 ? 'text-yellow-500' : 'text-red-500'} block`}>
                    {result.oiliness}
                  </Text>
                </View>
                <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <View
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${result.oiliness}%`,
                      backgroundColor: result.oiliness <= 30 ? '#10B981' : result.oiliness <= 70 ? '#F59E0B' : '#EF4444'
                    }}
                  />
                </View>
                <Text className="text-xs text-gray-500 block">
                  {result.oiliness <= 30 ? '出油少，需要补充油脂' : result.oiliness <= 70 ? '出油适中，保持平衡' : '出油较多，需要控油'}
                </Text>
              </View>

              {/* 敏感度 */}
              <View>
                <View className="flex items-center justify-between mb-2">
                  <View className="flex items-center gap-2">
                    <Text className="text-xl block">🌡️</Text>
                    <Text className="text-base font-medium text-gray-800 block">敏感度</Text>
                  </View>
                  <Text className={`text-xl font-bold ${result.sensitivity <= 20 ? 'text-green-500' : result.sensitivity <= 50 ? 'text-yellow-500' : 'text-red-500'} block`}>
                    {result.sensitivity}
                  </Text>
                </View>
                <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <View
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${result.sensitivity}%`,
                      backgroundColor: result.sensitivity <= 20 ? '#10B981' : result.sensitivity <= 50 ? '#F59E0B' : '#EF4444'
                    }}
                  />
                </View>
                <Text className="text-xs text-gray-500 block">
                  {result.sensitivity <= 20 ? '皮肤健康，不敏感' : result.sensitivity <= 50 ? '轻度敏感，需温和护理' : '高度敏感，需要加强屏障修复'}
                </Text>
              </View>

              {/* 痘痘 */}
              <View>
                <View className="flex items-center justify-between mb-2">
                  <View className="flex items-center gap-2">
                    <Text className="text-xl block">🔴</Text>
                    <Text className="text-base font-medium text-gray-800 block">痘痘</Text>
                  </View>
                  <Text className={`text-xl font-bold ${ (result.acne || 0) <= 10 ? 'text-green-500' : (result.acne || 0) <= 40 ? 'text-yellow-500' : 'text-red-500'} block`}>
                    {result.acne || 0}
                  </Text>
                </View>
                <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <View
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${result.acne || 0}%`,
                      backgroundColor: (result.acne || 0) <= 10 ? '#10B981' : (result.acne || 0) <= 40 ? '#F59E0B' : '#EF4444'
                    }}
                  />
                </View>
                <Text className="text-xs text-gray-500 block">
                  {(result.acne || 0) <= 10 ? '肌肤清爽，几乎无痘' : (result.acne || 0) <= 40 ? '有少量痘痘，需注意清洁' : '痘痘较多，建议进行专业祛痘护理'}
                </Text>
              </View>

              {/* 皱纹 */}
              <View>
                <View className="flex items-center justify-between mb-2">
                  <View className="flex items-center gap-2">
                    <Text className="text-xl block">🌀</Text>
                    <Text className="text-base font-medium text-gray-800 block">皱纹</Text>
                  </View>
                  <Text className={`text-xl font-bold ${ (result.wrinkles || 0) <= 20 ? 'text-green-500' : (result.wrinkles || 0) <= 50 ? 'text-yellow-500' : 'text-red-500'} block`}>
                    {result.wrinkles || 0}
                  </Text>
                </View>
                <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <View
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${result.wrinkles || 0}%`,
                      backgroundColor: (result.wrinkles || 0) <= 20 ? '#10B981' : (result.wrinkles || 0) <= 50 ? '#F59E0B' : '#EF4444'
                    }}
                  />
                </View>
                <Text className="text-xs text-gray-500 block">
                  {(result.wrinkles || 0) <= 20 ? '肌肤年轻，无皱纹' : (result.wrinkles || 0) <= 50 ? '有轻微皱纹，需预防老化' : '皱纹较多，建议抗皱护理'}
                </Text>
              </View>

              {/* 色斑 */}
              {result.spots !== undefined && (
                <View>
                  <View className="flex items-center justify-between mb-2">
                    <View className="flex items-center gap-2">
                      <Text className="text-xl block">🟤</Text>
                      <Text className="text-base font-medium text-gray-800 block">色斑</Text>
                    </View>
                    <Text className={`text-xl font-bold ${ result.spots <= 10 ? 'text-green-500' : result.spots <= 40 ? 'text-yellow-500' : 'text-red-500'} block`}>
                      {result.spots}
                    </Text>
                  </View>
                  <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <View
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${result.spots}%`,
                        backgroundColor: result.spots <= 10 ? '#10B981' : result.spots <= 40 ? '#F59E0B' : '#EF4444'
                      }}
                    />
                  </View>
                  <Text className="text-xs text-gray-500 block">
                    {result.spots <= 10 ? '肌肤洁净，无明显色斑' : result.spots <= 40 ? '有轻微色斑，需注意防晒' : '色斑明显，建议进行美白祛斑护理'}
                  </Text>
                </View>
              )}

              {/* 毛孔 */}
              {result.pores !== undefined && (
                <View>
                  <View className="flex items-center justify-between mb-2">
                    <View className="flex items-center gap-2">
                      <Text className="text-xl block">⚫</Text>
                      <Text className="text-base font-medium text-gray-800 block">毛孔</Text>
                    </View>
                    <Text className={`text-xl font-bold ${ result.pores <= 30 ? 'text-green-500' : result.pores <= 60 ? 'text-yellow-500' : 'text-red-500'} block`}>
                      {result.pores}
                    </Text>
                  </View>
                  <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <View
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${result.pores}%`,
                        backgroundColor: result.pores <= 30 ? '#10B981' : result.pores <= 60 ? '#F59E0B' : '#EF4444'
                      }}
                    />
                  </View>
                  <Text className="text-xs text-gray-500 block">
                    {result.pores <= 30 ? '毛孔细致，肤质细腻' : result.pores <= 60 ? '毛孔略大，需注意清洁' : '毛孔粗大，建议收缩毛孔护理'}
                  </Text>
                </View>
              )}

              {/* 黑头 */}
              {result.blackheads !== undefined && (
                <View>
                  <View className="flex items-center justify-between mb-2">
                    <View className="flex items-center gap-2">
                      <Text className="text-xl block">⚫</Text>
                      <Text className="text-base font-medium text-gray-800 block">黑头</Text>
                    </View>
                    <Text className={`text-xl font-bold ${ result.blackheads <= 20 ? 'text-green-500' : result.blackheads <= 50 ? 'text-yellow-500' : 'text-red-500'} block`}>
                      {result.blackheads}
                    </Text>
                  </View>
                  <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <View
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${result.blackheads}%`,
                        backgroundColor: result.blackheads <= 20 ? '#10B981' : result.blackheads <= 50 ? '#F59E0B' : '#EF4444'
                      }}
                    />
                  </View>
                  <Text className="text-xs text-gray-500 block">
                    {result.blackheads <= 20 ? '鼻头干净，几乎无黑头' : result.blackheads <= 50 ? '有少量黑头，需注意清洁' : '黑头较多，建议去黑头护理'}
                  </Text>
                </View>
              )}
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

          {/* 护肤建议 */}
          {result.recommendations && result.recommendations.length > 0 && (
            <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <Text className="text-lg font-semibold text-gray-800 mb-3 block">护肤建议</Text>
              <View className="space-y-2">
                {result.recommendations.map((rec, index) => (
                  <View key={index} className="flex items-start bg-gray-50 rounded-lg p-3">
                    <View className="w-6 h-6 rounded-full bg-blue-700 flex items-center justify-center mr-3 flex-shrink-0">
                      <Text className="text-white text-xs font-bold block">{index + 1}</Text>
                    </View>
                    <Text className="text-sm text-gray-700 flex-1 block">{rec}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 操作按钮 */}
          <View className="flex gap-3 mb-8">
            <Button
              onClick={handleShare}
              className="flex-1 bg-white text-gray-700 border-2 border-gray-200 rounded-full py-3"
            >
              分享报告
            </Button>
            <Button
              onClick={handleDownload}
              className="flex-1 bg-white text-gray-700 border-2 border-gray-200 rounded-full py-3"
            >
              下载报告
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

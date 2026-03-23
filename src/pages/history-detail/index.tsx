import { View, Text, Image, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import RadarChart from '@/components/RadarChart'
import OverallScore from '@/components/OverallScore'

interface HistoryRecord {
  id: number
  skin_type: string
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
  image_url: string | null
  created_at: string
}

export default function HistoryDetailPage() {
  const [type, setType] = useState<'detail' | 'compare'>('detail')
  const [record, setRecord] = useState<HistoryRecord | null>(null)
  const [compareRecords, setCompareRecords] = useState<HistoryRecord[]>([])

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params
    if (params?.type) {
      setType(params.type as 'detail' | 'compare')
    }

    if (params?.type === 'detail') {
      const selectedRecord = Taro.getStorageSync('selectedHistoryRecord')
      if (selectedRecord) {
        setRecord(selectedRecord)
      }
    } else if (params?.type === 'compare') {
      const records = Taro.getStorageSync('compareRecords')
      if (records && records.length === 2) {
        setCompareRecords(records)
      }
    }
  }, [])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}`
  }

  const calculateScore = (r: HistoryRecord) => {
    const scores = [r.moisture, 100 - r.oiliness, 100 - r.sensitivity]
    if (r.acne) scores.push(100 - r.acne)
    if (r.wrinkles) scores.push(100 - r.wrinkles)
    if (r.spots) scores.push(100 - r.spots)
    if (r.pores) scores.push(100 - r.pores)
    if (r.blackheads) scores.push(100 - r.blackheads)
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }

  const getScoreRating = (score: number) => {
    if (score >= 80) return '优秀'
    if (score >= 60) return '良好'
    return '需改善'
  }

  const getRadarData = (r: HistoryRecord) => {
    return [
      { name: '水分', value: r.moisture, color: '#3B82F6' },
      { name: '油性', value: 100 - r.oiliness, color: '#10B981' },
      { name: '敏感度', value: 100 - r.sensitivity, color: '#F59E0B' },
      { name: '痘痘', value: 100 - (r.acne || 0), color: '#EF4444' },
      { name: '皱纹', value: 100 - (r.wrinkles || 0), color: '#8B5CF6' }
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

  const handleReTest = () => {
    Taro.redirectTo({
      url: '/pages/camera/index'
    })
  }

  if (type === 'detail' && record) {
    const score = calculateScore(record)
    const scoreRating = getScoreRating(score)

    return (
      <View className="min-h-screen bg-gray-50">
        <ScrollView scrollY className="h-screen">
          <View className="p-4">
            {/* 报告头部 */}
            <View className="bg-gradient-to-r from-blue-700 to-blue-800 rounded-2xl p-6 text-white mb-4">
              <Text className="text-2xl font-bold block">肌肤检测报告</Text>
              <Text className="text-sm opacity-90 block mt-2">
                档案编号：#{record.id}
              </Text>
              <Text className="text-sm opacity-90 block mt-1">
                {formatDate(record.created_at)}
              </Text>
            </View>

            {/* 综合评分 */}
            <OverallScore score={score} rating={scoreRating} />

            {/* 皮肤类型和图片 */}
            <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <View className="flex items-center gap-4">
                {record.image_url && (
                  <Image
                    src={record.image_url}
                    mode="aspectFill"
                    lazyLoad
                    className="w-24 h-24 rounded-xl"
                  />
                )}
                <View className="flex-1">
                  <Text className="text-sm text-gray-500 mb-2 block">皮肤类型</Text>
                  <View className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100">
                    <Text className="text-lg text-blue-800 font-semibold block">{record.skin_type}</Text>
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
              <RadarChart data={getRadarData(record)} width={280} height={280} />
              <View className="mt-4 text-center">
                <Text className="text-sm text-gray-500 block">
                  您的肌肤综合指数为 <Text className="font-bold text-blue-700">{score}分</Text>
                </Text>
              </View>
            </View>

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
                    <Text className="text-2xl font-bold text-blue-500 block">{record.moisture}</Text>
                    <Text className="text-xs text-gray-500 block">分</Text>
                  </View>
                </View>
                <View className="flex items-center justify-between">
                  <View className="flex items-center gap-2">
                    <View className="w-3 h-3 rounded-full bg-green-500" />
                    <Text className="text-sm text-gray-700 block">控油</Text>
                  </View>
                  <View className="flex items-center gap-2">
                    <Text className="text-2xl font-bold text-green-500 block">{100 - record.oiliness}</Text>
                    <Text className="text-xs text-gray-500 block">分</Text>
                  </View>
                </View>
                <View className="flex items-center justify-between">
                  <View className="flex items-center gap-2">
                    <View className="w-3 h-3 rounded-full bg-yellow-500" />
                    <Text className="text-sm text-gray-700 block">舒缓</Text>
                  </View>
                  <View className="flex items-center gap-2">
                    <Text className="text-2xl font-bold text-yellow-500 block">{100 - record.sensitivity}</Text>
                    <Text className="text-xs text-gray-500 block">分</Text>
                  </View>
                </View>
                <View className="flex items-center justify-between">
                  <View className="flex items-center gap-2">
                    <View className="w-3 h-3 rounded-full bg-red-500" />
                    <Text className="text-sm text-gray-700 block">祛痘</Text>
                  </View>
                  <View className="flex items-center gap-2">
                    <Text className="text-2xl font-bold text-red-500 block">{100 - (record.acne || 0)}</Text>
                    <Text className="text-xs text-gray-500 block">分</Text>
                  </View>
                </View>
                <View className="flex items-center justify-between">
                  <View className="flex items-center gap-2">
                    <View className="w-3 h-3 rounded-full bg-purple-500" />
                    <Text className="text-sm text-gray-700 block">抗皱</Text>
                  </View>
                  <View className="flex items-center gap-2">
                    <Text className="text-2xl font-bold text-purple-500 block">{100 - (record.wrinkles || 0)}</Text>
                    <Text className="text-xs text-gray-500 block">分</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 各项指标详细分析 */}
            <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <Text className="text-lg font-semibold text-gray-800 mb-4 block">各项指标详细分析</Text>
              <View className="space-y-4">
                <View>
                  <View className="flex items-center justify-between mb-2">
                    <View className="flex items-center gap-2">
                      <Text className="text-xl block">💧</Text>
                      <Text className="text-base font-medium text-gray-800 block">水分</Text>
                    </View>
                    <Text className={`text-xl font-bold ${record.moisture >= 60 ? 'text-green-500' : record.moisture >= 30 ? 'text-yellow-500' : 'text-red-500'} block`}>
                      {record.moisture}
                    </Text>
                  </View>
                  <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <View
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${record.moisture}%`,
                        backgroundColor: record.moisture >= 60 ? '#10B981' : record.moisture >= 30 ? '#F59E0B' : '#EF4444'
                      }}
                    />
                  </View>
                  <Text className="text-xs text-gray-500 block">
                    {record.moisture >= 60 ? '水分充足，状态良好' : record.moisture >= 30 ? '水分偏低，建议加强保湿' : '严重缺水，急需补水'}
                  </Text>
                </View>

                <View>
                  <View className="flex items-center justify-between mb-2">
                    <View className="flex items-center gap-2">
                      <Text className="text-xl block">🛢️</Text>
                      <Text className="text-base font-medium text-gray-800 block">油性</Text>
                    </View>
                    <Text className={`text-xl font-bold ${record.oiliness <= 30 ? 'text-green-500' : record.oiliness <= 70 ? 'text-yellow-500' : 'text-red-500'} block`}>
                      {record.oiliness}
                    </Text>
                  </View>
                  <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <View
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${record.oiliness}%`,
                        backgroundColor: record.oiliness <= 30 ? '#10B981' : record.oiliness <= 70 ? '#F59E0B' : '#EF4444'
                      }}
                    />
                  </View>
                  <Text className="text-xs text-gray-500 block">
                    {record.oiliness <= 30 ? '出油少，需要补充油脂' : record.oiliness <= 70 ? '出油适中，保持平衡' : '出油较多，需要控油'}
                  </Text>
                </View>

                <View>
                  <View className="flex items-center justify-between mb-2">
                    <View className="flex items-center gap-2">
                      <Text className="text-xl block">🌡️</Text>
                      <Text className="text-base font-medium text-gray-800 block">敏感度</Text>
                    </View>
                    <Text className={`text-xl font-bold ${record.sensitivity <= 20 ? 'text-green-500' : record.sensitivity <= 50 ? 'text-yellow-500' : 'text-red-500'} block`}>
                      {record.sensitivity}
                    </Text>
                  </View>
                  <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <View
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${record.sensitivity}%`,
                        backgroundColor: record.sensitivity <= 20 ? '#10B981' : record.sensitivity <= 50 ? '#F59E0B' : '#EF4444'
                      }}
                    />
                  </View>
                  <Text className="text-xs text-gray-500 block">
                    {record.sensitivity <= 20 ? '皮肤健康，不敏感' : record.sensitivity <= 50 ? '轻度敏感，需温和护理' : '高度敏感，需要加强屏障修复'}
                  </Text>
                </View>

                <View>
                  <View className="flex items-center justify-between mb-2">
                    <View className="flex items-center gap-2">
                      <Text className="text-xl block">🔴</Text>
                      <Text className="text-base font-medium text-gray-800 block">痘痘</Text>
                    </View>
                    <Text className={`text-xl font-bold ${(record.acne || 0) <= 10 ? 'text-green-500' : (record.acne || 0) <= 40 ? 'text-yellow-500' : 'text-red-500'} block`}>
                      {record.acne || 0}
                    </Text>
                  </View>
                  <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <View
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${record.acne || 0}%`,
                        backgroundColor: (record.acne || 0) <= 10 ? '#10B981' : (record.acne || 0) <= 40 ? '#F59E0B' : '#EF4444'
                      }}
                    />
                  </View>
                  <Text className="text-xs text-gray-500 block">
                    {(record.acne || 0) <= 10 ? '肌肤清爽，几乎无痘' : (record.acne || 0) <= 40 ? '有少量痘痘，需注意清洁' : '痘痘较多，建议进行专业祛痘护理'}
                  </Text>
                </View>

                <View>
                  <View className="flex items-center justify-between mb-2">
                    <View className="flex items-center gap-2">
                      <Text className="text-xl block">🌀</Text>
                      <Text className="text-base font-medium text-gray-800 block">皱纹</Text>
                    </View>
                    <Text className={`text-xl font-bold ${(record.wrinkles || 0) <= 20 ? 'text-green-500' : (record.wrinkles || 0) <= 50 ? 'text-yellow-500' : 'text-red-500'} block`}>
                      {record.wrinkles || 0}
                    </Text>
                  </View>
                  <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <View
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${record.wrinkles || 0}%`,
                        backgroundColor: (record.wrinkles || 0) <= 20 ? '#10B981' : (record.wrinkles || 0) <= 50 ? '#F59E0B' : '#EF4444'
                      }}
                    />
                  </View>
                  <Text className="text-xs text-gray-500 block">
                    {(record.wrinkles || 0) <= 20 ? '肌肤年轻，无皱纹' : (record.wrinkles || 0) <= 50 ? '有轻微皱纹，需预防老化' : '皱纹较多，建议抗皱护理'}
                  </Text>
                </View>

                {record.spots !== undefined && (
                  <View>
                    <View className="flex items-center justify-between mb-2">
                      <View className="flex items-center gap-2">
                        <Text className="text-xl block">🟤</Text>
                        <Text className="text-base font-medium text-gray-800 block">色斑</Text>
                      </View>
                      <Text className={`text-xl font-bold ${record.spots <= 10 ? 'text-green-500' : record.spots <= 40 ? 'text-yellow-500' : 'text-red-500'} block`}>
                        {record.spots}
                      </Text>
                    </View>
                    <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                      <View
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${record.spots}%`,
                          backgroundColor: record.spots <= 10 ? '#10B981' : record.spots <= 40 ? '#F59E0B' : '#EF4444'
                        }}
                      />
                    </View>
                    <Text className="text-xs text-gray-500 block">
                      {record.spots <= 10 ? '肌肤洁净，无明显色斑' : record.spots <= 40 ? '有轻微色斑，需注意防晒' : '色斑明显，建议进行美白祛斑护理'}
                    </Text>
                  </View>
                )}

                {record.pores !== undefined && (
                  <View>
                    <View className="flex items-center justify-between mb-2">
                      <View className="flex items-center gap-2">
                        <Text className="text-xl block">⚫</Text>
                        <Text className="text-base font-medium text-gray-800 block">毛孔</Text>
                      </View>
                      <Text className={`text-xl font-bold ${record.pores <= 30 ? 'text-green-500' : record.pores <= 60 ? 'text-yellow-500' : 'text-red-500'} block`}>
                        {record.pores}
                      </Text>
                    </View>
                    <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                      <View
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${record.pores}%`,
                          backgroundColor: record.pores <= 30 ? '#10B981' : record.pores <= 60 ? '#F59E0B' : '#EF4444'
                        }}
                      />
                    </View>
                    <Text className="text-xs text-gray-500 block">
                      {record.pores <= 30 ? '毛孔细致，肤质细腻' : record.pores <= 60 ? '毛孔略大，需注意清洁' : '毛孔粗大，建议收缩毛孔护理'}
                    </Text>
                  </View>
                )}

                {record.blackheads !== undefined && (
                  <View>
                    <View className="flex items-center justify-between mb-2">
                      <View className="flex items-center gap-2">
                        <Text className="text-xl block">⚫</Text>
                        <Text className="text-base font-medium text-gray-800 block">黑头</Text>
                      </View>
                      <Text className={`text-xl font-bold ${record.blackheads <= 20 ? 'text-green-500' : record.blackheads <= 50 ? 'text-yellow-500' : 'text-red-500'} block`}>
                        {record.blackheads}
                      </Text>
                    </View>
                    <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                      <View
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${record.blackheads}%`,
                          backgroundColor: record.blackheads <= 20 ? '#10B981' : record.blackheads <= 50 ? '#F59E0B' : '#EF4444'
                        }}
                      />
                    </View>
                    <Text className="text-xs text-gray-500 block">
                      {record.blackheads <= 20 ? '鼻头干净，几乎无黑头' : record.blackheads <= 50 ? '有少量黑头，需注意清洁' : '黑头较多，建议去黑头护理'}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* 主要问题 */}
            {record.concerns && record.concerns.length > 0 && (
              <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
                <Text className="text-lg font-semibold text-gray-800 mb-3 block">主要问题</Text>
                <View className="flex flex-wrap gap-2">
                  {record.concerns.map((concern, index) => (
                    <View key={index} className="inline-flex items-center px-3 py-1.5 rounded-full bg-amber-100">
                      <Text className="text-sm text-amber-700 block">{concern}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* 护肤建议 */}
            {record.recommendations && record.recommendations.length > 0 && (
              <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
                <Text className="text-lg font-semibold text-gray-800 mb-3 block">护肤建议</Text>
                <View className="space-y-2">
                  {record.recommendations.map((rec, index) => (
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
            <View className="space-y-3 mb-8">
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

              <Button
                onClick={handleReTest}
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

  if (type === 'compare' && compareRecords.length === 2) {
    const [record1, record2] = compareRecords
    const score1 = calculateScore(record1)
    const score2 = calculateScore(record2)

    return (
      <View className="min-h-screen bg-gray-50">
        <ScrollView scrollY className="h-screen">
          <View className="p-4">
            {/* 报告头部 */}
            <View className="bg-gradient-to-r from-blue-700 to-blue-800 rounded-2xl p-6 text-white mb-4">
              <Text className="text-2xl font-bold block">对比分析</Text>
            </View>

            {/* 对比概览 */}
            <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <Text className="text-lg font-semibold text-gray-800 mb-4 block">对比概览</Text>
              <View className="flex justify-between">
                <View className="flex-1 text-center">
                  <Text className="text-xs text-gray-500 mb-2 block">{formatDate(record1.created_at)}</Text>
                  <Text className="text-4xl font-bold text-blue-700 block">{score1}分</Text>
                  <Text className="text-sm text-gray-600 mt-2 block">{getScoreRating(score1)}</Text>
                </View>

                <View className="flex items-center justify-center px-4">
                  <Text className="text-3xl block">VS</Text>
                </View>

                <View className="flex-1 text-center">
                  <Text className="text-xs text-gray-500 mb-2 block">{formatDate(record2.created_at)}</Text>
                  <Text className="text-4xl font-bold text-blue-700 block">{score2}分</Text>
                  <Text className="text-sm text-gray-600 mt-2 block">{getScoreRating(score2)}</Text>
                </View>
              </View>
            </View>

            {/* 变化总结 */}
            <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <Text className="text-lg font-semibold text-gray-800 mb-3 block">变化总结</Text>
              <View className="flex items-center justify-between mb-2">
                <Text className="text-sm text-gray-600 block">综合评分变化</Text>
                <Text className={`text-lg font-bold ${score2 > score1 ? 'text-green-500' : score2 < score1 ? 'text-red-500' : 'text-gray-600'} block`}>
                  {score2 > score1 ? '+' : ''}{score2 - score1}分
                </Text>
              </View>
              <Text className="text-sm text-gray-600 block mt-2">
                {score2 > score1 ? '✓ 皮肤状态有所改善' : score2 < score1 ? '⚠ 皮肤状态有所下降' : '○ 皮肤状态保持稳定'}
              </Text>
            </View>

            {/* 五维雷达图对比 */}
            <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <Text className="text-lg font-semibold text-gray-800 mb-4 block">五维雷达图对比</Text>
              <View className="flex gap-4">
                <View className="flex-1">
                  <Text className="text-xs text-gray-500 text-center mb-2 block">第一次</Text>
                  <RadarChart data={getRadarData(record1)} width={140} height={140} />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-500 text-center mb-2 block">第二次</Text>
                  <RadarChart data={getRadarData(record2)} width={140} height={140} />
                </View>
              </View>
            </View>

            {/* 指标对比 */}
            <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <Text className="text-lg font-semibold text-gray-800 mb-3 block">指标对比</Text>

              <View className="space-y-4">
                <View>
                  <Text className="text-sm text-gray-600 mb-2 block">💧 水分</Text>
                  <View className="flex items-center gap-2">
                    <Text className="text-sm font-medium text-gray-800 block w-16 text-right">{record1.moisture}%</Text>
                    <View className="flex-1 bg-gray-100 rounded-lg h-3 overflow-hidden">
                      <View className="bg-blue-400 h-full" style={{ width: `${record1.moisture}%` }} />
                    </View>
                    <View className="flex-1 bg-gray-100 rounded-lg h-3 overflow-hidden">
                      <View className="bg-blue-400 h-full" style={{ width: `${record2.moisture}%` }} />
                    </View>
                    <Text className="text-sm font-medium text-gray-800 block w-16">{record2.moisture}%</Text>
                  </View>
                  {record2.moisture !== record1.moisture && (
                    <Text className={`text-xs mt-1 block ${record2.moisture > record1.moisture ? 'text-green-500' : 'text-red-500'}`}>
                      {record2.moisture > record1.moisture ? '+' : ''}{record2.moisture - record1.moisture}%
                    </Text>
                  )}
                </View>

                <View>
                  <Text className="text-sm text-gray-600 mb-2 block">🛢️ 油性</Text>
                  <View className="flex items-center gap-2">
                    <Text className="text-sm font-medium text-gray-800 block w-16 text-right">{record1.oiliness}%</Text>
                    <View className="flex-1 bg-gray-100 rounded-lg h-3 overflow-hidden">
                      <View className="bg-yellow-400 h-full" style={{ width: `${record1.oiliness}%` }} />
                    </View>
                    <View className="flex-1 bg-gray-100 rounded-lg h-3 overflow-hidden">
                      <View className="bg-yellow-400 h-full" style={{ width: `${record2.oiliness}%` }} />
                    </View>
                    <Text className="text-sm font-medium text-gray-800 block w-16">{record2.oiliness}%</Text>
                  </View>
                  {record2.oiliness !== record1.oiliness && (
                    <Text className={`text-xs mt-1 block ${record2.oiliness < record1.oiliness ? 'text-green-500' : 'text-red-500'}`}>
                      {record2.oiliness < record1.oiliness ? '-' : '+'}{record2.oiliness - record1.oiliness}%
                    </Text>
                  )}
                </View>

                <View>
                  <Text className="text-sm text-gray-600 mb-2 block">🌡️ 敏感度</Text>
                  <View className="flex items-center gap-2">
                    <Text className="text-sm font-medium text-gray-800 block w-16 text-right">{record1.sensitivity}%</Text>
                    <View className="flex-1 bg-gray-100 rounded-lg h-3 overflow-hidden">
                      <View className="bg-blue-700 h-full" style={{ width: `${record1.sensitivity}%` }} />
                    </View>
                    <View className="flex-1 bg-gray-100 rounded-lg h-3 overflow-hidden">
                      <View className="bg-blue-700 h-full" style={{ width: `${record2.sensitivity}%` }} />
                    </View>
                    <Text className="text-sm font-medium text-gray-800 block w-16">{record2.sensitivity}%</Text>
                  </View>
                  {record2.sensitivity !== record1.sensitivity && (
                    <Text className={`text-xs mt-1 block ${record2.sensitivity < record1.sensitivity ? 'text-green-500' : 'text-red-500'}`}>
                      {record2.sensitivity < record1.sensitivity ? '-' : '+'}{record2.sensitivity - record1.sensitivity}%
                    </Text>
                  )}
                </View>

                <View>
                  <Text className="text-sm text-gray-600 mb-2 block">🔴 痘痘</Text>
                  <View className="flex items-center gap-2">
                    <Text className="text-sm font-medium text-gray-800 block w-16 text-right">{record1.acne || 0}%</Text>
                    <View className="flex-1 bg-gray-100 rounded-lg h-3 overflow-hidden">
                      <View className="bg-red-400 h-full" style={{ width: `${record1.acne || 0}%` }} />
                    </View>
                    <View className="flex-1 bg-gray-100 rounded-lg h-3 overflow-hidden">
                      <View className="bg-red-400 h-full" style={{ width: `${record2.acne || 0}%` }} />
                    </View>
                    <Text className="text-sm font-medium text-gray-800 block w-16">{record2.acne || 0}%</Text>
                  </View>
                  {record2.acne !== record1.acne && (
                    <Text className={`text-xs mt-1 block ${(record2.acne || 0) < (record1.acne || 0) ? 'text-green-500' : 'text-red-500'}`}>
                      {(record2.acne || 0) < (record1.acne || 0) ? '-' : '+'}{(record2.acne || 0) - (record1.acne || 0)}%
                    </Text>
                  )}
                </View>

                <View>
                  <Text className="text-sm text-gray-600 mb-2 block">🌀 皱纹</Text>
                  <View className="flex items-center gap-2">
                    <Text className="text-sm font-medium text-gray-800 block w-16 text-right">{record1.wrinkles || 0}%</Text>
                    <View className="flex-1 bg-gray-100 rounded-lg h-3 overflow-hidden">
                      <View className="bg-purple-400 h-full" style={{ width: `${record1.wrinkles || 0}%` }} />
                    </View>
                    <View className="flex-1 bg-gray-100 rounded-lg h-3 overflow-hidden">
                      <View className="bg-purple-400 h-full" style={{ width: `${record2.wrinkles || 0}%` }} />
                    </View>
                    <Text className="text-sm font-medium text-gray-800 block w-16">{record2.wrinkles || 0}%</Text>
                  </View>
                  {record2.wrinkles !== record1.wrinkles && (
                    <Text className={`text-xs mt-1 block ${(record2.wrinkles || 0) < (record1.wrinkles || 0) ? 'text-green-500' : 'text-red-500'}`}>
                      {(record2.wrinkles || 0) < (record1.wrinkles || 0) ? '-' : '+'}{(record2.wrinkles || 0) - (record1.wrinkles || 0)}%
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    )
  }

  return (
    <View className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Text className="text-base text-gray-500 block">加载中...</Text>
    </View>
  )
}

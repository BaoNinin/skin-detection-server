import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'

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

  if (type === 'detail' && record) {
    const score = calculateScore(record)

    return (
      <View className="min-h-screen bg-rose-50 pb-6">
        <ScrollView scrollY>
          <View className="p-4">
            <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <Text className="text-lg font-semibold text-gray-800 mb-2 block">检测时间</Text>
              <Text className="text-sm text-gray-500 block">{formatDate(record.created_at)}</Text>

              <View className="border-t border-gray-100 mt-4 pt-4">
                <Text className="text-lg font-semibold text-gray-800 mb-2 block">皮肤类型</Text>
                <View className="inline-flex items-center px-3 py-1 rounded-full bg-rose-100">
                  <Text className="text-base text-rose-600 font-medium block">{record.skin_type}</Text>
                </View>
              </View>
            </View>

            <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <Text className="text-lg font-semibold text-gray-800 mb-3 block">综合评分</Text>
              <Text className="text-4xl font-bold text-rose-400 block">{score}分</Text>
            </View>

            <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <Text className="text-lg font-semibold text-gray-800 mb-3 block">各项指标</Text>

              <View className="space-y-3">
                <View>
                  <View className="flex justify-between mb-1">
                    <Text className="text-sm text-gray-600 block">💧 水分</Text>
                    <Text className="text-sm font-medium text-gray-800 block">{record.moisture}%</Text>
                  </View>
                  <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <View className="h-full bg-blue-400 rounded-full" style={{ width: `${record.moisture}%` }} />
                  </View>
                </View>

                <View>
                  <View className="flex justify-between mb-1">
                    <Text className="text-sm text-gray-600 block">🛢️ 油性</Text>
                    <Text className="text-sm font-medium text-gray-800 block">{record.oiliness}%</Text>
                  </View>
                  <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <View className="h-full bg-yellow-400 rounded-full" style={{ width: `${record.oiliness}%` }} />
                  </View>
                </View>

                <View>
                  <View className="flex justify-between mb-1">
                    <Text className="text-sm text-gray-600 block">🌡️ 敏感度</Text>
                    <Text className="text-sm font-medium text-gray-800 block">{record.sensitivity}%</Text>
                  </View>
                  <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <View className="h-full bg-rose-400 rounded-full" style={{ width: `${record.sensitivity}%` }} />
                  </View>
                </View>
              </View>
            </View>

            {record.concerns && record.concerns.length > 0 && (
              <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
                <Text className="text-lg font-semibold text-gray-800 mb-3 block">皮肤问题</Text>
                <View className="flex flex-wrap gap-2">
                  {record.concerns.map((concern, index) => (
                    <View key={index} className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100">
                      <Text className="text-sm text-amber-600 block">{concern}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {record.recommendations && record.recommendations.length > 0 && (
              <View className="bg-white rounded-2xl p-4 shadow-sm">
                <Text className="text-lg font-semibold text-gray-800 mb-3 block">护肤建议</Text>
                {record.recommendations.map((rec, index) => (
                  <View key={index} className="flex items-start mb-2">
                    <Text className="text-rose-400 mr-2 block">•</Text>
                    <Text className="text-sm text-gray-700 flex-1 block">{rec}</Text>
                  </View>
                ))}
              </View>
            )}
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
      <View className="min-h-screen bg-rose-50 pb-6">
        <ScrollView scrollY>
          <View className="p-4">
            <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <Text className="text-lg font-semibold text-gray-800 mb-4 block">对比分析</Text>

              <View className="flex justify-between">
                <View className="flex-1 text-center">
                  <Text className="text-sm text-gray-500 mb-2 block">{formatDate(record1.created_at)}</Text>
                  <Text className="text-4xl font-bold text-rose-400 block">{score1}分</Text>
                </View>

                <View className="flex items-center justify-center px-4">
                  <Text className="text-3xl block">VS</Text>
                </View>

                <View className="flex-1 text-center">
                  <Text className="text-sm text-gray-500 mb-2 block">{formatDate(record2.created_at)}</Text>
                  <Text className="text-4xl font-bold text-rose-400 block">{score2}分</Text>
                </View>
              </View>
            </View>

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
                </View>

                <View>
                  <Text className="text-sm text-gray-600 mb-2 block">🌡️ 敏感度</Text>
                  <View className="flex items-center gap-2">
                    <Text className="text-sm font-medium text-gray-800 block w-16 text-right">{record1.sensitivity}%</Text>
                    <View className="flex-1 bg-gray-100 rounded-lg h-3 overflow-hidden">
                      <View className="bg-rose-400 h-full" style={{ width: `${record1.sensitivity}%` }} />
                    </View>
                    <View className="flex-1 bg-gray-100 rounded-lg h-3 overflow-hidden">
                      <View className="bg-rose-400 h-full" style={{ width: `${record2.sensitivity}%` }} />
                    </View>
                    <Text className="text-sm font-medium text-gray-800 block w-16">{record2.sensitivity}%</Text>
                  </View>
                </View>
              </View>
            </View>

            <View className="bg-white rounded-2xl p-4 shadow-sm">
              <Text className="text-lg font-semibold text-gray-800 mb-3 block">变化总结</Text>
              <Text className="text-sm text-gray-600 block">
                综合评分变化：{score2 > score1 ? '+' : ''}{score2 - score1}分
              </Text>
              <Text className="text-sm text-gray-600 mt-2 block">
                {score2 > score1 ? '✓ 皮肤状态有所改善' : score2 < score1 ? '⚠ 皮肤状态有所下降' : '○ 皮肤状态保持稳定'}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    )
  }

  return (
    <View className="min-h-screen bg-rose-50 flex items-center justify-center">
      <Text className="text-base text-gray-500 block">加载中...</Text>
    </View>
  )
}

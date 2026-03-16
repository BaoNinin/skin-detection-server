import { View, Text } from '@tarojs/components'

interface ComparisonData {
  label: string
  record: {
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
    score: number
    date: string
  }
}

interface ComparisonChartProps {
  data: ComparisonData[]
}

export default function ComparisonChart({ data }: ComparisonChartProps) {
  if (data.length !== 2) {
    return null
  }

  const [record1, record2] = data

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const calculateImprovement = (value1: number, value2: number, higherIsBetter: boolean) => {
    const diff = value2 - value1
    if (higherIsBetter) {
      return {
        value: diff,
        improved: diff > 0,
        percent: Math.round((diff / value1) * 100)
      }
    } else {
      return {
        value: -diff,
        improved: diff < 0,
        percent: Math.round((-diff / value1) * 100)
      }
    }
  }

  const improvement = calculateImprovement(record1.record.score, record2.record.score, true)

  const metrics = [
    { name: '综合分数', key: 'score' as const, higherIsBetter: true, color: 'rose' },
    { name: '水分', key: 'moisture' as const, higherIsBetter: true, color: 'blue' },
    { name: '油性', key: 'oiliness' as const, higherIsBetter: false, color: 'yellow' },
    { name: '敏感度', key: 'sensitivity' as const, higherIsBetter: false, color: 'red' },
    { name: '痘痘', key: 'acne' as const, higherIsBetter: false, color: 'orange' },
    { name: '皱纹', key: 'wrinkles' as const, higherIsBetter: false, color: 'purple' },
    { name: '色斑', key: 'spots' as const, higherIsBetter: false, color: 'amber' },
    { name: '毛孔', key: 'pores' as const, higherIsBetter: false, color: 'gray' },
    { name: '黑头', key: 'blackheads' as const, higherIsBetter: false, color: 'stone' }
  ]

  return (
    <View className="w-full space-y-4">
      {/* 对比标题 */}
      <View className="bg-gradient-to-r from-rose-400 to-pink-500 rounded-xl p-4 text-white">
        <Text className="text-lg font-semibold block">检测对比</Text>
        <Text className="text-sm opacity-90 mt-1 block">
          对比两次检测结果，了解肌肤变化
        </Text>
      </View>

      {/* 记录信息 */}
      <View className="bg-white rounded-xl p-4 shadow-sm">
        <View className="grid grid-cols-2 gap-4">
          <View className="text-center p-3 bg-rose-50 rounded-lg">
            <Text className="text-xs text-gray-500 block mb-1">{record1.label}</Text>
            <Text className="text-sm text-gray-700 block">{formatDate(record1.record.date)}</Text>
            <Text className="text-lg font-bold text-rose-400 block mt-2">{record1.record.score}分</Text>
          </View>
          <View className="text-center p-3 bg-pink-50 rounded-lg">
            <Text className="text-xs text-gray-500 block mb-1">{record2.label}</Text>
            <Text className="text-sm text-gray-700 block">{formatDate(record2.record.date)}</Text>
            <Text className="text-lg font-bold text-pink-500 block mt-2">{record2.record.score}分</Text>
          </View>
        </View>

        {/* 改善概览 */}
        <View className="mt-4 p-3 bg-blue-50 rounded-lg">
          <Text className="text-sm text-blue-700 text-center block">
            {improvement.improved ? '📈' : '📉'} 综合分数{' '}
            <Text className="font-bold">{improvement.improved ? '提升' : '下降'}</Text>
            <Text className="font-bold"> {Math.abs(improvement.percent)}%</Text>
          </Text>
        </View>
      </View>

      {/* 指标对比 */}
      <View className="bg-white rounded-xl p-4 shadow-sm space-y-4">
        <Text className="text-base font-semibold text-gray-800 block">指标对比</Text>

        {metrics.map((metric) => {
          const value1 = record1.record[metric.key] || 0
          const value2 = record2.record[metric.key] || 0
          
          // 如果两个值都是 0 或 undefined，跳过
          if (value1 === 0 && value2 === 0) return null

          const metricImprovement = calculateImprovement(value1, value2, metric.higherIsBetter)
          const barColor = metric.color === 'rose' ? 'bg-rose-400' :
                          metric.color === 'blue' ? 'bg-blue-400' :
                          metric.color === 'yellow' ? 'bg-yellow-400' :
                          metric.color === 'red' ? 'bg-red-400' :
                          metric.color === 'orange' ? 'bg-orange-400' :
                          metric.color === 'purple' ? 'bg-purple-400' :
                          metric.color === 'amber' ? 'bg-amber-400' :
                          metric.color === 'gray' ? 'bg-gray-400' : 'bg-stone-400'

          return (
            <View key={metric.key}>
              <View className="flex items-center justify-between mb-2">
                <Text className="text-sm text-gray-700 block">{metric.name}</Text>
                <View className="flex items-center gap-2">
                  <Text className="text-sm text-gray-500 block">{value1}</Text>
                  <Text className="text-xs text-gray-400 block">→</Text>
                  <Text className={`text-sm font-medium ${metricImprovement.improved ? 'text-green-500' : 'text-red-500'} block`}>
                    {value2}
                  </Text>
                  <Text className={`text-xs ${metricImprovement.improved ? 'text-green-500' : 'text-red-500'} block`}>
                    {metricImprovement.improved ? '↑' : '↓'} {Math.abs(metricImprovement.percent)}%
                  </Text>
                </View>
              </View>
              
              {/* 对比条形图 */}
              <View className="flex gap-2 h-6">
                <View className="flex-1 bg-gray-100 rounded-lg overflow-hidden relative">
                  <View
                    className={`h-full ${barColor} opacity-70 rounded-lg transition-all`}
                    style={{ width: `${value1}%` }}
                  />
                  <Text className="absolute inset-0 flex items-center justify-center text-xs text-gray-600 font-medium">
                    {record1.label}
                  </Text>
                </View>
                <View className="flex-1 bg-gray-100 rounded-lg overflow-hidden relative">
                  <View
                    className={`h-full ${barColor} rounded-lg transition-all`}
                    style={{ width: `${value2}%` }}
                  />
                  <Text className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                    {record2.label}
                  </Text>
                </View>
              </View>
            </View>
          )
        })}
      </View>

      {/* 问题对比 */}
      <View className="bg-white rounded-xl p-4 shadow-sm">
        <Text className="text-base font-semibold text-gray-800 mb-3 block">问题变化</Text>
        
        <View className="grid grid-cols-2 gap-4">
          <View>
            <Text className="text-xs text-gray-500 block mb-2">{record1.label}</Text>
            {record1.record.concerns && record1.record.concerns.length > 0 ? (
              <View className="space-y-1">
                {record1.record.concerns.map((concern, idx) => (
                  <View key={idx} className="inline-flex items-center px-2 py-1 rounded-full bg-amber-100 mr-1">
                    <Text className="text-xs text-amber-600 block">{concern}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-xs text-gray-400 block">无问题</Text>
            )}
          </View>
          
          <View>
            <Text className="text-xs text-gray-500 block mb-2">{record2.label}</Text>
            {record2.record.concerns && record2.record.concerns.length > 0 ? (
              <View className="space-y-1">
                {record2.record.concerns.map((concern, idx) => (
                  <View key={idx} className="inline-flex items-center px-2 py-1 rounded-full bg-amber-100 mr-1">
                    <Text className="text-xs text-amber-600 block">{concern}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-xs text-gray-400 block">无问题</Text>
            )}
          </View>
        </View>

        {/* 问题变化分析 */}
        {record1.record.concerns && record2.record.concerns && (
          <View className="mt-4 p-3 bg-gray-50 rounded-lg">
            {record2.record.concerns.length < record1.record.concerns.length ? (
              <Text className="text-sm text-green-600 block">
                ✅ 问题数量减少 {record1.record.concerns.length - record2.record.concerns.length} 项
              </Text>
            ) : record2.record.concerns.length > record1.record.concerns.length ? (
              <Text className="text-sm text-amber-600 block">
                ⚠️ 问题数量增加 {record2.record.concerns.length - record1.record.concerns.length} 项
              </Text>
            ) : (
              <Text className="text-sm text-gray-600 block">
                📋 问题数量保持稳定
              </Text>
            )}
          </View>
        )}
      </View>

      {/* 建议 */}
      <View className="bg-gradient-to-r from-blue-50 to-rose-50 rounded-xl p-4">
        <Text className="text-sm font-semibold text-gray-800 block mb-2">💡 改善建议</Text>
        
        {record2.record.score > record1.record.score ? (
          <Text className="text-sm text-green-600 block">
            您的肌肤状况有所改善！继续保持当前的护肤习惯，建议：
            <Text className="block mt-1 text-gray-700">
              • 坚持使用保湿产品维持水分平衡{'\n'}
              • 注意防晒，防止色斑和老化{'\n'}
              • 定期深层清洁，预防毛孔堵塞
            </Text>
          </Text>
        ) : record2.record.score < record1.record.score ? (
          <Text className="text-sm text-amber-600 block">
            肌肤状况有所下降，建议：
            <Text className="block mt-1 text-gray-700">
              • 评估最近使用的护肤品是否适合{'\n'}
              • 加强保湿和修护{'\n'}
              • 考虑咨询专业皮肤科医生
            </Text>
          </Text>
        ) : (
          <Text className="text-sm text-gray-600 block">
            肌肤状况保持稳定，建议：
            <Text className="block mt-1 text-gray-700">
              • 继续保持当前的护肤方案{'\n'}
              • 注意季节变化对肌肤的影响{'\n'}
              • 定期进行皮肤检测跟踪变化
            </Text>
          </Text>
        )}
      </View>
    </View>
  )
}

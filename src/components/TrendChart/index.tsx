import { View, Text } from '@tarojs/components'

interface DataPoint {
  date: string
  moisture: number
  oiliness: number
  sensitivity: number
  score: number
}

interface TrendChartProps {
  data: DataPoint[]
  showPrediction?: boolean
}

export default function TrendChart({ data, showPrediction = true }: TrendChartProps) {
  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${month}/${day}`
  }

  const maxScore = 100

  // 预测未来趋势（简单线性回归）
  const generatePrediction = (): DataPoint[] => {
    if (data.length < 2) return []

    const last5 = data.slice(-5)
    const last = last5[last5.length - 1]

    let moistureTrend = 0
    let oilinessTrend = 0
    let sensitivityTrend = 0

    for (let i = 1; i < last5.length; i++) {
      moistureTrend += last5[i].moisture - last5[i - 1].moisture
      oilinessTrend += last5[i].oiliness - last5[i - 1].oiliness
      sensitivityTrend += last5[i].sensitivity - last5[i - 1].sensitivity
    }

    moistureTrend = moistureTrend / (last5.length - 1)
    oilinessTrend = oilinessTrend / (last5.length - 1)
    sensitivityTrend = sensitivityTrend / (last5.length - 1)

    const predictions: DataPoint[] = []
    const lastDate = new Date(last.date)
    
    for (let i = 1; i <= 3; i++) {
      const nextDate = new Date(lastDate)
      nextDate.setDate(nextDate.getDate() + 7 * i)
      
      const predMoisture = Math.max(0, Math.min(100, last.moisture + moistureTrend * i))
      const predOiliness = Math.max(0, Math.min(100, last.oiliness + oilinessTrend * i))
      const predSensitivity = Math.max(0, Math.min(100, last.sensitivity + sensitivityTrend * i))
      
      const scores = [predMoisture, 100 - predOiliness, 100 - predSensitivity]
      const predScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)

      predictions.push({
        date: nextDate.toISOString(),
        moisture: predMoisture,
        oiliness: predOiliness,
        sensitivity: predSensitivity,
        score: predScore
      })
    }

    return predictions
  }

  const predictions: DataPoint[] = showPrediction ? generatePrediction() : []

  const getBarHeight = (value: number) => {
    return `${(value / maxScore) * 100}%`
  }

  const getBarColor = (value: number, isPrediction: boolean) => {
    if (isPrediction) {
      return value >= 80 ? 'bg-green-300' : value >= 60 ? 'bg-yellow-300' : 'bg-red-300'
    }
    return value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-500' : 'bg-red-500'
  }

  return (
    <View className="w-full">
      {/* 分数趋势图 */}
      <View className="mb-6">
        <View className="flex items-center justify-between mb-3">
          <Text className="text-base font-semibold text-gray-800 block">综合分数趋势</Text>
          <View className="flex items-center gap-2">
            <View className="flex items-center gap-1">
              <View className="w-2 h-2 rounded-full bg-blue-500" />
              <Text className="text-xs text-gray-500 block">历史数据</Text>
            </View>
            {showPrediction && predictions.length > 0 && (
              <View className="flex items-center gap-1">
                <View className="w-2 h-2 rounded-full bg-blue-300" />
                <Text className="text-xs text-gray-500 block">预测</Text>
              </View>
            )}
          </View>
        </View>

        <View className="bg-white rounded-xl p-4 shadow-sm">
          <View className="flex items-end gap-2 h-32">
            {data.map((point, index) => (
              <View key={`history-${index}`} className="flex-1 flex flex-col items-center">
                <Text className="text-xs text-gray-500 mb-1 block">{point.score}</Text>
                <View
                  className={`w-full rounded-t transition-all ${getBarColor(point.score, false)}`}
                  style={{ height: getBarHeight(point.score) }}
                />
                <Text className="text-[10px] text-gray-400 mt-1 block">
                  {formatShortDate(point.date)}
                </Text>
              </View>
            ))}
            {predictions.map((point, index) => (
              <View key={`prediction-${index}`} className="flex-1 flex flex-col items-center">
                <Text className="text-xs text-gray-400 mb-1 block">{point.score}</Text>
                <View
                  className={`w-full rounded-t transition-all border-2 border-dashed border-gray-300 ${getBarColor(point.score, true)}`}
                  style={{ height: getBarHeight(point.score) }}
                />
                <Text className="text-[10px] text-gray-300 mt-1 block">
                  {formatShortDate(point.date)}
                </Text>
              </View>
            ))}
          </View>

          {/* 趋势预测说明 */}
          {showPrediction && predictions.length > 0 && (
            <View className="mt-4 p-3 bg-blue-50 rounded-lg">
              <Text className="text-xs text-blue-600 block">
                💡 预测：根据最近数据预测，未来{predictions.length * 7}天的综合分数为{' '}
                {predictions[predictions.length - 1].score} 分
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* 详细指标趋势 */}
      <View className="space-y-4">
        {/* 水分趋势 */}
        <View>
          <View className="flex items-center justify-between mb-2">
            <View className="flex items-center gap-2">
              <View className="w-3 h-3 rounded-full bg-blue-500" />
              <Text className="text-sm font-medium text-gray-700 block">水分</Text>
            </View>
            <Text className="text-sm text-gray-500 block">
              {data[data.length - 1].moisture}% → {predictions.length > 0 ? predictions[predictions.length - 1].moisture.toFixed(0) : '--'}%
            </Text>
          </View>
          <View className="flex gap-1">
            {data.map((point, index) => (
              <View key={`moisture-history-${index}`} className="flex-1 flex flex-col items-center">
                <View
                  className="w-full rounded-t bg-blue-500 transition-all"
                  style={{ height: getBarHeight(point.moisture) }}
                />
              </View>
            ))}
            {predictions.map((point, index) => (
              <View key={`moisture-prediction-${index}`} className="flex-1 flex flex-col items-center">
                <View
                  className="w-full rounded-t bg-blue-300 border-2 border-dashed border-gray-300 transition-all"
                  style={{ height: getBarHeight(point.moisture) }}
                />
              </View>
            ))}
          </View>
        </View>

        {/* 油性趋势 */}
        <View>
          <View className="flex items-center justify-between mb-2">
            <View className="flex items-center gap-2">
              <View className="w-3 h-3 rounded-full bg-yellow-500" />
              <Text className="text-sm font-medium text-gray-700 block">油性</Text>
            </View>
            <Text className="text-sm text-gray-500 block">
              {data[data.length - 1].oiliness}% → {predictions.length > 0 ? predictions[predictions.length - 1].oiliness.toFixed(0) : '--'}%
            </Text>
          </View>
          <View className="flex gap-1">
            {data.map((point, index) => (
              <View key={`oiliness-history-${index}`} className="flex-1 flex flex-col items-center">
                <View
                  className="w-full rounded-t bg-yellow-500 transition-all"
                  style={{ height: getBarHeight(point.oiliness) }}
                />
              </View>
            ))}
            {predictions.map((point, index) => (
              <View key={`oiliness-prediction-${index}`} className="flex-1 flex flex-col items-center">
                <View
                  className="w-full rounded-t bg-yellow-300 border-2 border-dashed border-gray-300 transition-all"
                  style={{ height: getBarHeight(point.oiliness) }}
                />
              </View>
            ))}
          </View>
        </View>

        {/* 敏感度趋势 */}
        <View>
          <View className="flex items-center justify-between mb-2">
            <View className="flex items-center gap-2">
              <View className="w-3 h-3 rounded-full bg-rose-500" />
              <Text className="text-sm font-medium text-gray-700 block">敏感度</Text>
            </View>
            <Text className="text-sm text-gray-500 block">
              {data[data.length - 1].sensitivity}% → {predictions.length > 0 ? predictions[predictions.length - 1].sensitivity.toFixed(0) : '--'}%
            </Text>
          </View>
          <View className="flex gap-1">
            {data.map((point, index) => (
              <View key={`sensitivity-history-${index}`} className="flex-1 flex flex-col items-center">
                <View
                  className="w-full rounded-t bg-rose-500 transition-all"
                  style={{ height: getBarHeight(point.sensitivity) }}
                />
              </View>
            ))}
            {predictions.map((point, index) => (
              <View key={`sensitivity-prediction-${index}`} className="flex-1 flex flex-col items-center">
                <View
                  className="w-full rounded-t bg-rose-300 border-2 border-dashed border-gray-300 transition-all"
                  style={{ height: getBarHeight(point.sensitivity) }}
                />
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  )
}

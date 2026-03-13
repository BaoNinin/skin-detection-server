import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { Network } from '@/network'

interface HistoryRecord {
  id: number
  skin_type: string
  concerns: string[]
  moisture: number
  oiliness: number
  sensitivity: number
  recommendations: string[]
  image_url: string | null
  created_at: string
}

export default function HistoryPage() {
  const [historyList, setHistoryList] = useState<HistoryRecord[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/skin/history',
        method: 'GET'
      })

      if (res.data.code === 200) {
        setHistoryList(res.data.data)
      } else {
        Taro.showToast({
          title: res.data.msg || '加载失败',
          icon: 'none'
        })
      }
    } catch (err) {
      console.error('加载历史记录失败:', err)
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}`
  }

  const handleViewDetail = (record: HistoryRecord) => {
    Taro.setStorageSync('selectedHistoryRecord', record)
    Taro.navigateTo({
      url: '/pages/history-detail/index'
    })
  }

  return (
    <View className="min-h-screen bg-rose-50">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-800 block">历史记录</Text>
        <Text className="text-sm text-gray-500 mt-2 block">查看您的皮肤检测历史</Text>
      </View>

      {loading && (
        <View className="flex flex-col items-center justify-center py-20 px-4">
          <View className="w-12 h-12 border-4 border-rose-200 border-t-rose-400 rounded-full animate-spin mb-4" />
          <Text className="text-base text-gray-600 block">加载中...</Text>
        </View>
      )}

      {!loading && historyList.length === 0 && (
        <View className="flex flex-col items-center justify-center py-20 px-4">
          <Text className="text-6xl mb-4">📋</Text>
          <Text className="text-base text-gray-400 text-center block">暂无检测记录</Text>
          <Text className="text-sm text-gray-400 text-center mt-2 block">点击下方按钮开始您的第一次检测</Text>
          <View
            onClick={() => Taro.switchTab({ url: '/pages/index/index' })}
            className="bg-rose-400 text-white rounded-full py-3 px-8 font-medium mt-6"
          >
            开始检测
          </View>
        </View>
      )}

      {!loading && historyList.length > 0 && (
        <View className="p-4 space-y-4">
          {historyList.map((record) => (
            <View
              key={record.id}
              onClick={() => handleViewDetail(record)}
              className="bg-white rounded-2xl p-5 shadow-sm"
            >
              <View className="flex items-center justify-between mb-3">
                <Text className="text-lg font-semibold text-gray-800 block">{record.skin_type}</Text>
                <Text className="text-sm text-gray-500 block">{formatDate(record.created_at)}</Text>
              </View>

              <View className="flex gap-3 mb-3">
                <View className="flex-1 bg-gray-50 rounded-lg p-3">
                  <Text className="text-xs text-gray-500 block mb-1">水分</Text>
                  <Text className="text-lg font-bold text-blue-500 block">{record.moisture}%</Text>
                </View>
                <View className="flex-1 bg-gray-50 rounded-lg p-3">
                  <Text className="text-xs text-gray-500 block mb-1">油性</Text>
                  <Text className="text-lg font-bold text-yellow-500 block">{record.oiliness}%</Text>
                </View>
                <View className="flex-1 bg-gray-50 rounded-lg p-3">
                  <Text className="text-xs text-gray-500 block mb-1">敏感度</Text>
                  <Text className="text-lg font-bold text-rose-500 block">{record.sensitivity}%</Text>
                </View>
              </View>

              {record.concerns && record.concerns.length > 0 && (
                <View className="flex flex-wrap gap-2">
                  {record.concerns.slice(0, 3).map((concern, index) => (
                    <View key={index} className="inline-flex items-center px-2 py-1 rounded-full bg-amber-100">
                      <Text className="text-xs text-amber-600 block">{concern}</Text>
                    </View>
                  ))}
                  {record.concerns.length > 3 && (
                    <Text className="text-xs text-gray-500 block">+{record.concerns.length - 3}</Text>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

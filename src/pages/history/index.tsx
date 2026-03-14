import { View, Text, Button, ScrollView } from '@tarojs/components'
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
  acne?: number
  wrinkles?: number
  spots?: number
  pores?: number
  blackheads?: number
  recommendations: string[]
  image_url: string | null
  created_at: string
}

type ViewType = 'timeline' | 'calendar'

export default function HistoryPage() {
  const [historyList, setHistoryList] = useState<HistoryRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [viewType, setViewType] = useState<ViewType>('timeline')
  const [selectedRecords, setSelectedRecords] = useState<HistoryRecord[]>([])
  
  // 日历视图相关状态
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<string>('')

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    setLoading(true)

    const userId = Taro.getStorageSync('userId')
    if (!userId) {
      console.warn('用户未登录，跳转到登录页面')
      Taro.showModal({
        title: '提示',
        content: '请先登录以查看您的检测记录',
        showCancel: false,
        success: () => {
          Taro.switchTab({ url: '/pages/profile/index' })
        }
      })
      setLoading(false)
      return
    }

    try {
      const res = await Network.request({
        url: `/api/skin/history?userId=${userId}`,
        method: 'GET'
      })

      if (res.data.code === 200) {
        setHistoryList(res.data.data)
      } else if (res.data.code === 401) {
        // 401 未登录，跳转到登录页面
        Taro.showModal({
          title: '提示',
          content: '登录已过期，请重新登录',
          showCancel: false,
          success: () => {
            Taro.switchTab({ url: '/pages/profile/index' })
          }
        })
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
    return `${year}-${month}-${day}`
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${hour}:${minute}`
  }

  const calculateScore = (record: HistoryRecord) => {
    const scores = [record.moisture, 100 - record.oiliness, 100 - record.sensitivity]
    if (record.acne) scores.push(100 - record.acne)
    if (record.wrinkles) scores.push(100 - record.wrinkles)
    if (record.spots) scores.push(100 - record.spots)
    if (record.pores) scores.push(100 - record.pores)
    if (record.blackheads) scores.push(100 - record.blackheads)
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }

  const handleSelectRecord = (record: HistoryRecord) => {
    if (selectedRecords.includes(record)) {
      setSelectedRecords(selectedRecords.filter(r => r.id !== record.id))
    } else if (selectedRecords.length < 2) {
      setSelectedRecords([...selectedRecords, record])
    } else {
      Taro.showToast({
        title: '最多选择2条记录进行对比',
        icon: 'none'
      })
    }
  }

  const handleCompare = () => {
    if (selectedRecords.length === 2) {
      Taro.setStorageSync('compareRecords', selectedRecords)
      Taro.navigateTo({
        url: '/pages/history-detail/index?type=compare'
      })
    } else {
      Taro.showToast({
        title: '请选择2条记录进行对比',
        icon: 'none'
      })
    }
  }

  const handleViewDetail = (record: HistoryRecord) => {
    Taro.setStorageSync('selectedHistoryRecord', record)
    Taro.navigateTo({
      url: '/pages/history-detail/index?type=detail'
    })
  }

  const handleGoToDetect = () => {
    Taro.switchTab({ url: '/pages/landing/index' })
  }

  // 日历相关函数
  const getMonthData = (year: number, month: number) => {
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    const daysInMonth = lastDay.getDate()
    const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1 // 将周日(0)转为6，其他减1
    
    return { daysInMonth, firstDayOfWeek }
  }

  const getRecordsByDate = (dateStr: string) => {
    return historyList.filter(record => {
      const recordDate = new Date(record.created_at)
      const [y, m, d] = dateStr.split('-').map(Number)
      return (
        recordDate.getFullYear() === y &&
        recordDate.getMonth() + 1 === m &&
        recordDate.getDate() === d
      )
    })
  }

  const getDatesWithRecords = () => {
    const dateSet = new Set<string>()
    historyList.forEach(record => {
      const date = new Date(record.created_at)
      const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
      dateSet.add(dateStr)
    })
    return dateSet
  }

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(currentYear - 1)
      setCurrentMonth(12)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
    setSelectedDate('')
  }

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(currentYear + 1)
      setCurrentMonth(1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
    setSelectedDate('')
  }

  const handleDateClick = (day: number) => {
    const dateStr = `${currentYear}-${currentMonth}-${day}`
    setSelectedDate(dateStr)
  }

  const getWeekDays = () => {
    return ['一', '二', '三', '四', '五', '六', '日']
  }

  return (
    <View className="min-h-screen bg-rose-50 flex flex-col">
      <View className="bg-white border-b border-gray-100 p-4">
        <Text className="text-2xl font-bold text-gray-800 block">历史记录</Text>
        <Text className="text-sm text-gray-500 mt-2 block">查看您的皮肤检测历史</Text>
      </View>

      <View className="bg-white px-4 py-3 flex gap-3">
        <View
          onClick={() => setViewType('timeline')}
          className={`flex-1 py-3 rounded-xl text-center ${
            viewType === 'timeline' ? 'bg-rose-400 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          <Text className="text-sm font-medium block">时间轴</Text>
        </View>
        <View
          onClick={() => setViewType('calendar')}
          className={`flex-1 py-3 rounded-xl text-center ${
            viewType === 'calendar' ? 'bg-rose-400 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          <Text className="text-sm font-medium block">日历</Text>
        </View>
      </View>

      {selectedRecords.length > 0 && (
        <View className="px-4 py-3 bg-white">
          <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
            <Text className="text-sm text-blue-700 block">
              已选择 {selectedRecords.length} 条记录
            </Text>
            <Button
              onClick={handleCompare}
              size="mini"
              className="bg-blue-500 text-white rounded-full"
            >
              对比
            </Button>
          </View>
        </View>
      )}

      <ScrollView scrollY className="flex-1 bg-rose-50">
        {loading && (
          <View className="flex flex-col items-center justify-center py-20 px-4">
            <View className="w-12 h-12 border-4 border-rose-200 border-t-rose-400 rounded-full animate-spin mb-4" />
            <Text className="text-base text-gray-600 block">加载中...</Text>
          </View>
        )}

        {!loading && historyList.length === 0 && (
          <View className="flex flex-col items-center justify-center py-20 px-4">
            <Text className="text-6xl mb-4 block">📋</Text>
            <Text className="text-base text-gray-400 text-center block">暂无检测记录</Text>

            {!Taro.getStorageSync('userId') ? (
              <>
                <Text className="text-sm text-gray-400 text-center mt-2 block">请先登录以查看您的检测记录</Text>
                <Button
                  onClick={() => Taro.switchTab({ url: '/pages/profile/index' })}
                  className="bg-rose-400 text-white rounded-full py-3 px-8 font-medium mt-6"
                >
                  去登录
                </Button>
              </>
            ) : (
              <>
                <Text className="text-sm text-gray-400 text-center mt-2 block">点击下方按钮开始您的第一次检测</Text>
                <Button
                  onClick={handleGoToDetect}
                  className="bg-rose-400 text-white rounded-full py-3 px-8 font-medium mt-6"
                >
                  开始检测
                </Button>
              </>
            )}
          </View>
        )}

        {!loading && historyList.length > 0 && viewType === 'timeline' && (
          <View className="px-4 py-4 space-y-4">
            {historyList.map((record, index) => {
              const score = calculateScore(record)
              const isSelected = selectedRecords.some(r => r.id === record.id)

              return (
                <View key={record.id} className="relative">
                  {index !== historyList.length - 1 && (
                    <View className="absolute left-6 top-16 bottom-0 w-0.5 bg-gray-200" />
                  )}

                  <View
                    onClick={() => handleViewDetail(record)}
                    className={`relative bg-white rounded-2xl p-5 shadow-sm ml-12 ${
                      isSelected ? 'border-2 border-rose-400' : ''
                    }`}
                  >
                    <View
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectRecord(record)
                      }}
                      className={`absolute left-[-32px] top-5 w-10 h-10 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-rose-400' : 'bg-gray-200'
                      }`}
                    >
                      <Text className="text-lg block">{isSelected ? '✓' : index + 1}</Text>
                    </View>

                    <View className="flex items-center justify-between mb-3">
                      <View>
                        <Text className="text-base font-semibold text-gray-800 block">{record.skin_type}</Text>
                        <Text className="text-sm text-gray-500 block">
                          {formatDate(record.created_at)} {formatTime(record.created_at)}
                        </Text>
                      </View>
                      <View className="text-right">
                        <Text className="text-2xl font-bold text-rose-400 block">{score}分</Text>
                      </View>
                    </View>

                    <View className="flex gap-3 mb-3">
                      <View className="flex-1 bg-gray-50 rounded-lg p-2">
                        <Text className="text-xs text-gray-500 block mb-1">水分</Text>
                        <Text className="text-base font-bold text-blue-500 block">{record.moisture}%</Text>
                      </View>
                      <View className="flex-1 bg-gray-50 rounded-lg p-2">
                        <Text className="text-xs text-gray-500 block mb-1">油性</Text>
                        <Text className="text-base font-bold text-yellow-500 block">{record.oiliness}%</Text>
                      </View>
                      <View className="flex-1 bg-gray-50 rounded-lg p-2">
                        <Text className="text-xs text-gray-500 block mb-1">敏感度</Text>
                        <Text className="text-base font-bold text-rose-500 block">{record.sensitivity}%</Text>
                      </View>
                    </View>

                    {record.concerns && record.concerns.length > 0 && (
                      <View className="flex flex-wrap gap-2">
                        {record.concerns.slice(0, 3).map((concern, idx) => (
                          <View key={idx} className="inline-flex items-center px-2 py-1 rounded-full bg-amber-100">
                            <Text className="text-xs text-amber-600 block">{concern}</Text>
                          </View>
                        ))}
                        {record.concerns.length > 3 && (
                          <Text className="text-xs text-gray-500 block">+{record.concerns.length - 3}</Text>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              )
            })}
            <View className="h-4" />
          </View>
        )}

        {!loading && historyList.length > 0 && viewType === 'calendar' && (
          <View className="px-4 py-4 space-y-4">
            {/* 月份切换 */}
            <View className="bg-white rounded-2xl p-4 shadow-sm">
              <View className="flex items-center justify-between">
                <View
                  onClick={handlePrevMonth}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
                >
                  <Text className="text-lg text-gray-600 block">‹</Text>
                </View>
                <Text className="text-lg font-semibold text-gray-800 block">
                  {currentYear}年{currentMonth}月
                </Text>
                <View
                  onClick={handleNextMonth}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
                >
                  <Text className="text-lg text-gray-600 block">›</Text>
                </View>
              </View>

              {/* 星期标题 */}
              <View className="grid grid-cols-7 gap-1 mt-4">
                {getWeekDays().map((day) => (
                  <View key={day} className="flex items-center justify-center py-2">
                    <Text className="text-sm text-gray-500 block">{day}</Text>
                  </View>
                ))}
              </View>

              {/* 日期网格 */}
              <View className="grid grid-cols-7 gap-1 mt-2">
                {(() => {
                  const { daysInMonth, firstDayOfWeek } = getMonthData(currentYear, currentMonth)
                  const datesWithRecords = getDatesWithRecords()
                  const today = new Date()
                  const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() + 1 === currentMonth

                  return (
                    <>
                      {/* 空白占位 */}
                      {Array.from({ length: firstDayOfWeek }).map((_, index) => (
                        <View key={`empty-${index}`} className="aspect-square" />
                      ))}

                      {/* 日期 */}
                      {Array.from({ length: daysInMonth }).map((_, index) => {
                        const day = index + 1
                        const dateStr = `${currentYear}-${currentMonth}-${day}`
                        const hasRecords = datesWithRecords.has(dateStr)
                        const isSelected = selectedDate === dateStr
                        const isToday = isCurrentMonth && day === today.getDate()
                        const recordsCount = getRecordsByDate(dateStr).length

                        return (
                          <View
                            key={day}
                            onClick={() => hasRecords && handleDateClick(day)}
                            className={`aspect-square flex flex-col items-center justify-center rounded-xl ${
                              hasRecords ? 'active:bg-rose-50 cursor-pointer' : 'opacity-30'
                            } ${isSelected ? 'bg-rose-400' : ''} ${isToday && !isSelected ? 'border-2 border-rose-400' : ''}`}
                          >
                            <Text
                              className={`text-sm font-medium block ${
                                isSelected ? 'text-white' : 'text-gray-800'
                              }`}
                            >
                              {day}
                            </Text>
                            {hasRecords && recordsCount > 0 && (
                              <View
                                className={`w-1.5 h-1.5 rounded-full mt-1 ${
                                  isSelected ? 'bg-white' : 'bg-rose-400'
                                }`}
                              />
                            )}
                          </View>
                        )
                      })}
                    </>
                  )
                })()}
              </View>
            </View>

            {/* 选中日期的记录 */}
            {selectedDate && (
              <View className="bg-white rounded-2xl p-4 shadow-sm">
                <View className="flex items-center justify-between mb-4">
                  <Text className="text-base font-semibold text-gray-800 block">
                    {selectedDate} 的检测记录
                  </Text>
                  <Text className="text-sm text-gray-500 block">
                    共 {getRecordsByDate(selectedDate).length} 条
                  </Text>
                </View>

                <View className="space-y-3">
                  {getRecordsByDate(selectedDate).map((record) => {
                    const score = calculateScore(record)

                    return (
                      <View
                        key={record.id}
                        onClick={() => handleViewDetail(record)}
                        className="bg-gray-50 rounded-xl p-4"
                      >
                        <View className="flex items-center justify-between mb-2">
                          <Text className="text-sm font-semibold text-gray-800 block">
                            {record.skin_type}
                          </Text>
                          <Text className="text-lg font-bold text-rose-400 block">{score}分</Text>
                        </View>

                        <Text className="text-xs text-gray-500 block mb-3">
                          {formatTime(record.created_at)}
                        </Text>

                        <View className="flex gap-2">
                          <View className="flex-1 bg-white rounded-lg p-2">
                            <Text className="text-xs text-gray-500 block">水分</Text>
                            <Text className="text-sm font-bold text-blue-500 block">
                              {record.moisture}%
                            </Text>
                          </View>
                          <View className="flex-1 bg-white rounded-lg p-2">
                            <Text className="text-xs text-gray-500 block">油性</Text>
                            <Text className="text-sm font-bold text-yellow-500 block">
                              {record.oiliness}%
                            </Text>
                          </View>
                          <View className="flex-1 bg-white rounded-lg p-2">
                            <Text className="text-xs text-gray-500 block">敏感度</Text>
                            <Text className="text-sm font-bold text-rose-500 block">
                              {record.sensitivity}%
                            </Text>
                          </View>
                        </View>
                      </View>
                    )
                  })}
                </View>
              </View>
            )}

            {/* 提示信息 */}
            {!selectedDate && (
              <View className="bg-white rounded-2xl p-4 shadow-sm">
                <Text className="text-sm text-gray-500 text-center block">
                  点击有标记的日期查看检测记录
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

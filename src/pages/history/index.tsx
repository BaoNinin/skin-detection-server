import { View, Text, Button, ScrollView, Input } from '@tarojs/components'
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
type FilterType = 'all' | 'pending' | 'completed'

export default function HistoryPage() {
  const [historyList, setHistoryList] = useState<HistoryRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [viewType, setViewType] = useState<ViewType>('timeline')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [selectedRecords, setSelectedRecords] = useState<HistoryRecord[]>([])
  const [searchKeyword, setSearchKeyword] = useState('')
  
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
    console.log('=== 历史记录加载 ===')
    console.log('userId:', userId, '类型:', typeof userId, '是否有效:', !!userId)
    console.log('userId is number:', typeof userId === 'number')
    console.log('userId value:', userId)

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
      const url = `/api/skin/history?userId=${userId}`
      console.log('请求 URL:', url)

      const res = await Network.request({
        url: url,
        method: 'GET'
      })

      console.log('响应状态:', res.data.code)
      console.log('响应数据:', res.data)
      console.log('记录数量:', res.data.data?.length || 0)

      if (res.data.code === 200) {
        setHistoryList(res.data.data)
        console.log('查询成功，历史记录已更新')
      } else if (res.data.code === 401) {
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

  // 根据筛选和搜索过滤记录
  const getFilteredRecords = () => {
    let filtered = [...historyList]

    // 根据筛选类型过滤
    if (filterType === 'pending') {
      // 模拟：这里可以根据实际业务逻辑过滤，例如是否已提交订单
      // 目前暂时返回所有记录
    } else if (filterType === 'completed') {
      // 模拟：已完成订单的记录
    }

    // 根据搜索关键词过滤
    if (searchKeyword) {
      filtered = filtered.filter(record => {
        // 搜索档案ID
        if (searchKeyword.startsWith('#')) {
          const id = parseInt(searchKeyword.slice(1))
          return record.id === id
        }
        // 搜索皮肤类型
        return record.skin_type.toLowerCase().includes(searchKeyword.toLowerCase())
      })
    }

    return filtered
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

  const handleCopyId = (record: HistoryRecord) => {
    Taro.setClipboardData({
      data: `#${record.id}`,
      success: () => {
        Taro.showToast({
          title: '档案编号已复制',
          icon: 'success'
        })
      }
    })
  }

  const handleDelete = (record: HistoryRecord) => {
    Taro.showModal({
      title: '确认删除',
      content: `确定要删除档案 #${record.id} 吗？`,
      success: (modalRes) => {
        if (modalRes.confirm) {
          // 调用删除接口
          Network.request({
            url: `/api/skin/history/${record.id}`,
            method: 'DELETE'
          }).then((res) => {
            if (res.data.code === 200) {
              Taro.showToast({
                title: '删除成功',
                icon: 'success'
              })
              // 重新加载记录
              loadHistory()
            } else {
              Taro.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          }).catch(() => {
            Taro.showToast({
              title: '删除失败',
              icon: 'none'
            })
          })
        }
      }
    })
  }

  const handleGoToDetect = () => {
    Taro.switchTab({ url: '/pages/landing/index' })
  }

  const handleSearch = (value: string) => {
    setSearchKeyword(value)
  }

  // 日历相关函数
  const getMonthData = (year: number, month: number) => {
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    const daysInMonth = lastDay.getDate()
    const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
    
    return { daysInMonth, firstDayOfWeek }
  }

  const getRecordsByDate = (dateStr: string) => {
    return getFilteredRecords().filter(record => {
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
    getFilteredRecords().forEach(record => {
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

  const filteredRecords = getFilteredRecords()

  return (
    <View className="min-h-screen bg-gray-50 flex flex-col">
      <View className="bg-white border-b border-gray-100 p-4">
        <Text className="text-2xl font-bold text-gray-800 block">肤质档案</Text>
        <Text className="text-sm text-gray-500 mt-2 block">管理您的皮肤检测记录</Text>
      </View>

      {/* Tab 切换 */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <View className="flex gap-3">
          <View
            onClick={() => setFilterType('all')}
            className={`flex-1 py-2 rounded-xl text-center ${
              filterType === 'all' ? 'bg-rose-400 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Text className="text-sm font-medium block">全部</Text>
          </View>
          <View
            onClick={() => setFilterType('pending')}
            className={`flex-1 py-2 rounded-xl text-center ${
              filterType === 'pending' ? 'bg-rose-400 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Text className="text-sm font-medium block">待付款</Text>
          </View>
          <View
            onClick={() => setFilterType('completed')}
            className={`flex-1 py-2 rounded-xl text-center ${
              filterType === 'completed' ? 'bg-rose-400 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Text className="text-sm font-medium block">已完成</Text>
          </View>
        </View>
      </View>

      {/* 搜索框 */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <View className="bg-gray-100 rounded-xl px-4 py-3 flex items-center">
          <Text className="text-gray-400 mr-2">🔍</Text>
          <Input
            className="flex-1 text-sm"
            placeholder="搜索档案ID或皮肤类型"
            value={searchKeyword}
            onInput={(e) => handleSearch(e.detail.value)}
          />
        </View>
      </View>

      {/* 视图切换 */}
      <View className="bg-white px-4 py-3">
        <View className="flex gap-3">
          <View
            onClick={() => setViewType('timeline')}
            className={`flex-1 py-2 rounded-xl text-center ${
              viewType === 'timeline' ? 'bg-rose-400 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Text className="text-sm font-medium block">时间轴</Text>
          </View>
          <View
            onClick={() => setViewType('calendar')}
            className={`flex-1 py-2 rounded-xl text-center ${
              viewType === 'calendar' ? 'bg-rose-400 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Text className="text-sm font-medium block">日历</Text>
          </View>
        </View>
      </View>

      {selectedRecords.length > 0 && (
        <View className="px-4 py-3 bg-white border-b border-gray-100">
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

      <ScrollView scrollY className="flex-1 bg-gray-50">
        {loading && (
          <View className="flex flex-col items-center justify-center py-20 px-4">
            <View className="w-12 h-12 border-4 border-rose-200 border-t-rose-400 rounded-full animate-spin mb-4" />
            <Text className="text-base text-gray-600 block">加载中...</Text>
            {Taro.getStorageSync('userId') && (
              <Text className="text-xs text-gray-400 mt-2 block">用户 ID: {Taro.getStorageSync('userId')}</Text>
            )}
          </View>
        )}

        {!loading && filteredRecords.length === 0 && (
          <View className="flex flex-col items-center justify-center py-20 px-4">
            <Text className="text-6xl mb-4 block">📋</Text>
            <Text className="text-base text-gray-400 text-center block">
              {searchKeyword ? '未找到匹配的档案' : '暂无检测记录'}
            </Text>

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
            ) : searchKeyword ? (
              <>
                <Text className="text-sm text-gray-400 text-center mt-2 block">请尝试其他搜索关键词</Text>
                <Button
                  onClick={() => setSearchKeyword('')}
                  className="bg-gray-200 text-gray-700 rounded-full py-3 px-8 font-medium mt-6"
                >
                  清除搜索
                </Button>
              </>
            ) : (
              <>
                <Text className="text-sm text-gray-400 text-center mt-2 block">点击下方按钮开始您的第一次皮肤检测</Text>
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

        {!loading && filteredRecords.length > 0 && viewType === 'timeline' && (
          <View className="px-4 py-4 space-y-4">
            {filteredRecords.map((record, index) => {
              const score = calculateScore(record)
              const isSelected = selectedRecords.some(r => r.id === record.id)

              return (
                <View key={record.id} className="relative">
                  {index !== filteredRecords.length - 1 && (
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
                        <Text className="text-xs text-gray-400 mb-1 block">档案 #{record.id}</Text>
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
                      <View className="flex flex-wrap gap-2 mb-3">
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

                    {/* 操作按钮 */}
                    <View className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      <View
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopyId(record)
                        }}
                        className="flex-1 py-2 bg-gray-50 rounded-lg text-center"
                      >
                        <Text className="text-xs text-gray-600 block">复制ID</Text>
                      </View>
                      <View
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(record)
                        }}
                        className="flex-1 py-2 bg-red-50 rounded-lg text-center"
                      >
                        <Text className="text-xs text-red-500 block">删除</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )
            })}
            <View className="h-4" />
          </View>
        )}

        {!loading && filteredRecords.length > 0 && viewType === 'calendar' && (
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
                          <View>
                            <Text className="text-xs text-gray-400 mb-1 block">档案 #{record.id}</Text>
                            <Text className="text-sm font-semibold text-gray-800 block">
                              {record.skin_type}
                            </Text>
                          </View>
                          <Text className="text-lg font-bold text-rose-400 block">{score}分</Text>
                        </View>

                        <Text className="text-xs text-gray-500 block mb-3">
                          {formatTime(record.created_at)}
                        </Text>

                        <View className="flex gap-2">
                          <View className="flex-1 bg-white rounded-lg p-2 text-center">
                            <Text className="text-xs text-gray-500 block">水分</Text>
                            <Text className="text-sm font-bold text-blue-500 block">{record.moisture}%</Text>
                          </View>
                          <View className="flex-1 bg-white rounded-lg p-2 text-center">
                            <Text className="text-xs text-gray-500 block">油性</Text>
                            <Text className="text-sm font-bold text-yellow-500 block">{record.oiliness}%</Text>
                          </View>
                          <View className="flex-1 bg-white rounded-lg p-2 text-center">
                            <Text className="text-xs text-gray-500 block">敏感度</Text>
                            <Text className="text-sm font-bold text-rose-500 block">{record.sensitivity}%</Text>
                          </View>
                        </View>
                      </View>
                    )
                  })}
                </View>
              </View>
            )}
            <View className="h-4" />
          </View>
        )}
      </ScrollView>
    </View>
  )
}

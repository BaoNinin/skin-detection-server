import { View, Text, Button, ScrollView, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect, useMemo } from 'react'
import { Network } from '@/network'
import EmptyState from '@/components/EmptyState'
import { SkeletonListItem } from '@/components/Skeleton'
import Swipe from '@/components/Swipe'

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

type ViewType = 'timeline' | 'calendar' | 'trend'
type TimeRange = 'all' | '7days' | '30days' | '90days'

export default function HistoryPage() {
  const [historyList, setHistoryList] = useState<HistoryRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [viewType, setViewType] = useState<ViewType>('timeline')
  const [timeRange, setTimeRange] = useState<TimeRange>('all')
  const [selectedRecords, setSelectedRecords] = useState<HistoryRecord[]>([])
  const [searchKeyword, setSearchKeyword] = useState('')
  
  // 日历视图相关状态
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<string>('')

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async (retryCount = 0, resetFilters = false) => {
    setLoading(true)

    // 如果需要重置筛选条件（点击刷新按钮时）
    if (resetFilters) {
      console.log('重置筛选条件')
      setSearchKeyword('')
      setTimeRange('all')
      setSelectedRecords([])
    }

    const userId = Taro.getStorageSync('userId')
    console.log('=== 历史记录加载 ===')
    console.log('userId:', userId, '类型:', typeof userId, '是否有效:', !!userId)
    console.log('重试次数:', retryCount)
    console.log('重置筛选条件:', resetFilters)

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
      console.log('记录数量:', res.data.data?.length || 0)
      console.log('响应数据:', res.data.data)

      if (res.data.code === 200) {
        setHistoryList(res.data.data || [])
        console.log('查询成功，历史记录已更新，当前筛选条件:', {
          keyword: resetFilters ? '' : searchKeyword,
          timeRange: resetFilters ? 'all' : timeRange
        })

        // 如果是点击刷新按钮，显示成功提示
        if (resetFilters) {
          Taro.showToast({
            title: `刷新成功，共 ${res.data.data?.length || 0} 条记录`,
            icon: 'success',
            duration: 1500
          })
        }
      } else if (res.data.code === 401) {
        console.error('登录已过期')
        Taro.showModal({
          title: '提示',
          content: '登录已过期，请重新登录',
          showCancel: false,
          success: () => {
            Taro.switchTab({ url: '/pages/profile/index' })
          }
        })
      } else {
        console.error('查询失败，错误信息:', res.data.msg)
        Taro.showToast({
          title: res.data.msg || '加载失败',
          icon: 'none'
        })
      }
    } catch (err) {
      console.error('加载历史记录失败:', err)

      // 网络错误时自动重试一次
      if (retryCount === 0) {
        console.log('首次加载失败，尝试重试...')
        Taro.showToast({
          title: '加载失败，正在重试...',
          icon: 'none',
          duration: 1500
        })
        await new Promise(resolve => setTimeout(resolve, 1000))
        return loadHistory(retryCount + 1, resetFilters)
      } else {
        console.error('重试失败，不再重试')
        Taro.showToast({
          title: '加载失败，请检查网络',
          icon: 'none'
        })
      }
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

  // 根据时间范围过滤记录
  const getFilteredByTimeRange = (records: HistoryRecord[]) => {
    if (timeRange === 'all') return records
    
    const now = new Date()
    const daysAgo = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90
    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    
    return records.filter(record => {
      const recordDate = new Date(record.created_at)
      return recordDate >= cutoffDate
    })
  }

  // 根据筛选和搜索过滤记录
  const getFilteredRecords = () => {
    let filtered = [...historyList]

    // 根据时间范围过滤
    filtered = getFilteredByTimeRange(filtered)

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

  const handleRefresh = () => {
    // 清除历史记录相关的缓存
    Network.cache.clearUrl('/api/skin/history')
    // 重新加载历史记录
    loadHistory(0, true)
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
          Network.request({
            url: `/api/skin/history/${record.id}`,
            method: 'DELETE'
          }).then((res) => {
            if (res.data.code === 200) {
              Taro.showToast({
                title: '删除成功',
                icon: 'success'
              })
              loadHistory(0, false) // 删除记录后刷新，不重置筛选条件
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

  const handleSearch = (value: string) => {
    setSearchKeyword(value)
  }

  // 导出报告（生成图片）
  const handleExportReport = async () => {
    const records = getFilteredRecords()
    if (records.length === 0) {
      Taro.showToast({
        title: '暂无数据可导出',
        icon: 'none'
      })
      return
    }

    Taro.showLoading({ title: '生成报告中...' })

    try {
      // 创建 canvas
      const canvas = Taro.createOffscreenCanvas({
        type: '2d',
        width: 600,
        height: 800
      })
      const ctx = canvas.getContext('2d') as any

      // 绘制背景
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, 600, 800)

      // 绘制标题
      ctx.fillStyle = '#333333'
      ctx.font = 'bold 32px sans-serif'
      ctx.fillText('皮肤检测报告', 200, 60)

      // 绘制日期
      ctx.fillStyle = '#666666'
      ctx.font = '20px sans-serif'
      ctx.fillText(`生成时间: ${formatDate(new Date().toISOString())}`, 40, 100)

      // 绘制统计数据
      const latestRecord = records[0]
      const score = calculateScore(latestRecord)
      
      ctx.fillStyle = '#333333'
      ctx.font = 'bold 24px sans-serif'
      ctx.fillText('最新检测结果', 40, 160)
      
      ctx.fillStyle = '#666666'
      ctx.font = '20px sans-serif'
      ctx.fillText(`皮肤类型: ${latestRecord.skin_type}`, 40, 200)
      ctx.fillText(`综合评分: ${score}分`, 40, 240)
      ctx.fillText(`水分: ${latestRecord.moisture}%`, 40, 280)
      ctx.fillText(`油性: ${latestRecord.oiliness}%`, 200, 280)
      ctx.fillText(`敏感度: ${latestRecord.sensitivity}%`, 360, 280)

      // 绘制历史趋势
      if (records.length > 1) {
        ctx.fillStyle = '#333333'
        ctx.font = 'bold 24px sans-serif'
        ctx.fillText('历史趋势', 40, 340)

        const chartHeight = 200
        const chartWidth = 520
        const chartX = 40
        const chartY = 360

        // 绘制坐标轴
        ctx.strokeStyle = '#dddddd'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(chartX, chartY)
        ctx.lineTo(chartX, chartY + chartHeight)
        ctx.lineTo(chartX + chartWidth, chartY + chartHeight)
        ctx.stroke()

        // 绘制水分趋势线
        ctx.strokeStyle = '#3B82F6'
        ctx.lineWidth = 2
        ctx.beginPath()
        records.forEach((record, index) => {
          const x = chartX + (index / (records.length - 1)) * chartWidth
          const y = chartY + chartHeight - (record.moisture / 100) * chartHeight
          if (index === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        })
        ctx.stroke()

        // 绘制图例
        ctx.fillStyle = '#3B82F6'
        ctx.fillRect(chartX, chartY - 40, 20, 20)
        ctx.fillStyle = '#666666'
        ctx.font = '18px sans-serif'
        ctx.fillText('水分', chartX + 30, chartY - 25)
      }

      // 生成图片
      const tempFilePath = (canvas as any).toDataURL('image/png')

      // 保存到相册
      await Taro.saveImageToPhotosAlbum({
        filePath: tempFilePath
      })

      Taro.hideLoading()
      Taro.showToast({
        title: '报告已保存到相册',
        icon: 'success'
      })
    } catch (err) {
      console.error('导出报告失败:', err)
      Taro.hideLoading()
      Taro.showToast({
        title: '导出失败',
        icon: 'none'
      })
    }
  }

  // 分享到朋友圈
  const handleShareToMoments = async () => {
    const records = getFilteredRecords()
    if (records.length === 0) {
      Taro.showToast({
        title: '暂无数据可分享',
        icon: 'none'
      })
      return
    }

    const latestRecord = records[0]
    const score = calculateScore(latestRecord)

    // 生成分享图片
    Taro.showLoading({ title: '生成分享图片...' })

    try {
      const canvas = Taro.createOffscreenCanvas({
        type: '2d',
        width: 500,
        height: 600
      })
      const ctx = canvas.getContext('2d') as any

      // 绘制渐变背景
      const gradient = ctx.createLinearGradient(0, 0, 0, 600)
      gradient.addColorStop(0, '#FFE4E1')
      gradient.addColorStop(1, '#FFF5EE')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 500, 600)

      // 绘制标题
      ctx.fillStyle = '#333333'
      ctx.font = 'bold 36px sans-serif'
      ctx.fillText('我的皮肤报告', 150, 80)

      // 绘制评分
      ctx.fillStyle = '#FF6B6B'
      ctx.font = 'bold 80px sans-serif'
      ctx.fillText(`${score}`, 200, 200)

      ctx.fillStyle = '#666666'
      ctx.font = '24px sans-serif'
      ctx.fillText('分', 280, 200)

      // 绘制皮肤类型
      ctx.fillStyle = '#333333'
      ctx.font = '24px sans-serif'
      ctx.fillText(`皮肤类型: ${latestRecord.skin_type}`, 100, 280)

      // 绘制指标
      ctx.fillStyle = '#666666'
      ctx.font = '20px sans-serif'
      ctx.fillText(`水分: ${latestRecord.moisture}%`, 100, 330)
      ctx.fillText(`油性: ${latestRecord.oiliness}%`, 100, 370)
      ctx.fillText(`敏感度: ${latestRecord.sensitivity}%`, 100, 410)

      // 绘制二维码提示
      ctx.fillStyle = '#999999'
      ctx.font = '18px sans-serif'
      ctx.fillText('扫码查看详细报告', 140, 500)

      // 生成图片
      const tempFilePath = (canvas as any).toDataURL('image/png')

      // 保存到相册
      await Taro.saveImageToPhotosAlbum({
        filePath: tempFilePath
      })

      Taro.hideLoading()
      Taro.showModal({
        title: '分享图片已生成',
        content: '图片已保存到相册，您可以到朋友圈发布',
        showCancel: false
      })
    } catch (err) {
      console.error('生成分享图片失败:', err)
      Taro.hideLoading()
      Taro.showToast({
        title: '生成失败',
        icon: 'none'
      })
    }
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

  // 使用 useMemo 缓存过滤后的记录，避免不必要的重新计算
  const filteredRecords = useMemo(() => {
    return getFilteredRecords()
  }, [historyList, searchKeyword, timeRange])

  return (
    <View className="min-h-screen bg-gray-50 flex flex-col">
      <View className="bg-white border-b border-gray-100 p-4 flex items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-gray-800 block">肤质档案</Text>
          <Text className="text-sm text-gray-500 mt-1 block">管理您的皮肤检测记录</Text>
        </View>
        {!loading && (
          <View
            onClick={handleRefresh}
            className="bg-slate-50 px-4 py-2 rounded-lg active:bg-slate-100"
          >
            <Text className="text-sm text-blue-800 block">🔄 刷新</Text>
          </View>
        )}
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

      {/* 时间范围筛选 */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <ScrollView scrollX className="whitespace-nowrap">
          <View className="inline-flex gap-2">
            {(['all', '7days', '30days', '90days'] as TimeRange[]).map((range) => (
              <View
                key={range}
                onClick={() => setTimeRange(range)}
                className={`inline-flex items-center px-4 py-2 rounded-full ${
                  timeRange === range
                    ? 'bg-blue-700 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Text className="text-sm font-medium block">
                  {range === 'all' ? '全部时间' : range === '7days' ? '最近7天' : range === '30days' ? '最近30天' : '最近90天'}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 视图切换 */}
      <View className="bg-white px-4 py-3">
        <View className="flex gap-3">
          <View
            onClick={() => setViewType('timeline')}
            className={`flex-1 py-2 rounded-xl text-center ${
              viewType === 'timeline' ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Text className="text-sm font-medium block">时间轴</Text>
          </View>
          <View
            onClick={() => setViewType('calendar')}
            className={`flex-1 py-2 rounded-xl text-center ${
              viewType === 'calendar' ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Text className="text-sm font-medium block">日历</Text>
          </View>
          <View
            onClick={() => setViewType('trend')}
            className={`flex-1 py-2 rounded-xl text-center ${
              viewType === 'trend' ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Text className="text-sm font-medium block">趋势图</Text>
          </View>
        </View>
      </View>

      {/* 导出和分享按钮 */}
      {filteredRecords.length > 0 && (
        <View className="bg-white px-4 py-3 border-b border-gray-100">
          <View className="flex gap-3">
            <View
              onClick={handleExportReport}
              className="flex-1 py-3 bg-blue-50 border border-blue-200 rounded-xl text-center"
            >
              <Text className="text-sm font-medium text-blue-600 block">📊 导出报告</Text>
            </View>
            <View
              onClick={handleShareToMoments}
              className="flex-1 py-3 bg-green-50 border border-green-200 rounded-xl text-center"
            >
              <Text className="text-sm font-medium text-green-600 block">📤 分享</Text>
            </View>
          </View>
        </View>
      )}

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

      <Swipe
        onSwipeLeft={() => Taro.switchTab({ url: '/pages/mall/index' })}
        onSwipeRight={() => Taro.switchTab({ url: '/pages/landing/index' })}
        threshold={80}
      >
        <ScrollView scrollY className="flex-1 bg-gray-50">
        {/* 加载骨架屏 */}
        {loading && (
          <View className="p-4">
            <SkeletonListItem />
            <SkeletonListItem />
            <SkeletonListItem />
          </View>
        )}

        {/* 空状态 */}
        {!loading && filteredRecords.length === 0 && (
          <EmptyState
            icon="📋"
            title={searchKeyword ? '未找到匹配的档案' : '暂无检测记录'}
            description={
              !Taro.getStorageSync('userId')
                ? '请先登录以查看您的检测记录'
                : '开始您的第一次皮肤检测吧'
            }
            actionText={
              !Taro.getStorageSync('userId')
                ? '去登录'
                : '开始检测'
            }
            onAction={
              !Taro.getStorageSync('userId')
                ? () => Taro.switchTab({ url: '/pages/profile/index' })
                : () => Taro.switchTab({ url: '/pages/landing/index' })
            }
          />
        )}

        {/* 趋势图视图 */}
        {!loading && filteredRecords.length > 0 && viewType === 'trend' && (
          <View className="px-4 py-4 space-y-4">
            <View className="bg-white rounded-2xl p-4 shadow-sm">
              <View className="flex items-center justify-between mb-4">
                <Text className="text-lg font-semibold text-gray-800 block">皮肤指标趋势</Text>
                <Text className="text-sm text-gray-500 block">共 {filteredRecords.length} 次检测</Text>
              </View>

              <View className="space-y-4">
                {/* 水分趋势 */}
                <View>
                  <View className="flex items-center justify-between mb-2">
                    <View className="flex items-center gap-2">
                      <View className="w-3 h-3 rounded-full bg-blue-500" />
                      <Text className="text-sm font-medium text-gray-700 block">水分</Text>
                    </View>
                    <Text className="text-sm text-gray-500 block">
                      {filteredRecords[0]?.moisture}% → {filteredRecords[filteredRecords.length - 1]?.moisture}%
                    </Text>
                  </View>
                  <View className="flex gap-1">
                    {filteredRecords.slice(0, 10).map((record, index) => {
                      const isFirst = index === 0
                      const isLast = index === filteredRecords.slice(0, 10).length - 1
                      
                      return (
                        <View key={record.id} className="flex-1 flex flex-col items-center">
                          <View
                            className="w-full rounded-t"
                            style={{
                              height: `${record.moisture}%`,
                              backgroundColor: isFirst || isLast ? '#3B82F6' : '#93C5FD'
                            }}
                          />
                          <Text className="text-[10px] text-gray-400 mt-1 block">
                            {formatDate(record.created_at).slice(5)}
                          </Text>
                        </View>
                      )
                    })}
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
                      {filteredRecords[0]?.oiliness}% → {filteredRecords[filteredRecords.length - 1]?.oiliness}%
                    </Text>
                  </View>
                  <View className="flex gap-1">
                    {filteredRecords.slice(0, 10).map((record, index) => {
                      const isFirst = index === 0
                      const isLast = index === filteredRecords.slice(0, 10).length - 1
                      
                      return (
                        <View key={record.id} className="flex-1 flex flex-col items-center">
                          <View
                            className="w-full rounded-t"
                            style={{
                              height: `${record.oiliness}%`,
                              backgroundColor: isFirst || isLast ? '#F59E0B' : '#FCD34D'
                            }}
                          />
                          <Text className="text-[10px] text-gray-400 mt-1 block">
                            {formatDate(record.created_at).slice(5)}
                          </Text>
                        </View>
                      )
                    })}
                  </View>
                </View>

                {/* 敏感度趋势 */}
                <View>
                  <View className="flex items-center justify-between mb-2">
                    <View className="flex items-center gap-2">
                      <View className="w-3 h-3 rounded-full bg-slate-500" />
                      <Text className="text-sm font-medium text-gray-700 block">敏感度</Text>
                    </View>
                    <Text className="text-sm text-gray-500 block">
                      {filteredRecords[0]?.sensitivity}% → {filteredRecords[filteredRecords.length - 1]?.sensitivity}%
                    </Text>
                  </View>
                  <View className="flex gap-1">
                    {filteredRecords.slice(0, 10).map((record, index) => {
                      const isFirst = index === 0
                      const isLast = index === filteredRecords.slice(0, 10).length - 1
                      
                      return (
                        <View key={record.id} className="flex-1 flex flex-col items-center">
                          <View
                            className="w-full rounded-t"
                            style={{
                              height: `${record.sensitivity}%`,
                              backgroundColor: isFirst || isLast ? '#EF4444' : '#FCA5A5'
                            }}
                          />
                          <Text className="text-[10px] text-gray-400 mt-1 block">
                            {formatDate(record.created_at).slice(5)}
                          </Text>
                        </View>
                      )
                    })}
                  </View>
                </View>
              </View>
            </View>

            {filteredRecords.length > 10 && (
              <View className="bg-gray-100 rounded-xl p-3 text-center">
                <Text className="text-sm text-gray-500 block">仅显示最近10次检测数据</Text>
              </View>
            )}
            
            <View className="h-4" />
          </View>
        )}

        {/* 时间轴视图 */}
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
                      isSelected ? 'border-2 border-blue-700' : ''
                    }`}
                  >
                    <View
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectRecord(record)
                      }}
                      className={`absolute left-[-32px] top-5 w-10 h-10 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-blue-700' : 'bg-gray-200'
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
                        <Text className="text-2xl font-bold text-blue-700 block">{score}分</Text>
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
                        <Text className="text-base font-bold text-blue-800 block">{record.sensitivity}%</Text>
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

        {/* 日历视图 */}
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
                              hasRecords ? 'active:bg-slate-50 cursor-pointer' : 'opacity-30'
                            } ${isSelected ? 'bg-blue-700' : ''} ${isToday && !isSelected ? 'border-2 border-blue-700' : ''}`}
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
                                  isSelected ? 'bg-white' : 'bg-blue-700'
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
                          <Text className="text-lg font-bold text-blue-700 block">{score}分</Text>
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
                            <Text className="text-sm font-bold text-blue-800 block">{record.sensitivity}%</Text>
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
      </Swipe>
    </View>
  )
}

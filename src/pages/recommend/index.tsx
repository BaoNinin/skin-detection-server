import { View, Text, Image, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect, useMemo } from 'react'
import { Network } from '@/network'
import EmptyState from '@/components/EmptyState'
import { SkeletonCard } from '@/components/Skeleton'

interface Product {
  id: string
  name: string
  brand: string
  category: string
  price: number
  description: string
  image: string
  rating: number
  tags: string[]
}

const categories = ['全部', '洁面', '保湿', '精华', '面霜', '面膜', '防晒']

export default function RecommendPage() {
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [skinSummary, setSkinSummary] = useState('')

  useEffect(() => {
    loadRecommendations()
  }, [])

  // 使用 useMemo 缓存过滤后的产品，避免不必要的重新计算
  const filteredProducts = useMemo(() => {
    if (selectedCategory === '全部') {
      return recommendations
    } else {
      return recommendations.filter(p => p.category === selectedCategory)
    }
  }, [selectedCategory, recommendations])

  const loadRecommendations = async () => {
    // 优先使用历史记录数据，如果没有则使用最新的检测结果
    const historyData = Taro.getStorageSync('historyRecordForRecommend')
    const skinData = historyData || Taro.getStorageSync('skinAnalysisResult')

    if (!skinData) {
      Taro.showToast({
        title: '请先进行皮肤检测',
        icon: 'none'
      })
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/index/index' })
      }, 1500)
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('skinType', skinData.skinType)
      params.append('moisture', String(skinData.moisture))
      params.append('oiliness', String(skinData.oiliness))
      params.append('sensitivity', String(skinData.sensitivity))

      // 如果有历史记录数据，也传递更多指标
      if (historyData) {
        if (historyData.acne !== undefined) params.append('acne', String(historyData.acne))
        if (historyData.wrinkles !== undefined) params.append('wrinkles', String(historyData.wrinkles))
        if (historyData.spots !== undefined) params.append('spots', String(historyData.spots))
        if (historyData.pores !== undefined) params.append('pores', String(historyData.pores))
        if (historyData.blackheads !== undefined) params.append('blackheads', String(historyData.blackheads))
      }

      if (skinData.concerns && skinData.concerns.length > 0) {
        params.append('concerns', skinData.concerns.join(','))
      }

      const res = await Network.request({
        url: `/api/skin/recommend?${params.toString()}`,
        method: 'GET'
      })

      if (res.data.code === 200) {
        setRecommendations(res.data.data)

        const recordDate = historyData ? '历史检测' : '本次检测'
        setSkinSummary(
          `基于${recordDate}结果，针对您的${skinData.skinType}，${
            skinData.concerns && skinData.concerns.length > 0
              ? skinData.concerns.join('、')
              : '无明显问题'
          }，推荐以下产品`
        )
      } else {
        Taro.showToast({
          title: res.data.msg || '加载失败',
          icon: 'none'
        })
      }
    } catch (err) {
      console.error('加载推荐失败:', err)
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBuyProduct = (product: Product) => {
    Taro.showToast({
      title: `已添加到购物车：${product.name}`,
      icon: 'success'
    })
  }

  return (
    <View className="min-h-screen bg-slate-50 pb-20">
      <ScrollView scrollY className="h-[calc(100vh-80px)]">
        <View className="p-4">
          <Text className="text-2xl font-bold text-gray-800 block">产品推荐</Text>
          <Text className="text-sm text-gray-500 mt-2 block">{skinSummary}</Text>
        </View>

        <View className="px-4 mb-4">
          <ScrollView scrollX className="whitespace-nowrap">
            <View className="inline-flex gap-2 pb-2">
              {categories.map((category) => (
                <View
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`inline-flex items-center px-4 py-2 rounded-full whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-blue-700 text-white'
                      : 'bg-white text-gray-700'
                  }`}
                >
                  <Text className="text-sm font-medium block">{category}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* 加载骨架屏 */}
        {loading && (
          <View className="px-4">
            <SkeletonCard />
            <SkeletonCard />
          </View>
        )}

        {/* 空状态 */}
        {!loading && filteredProducts.length === 0 && (
          <EmptyState
            icon="🛍️"
            title="暂无该分类产品"
            description="请尝试切换其他分类或重新进行皮肤检测"
          />
        )}

        {/* 产品列表 */}
        {!loading && filteredProducts.length > 0 && (
          <View className="px-4 space-y-4">
            {filteredProducts.map((product) => (
              <View key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <Image
                  src={product.image}
                  mode="aspectFill"
                  lazyLoad
                  className="w-full h-48"
                />
                <View className="p-5">
                  <View className="flex items-start justify-between mb-2">
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-gray-800 block">{product.name}</Text>
                      <Text className="text-sm text-gray-500 block">{product.brand}</Text>
                    </View>
                    <View className="flex items-center">
                      <Text className="text-amber-500 text-lg mr-1 block">★</Text>
                      <Text className="text-sm font-medium text-gray-700 block">{product.rating}</Text>
                    </View>
                  </View>

                  <View className="flex flex-wrap gap-2 mb-3">
                    <View className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100">
                      <Text className="text-xs text-blue-800 block">{product.category}</Text>
                    </View>
                    {product.tags.map((tag, index) => (
                      <View key={index} className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100">
                        <Text className="text-xs text-gray-600 block">{tag}</Text>                      </View>
                    ))}
                  </View>

                  <Text className="text-sm text-gray-600 mb-4 line-clamp-2 block">{product.description}</Text>

                  <View className="flex items-center justify-between">
                    <Text className="text-2xl font-bold text-blue-700 block">¥{product.price}</Text>
                    <Button
                      size="mini"
                      onClick={() => handleBuyProduct(product)}
                      className="bg-blue-700 text-white rounded-full"
                    >
                      去购买
                    </Button>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

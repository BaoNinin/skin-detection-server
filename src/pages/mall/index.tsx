import { View, Text } from '@tarojs/components'

export default function MallPage() {
  return (
    <View className="min-h-screen bg-rose-50 flex flex-col items-center justify-center">
      <View className="w-32 h-32 bg-rose-200 rounded-full flex items-center justify-center mb-6">
        <Text className="text-6xl">🛍️</Text>
      </View>

      <Text className="text-2xl font-bold text-gray-800 mb-3 block">商城</Text>

      <Text className="text-base text-gray-500 text-center px-8 block">
        商城功能正在开发中
      </Text>

      <Text className="text-sm text-gray-400 text-center px-8 mt-4 block">
        敬请期待更多优质护肤产品
      </Text>
    </View>
  )
}

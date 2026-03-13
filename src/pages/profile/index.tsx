import { View, Text } from '@tarojs/components'

export default function ProfilePage() {
  return (
    <View className="min-h-screen bg-rose-50 p-4">
      <Text className="text-2xl font-bold text-gray-800 mb-6 block">我的</Text>
      <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
        <View className="flex items-center">
          <View className="w-16 h-16 bg-rose-200 rounded-full flex items-center justify-center mr-4">
            <Text className="text-2xl">👩</Text>
          </View>
          <View>
            <Text className="text-lg font-semibold text-gray-800 block">用户</Text>
            <Text className="text-sm text-gray-500 block">开始您的皮肤检测之旅</Text>
          </View>
        </View>
      </View>

      <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
        <View className="p-4 border-b border-gray-100">
          <Text className="text-base text-gray-800 block">检测次数</Text>
          <Text className="text-2xl font-bold text-rose-400 block">0</Text>
        </View>
        <View className="p-4">
          <Text className="text-base text-gray-800 block">会员等级</Text>
          <Text className="text-sm text-gray-500 block">普通会员</Text>
        </View>
      </View>
    </View>
  )
}

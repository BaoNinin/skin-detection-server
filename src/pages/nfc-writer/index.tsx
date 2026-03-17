import { View, Text, Button, Input, Textarea, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { generateNFCWriteData } from '@/utils/nfc'

export default function NFCWriterPage() {
  const [deviceId, setDeviceId] = useState('DEVICE_001')
  const [pagePath, setPagePath] = useState('/pages/camera/index')
  const [action, setAction] = useState<'open' | 'analyze'>('analyze')
  const [generatedData, setGeneratedData] = useState('')

  const handleGenerate = () => {
    const data = generateNFCWriteData({
      action,
      page: pagePath,
      deviceId,
    })

    setGeneratedData(data)

    console.log('生成的 NFC 数据:', data)
  }

  const handleCopy = () => {
    Taro.setClipboardData({
      data: generatedData,
      success: () => {
        Taro.showToast({
          title: '已复制到剪贴板',
          icon: 'success',
        })
      },
    })
  }

  const handleSaveQRCode = () => {
    // 生成二维码（需要引入二维码生成库）
    Taro.showToast({
      title: '二维码生成功能开发中',
      icon: 'none',
    })
  }

  const handleTestNFC = () => {
    // 测试 NFC 功能
    Taro.navigateTo({
      url: '/pages/camera/index?from=nfc&deviceId=' + deviceId,
    })
  }

  return (
    <ScrollView className="h-screen bg-gray-50">
      <View className="p-6">
        {/* 标题 */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800 block">NFC 写入工具</Text>
          <Text className="text-sm text-gray-500 mt-2 block">
            生成 NFC 数据并写入到空白芯片中
          </Text>
        </View>

        {/* 设备 ID */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-sm font-medium text-gray-700 mb-2 block">设备 ID</Text>
          <Input
            className="w-full bg-gray-50 rounded-lg px-4 py-3"
            placeholder="输入设备 ID（如：DEVICE_001）"
            value={deviceId}
            onInput={(e) => setDeviceId(e.detail.value)}
          />
        </View>

        {/* 跳转页面 */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-sm font-medium text-gray-700 mb-2 block">跳转页面</Text>
          <Input
            className="w-full bg-gray-50 rounded-lg px-4 py-3"
            placeholder="输入页面路径（如：/pages/camera/index）"
            value={pagePath}
            onInput={(e) => setPagePath(e.detail.value)}
          />
        </View>

        {/* 操作类型 */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-sm font-medium text-gray-700 mb-2 block">操作类型</Text>
          <View className="flex gap-2">
            <Button
              className={`flex-1 py-3 rounded-lg ${
                action === 'analyze' ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setAction('analyze')}
            >
              自动分析
            </Button>
            <Button
              className={`flex-1 py-3 rounded-lg ${
                action === 'open' ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setAction('open')}
            >
              打开页面
            </Button>
          </View>
        </View>

        {/* 生成按钮 */}
        <Button
          className="w-full bg-blue-700 text-white rounded-xl py-4 mb-6 font-medium"
          onClick={handleGenerate}
        >
          生成 NFC 数据
        </Button>

        {/* 生成的数据 */}
        {generatedData && (
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <View className="flex items-center justify-between mb-2">
              <Text className="text-sm font-medium text-gray-700 block">生成的 NFC 数据</Text>
              <Button
                className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded"
                onClick={handleCopy}
              >
                复制
              </Button>
            </View>
            <Textarea
              className="w-full bg-gray-50 rounded-lg p-3 text-sm"
              value={generatedData}
              disabled
              maxlength={-1}
            />
          </View>
        )}

        {/* 写入说明 */}
        <View className="bg-blue-50 rounded-xl p-4 mb-4">
          <Text className="text-sm font-medium text-blue-800 mb-2 block">📝 写入步骤</Text>
          <Text className="text-xs text-blue-700 block">
            1. 复制上方的 NFC 数据{'\n'}
            2. 下载 NFC 写入工具（Android: NFC Tools, iOS: NFC Writer）{'\n'}
            3. 选择 "Write" → "Add a record" → "Text"{'\n'}
            4. 粘贴数据并写入 NFC 芯片{'\n'}
            5. 测试：靠近芯片，应该自动打开小程序
          </Text>
        </View>

        {/* 测试按钮 */}
        <View className="flex gap-3">
          <Button
            className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-4"
            onClick={handleTestNFC}
          >
            测试 NFC 跳转
          </Button>
        </View>

        {/* 注意事项 */}
        <View className="mt-6 bg-yellow-50 rounded-xl p-4">
          <Text className="text-sm font-medium text-yellow-800 mb-2 block">⚠️ 注意事项</Text>
          <Text className="text-xs text-yellow-700 block">
            • iOS 需要小程序在前台才能检测 NFC{'\n'}
            • Android 支持后台检测{'\n'}
            • 确保 NFC 功能已开启{'\n'}
            • 部分芯片可能需要格式化后才能写入
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

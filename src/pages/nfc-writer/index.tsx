import { View, Text, Button, Input, Textarea, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { generateNFCWriteData } from '@/utils/nfc'
import { Network } from '@/network'

export default function NFCWriterPage() {
  const [deviceId, setDeviceId] = useState('DEVICE_001')
  const [pagePath, setPagePath] = useState('/pages/camera/index')
  const [action, setAction] = useState<'open' | 'analyze'>('analyze')
  const [generatedData, setGeneratedData] = useState('')
  const [urlScheme, setUrlScheme] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = () => {
    const data = generateNFCWriteData({
      action,
      page: pagePath,
      deviceId,
    })

    setGeneratedData(data)
    setUrlScheme('') // 清空 URL Scheme

    console.log('生成的 NFC 数据:', data)
  }

  const handleGenerateURLScheme = async () => {
    setIsGenerating(true)

    try {
      const response = await Network.request({
        url: '/api/url-scheme/nfc-data',
        method: 'POST',
        data: {
          deviceId,
          page: pagePath,
          action,
        },
      })

      console.log('URL Scheme 响应:', response.data)

      if (response.data.code === 200) {
        const schemeData = response.data.data
        setUrlScheme(schemeData.urlScheme)
        setGeneratedData(schemeData.customData)

        Taro.showToast({
          title: '生成成功',
          icon: 'success',
        })
      } else {
        throw new Error(response.data.msg || '生成失败')
      }
    } catch (error: any) {
      console.error('生成 URL Scheme 失败:', error)
      Taro.showToast({
        title: error.message || '生成失败',
        icon: 'none',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    const textToCopy = urlScheme || generatedData
    Taro.setClipboardData({
      data: textToCopy,
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
    <View className="nfc-writer-page min-h-screen bg-gray-50 p-4">
      <ScrollView className="h-full">
        <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <Text className="block text-xl font-bold mb-4">NFC 数据写入工具</Text>

          {/* 设备 ID */}
          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">设备 ID</Text>
            <View className="bg-gray-50 rounded-lg px-4 py-3">
              <Input
                className="w-full"
                value={deviceId}
                onInput={(e) => setDeviceId(e.detail.value)}
                placeholder="请输入设备 ID"
              />
            </View>
          </View>

          {/* 页面路径 */}
          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">页面路径</Text>
            <View className="bg-gray-50 rounded-lg px-4 py-3">
              <Input
                className="w-full"
                value={pagePath}
                onInput={(e) => setPagePath(e.detail.value)}
                placeholder="请输入页面路径"
              />
            </View>
          </View>

          {/* 操作类型 */}
          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">操作类型</Text>
            <View className="flex flex-row gap-2">
              <Button
                className={`flex-1 ${action === 'open' ? 'bg-blue-500' : 'bg-gray-200'}`}
                onClick={() => setAction('open')}
              >
                打开页面
              </Button>
              <Button
                className={`flex-1 ${action === 'analyze' ? 'bg-blue-500' : 'bg-gray-200'}`}
                onClick={() => setAction('analyze')}
              >
                皮肤分析
              </Button>
            </View>
          </View>

          {/* 生成按钮 */}
          <View className="flex flex-row gap-2">
            <Button className="flex-1 bg-blue-500" onClick={handleGenerate}>
              生成 NFC 数据
            </Button>
            <Button
              className="flex-1 bg-green-500"
              onClick={handleGenerateURLScheme}
              loading={isGenerating}
            >
              生成 URL Scheme
            </Button>
          </View>
        </View>

        {/* NFC 数据显示 */}
        {generatedData && (
          <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <Text className="block text-lg font-semibold mb-2">NFC 数据</Text>
            <View className="bg-gray-50 rounded-lg p-3 mb-3">
              <Textarea
                className="w-full text-sm"
                value={generatedData}
                placeholder="生成的 NFC 数据"
                disabled
              />
            </View>
            <Button className="w-full bg-gray-500" onClick={handleCopy}>
              复制数据
            </Button>
          </View>
        )}

        {/* URL Scheme 显示 */}
        {urlScheme && (
          <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <Text className="block text-lg font-semibold mb-2">URL Scheme</Text>
            <Text className="block text-xs text-gray-500 mb-2">
              请将此 URL Scheme 写入 NFC 芯片
            </Text>
            <View className="bg-gray-50 rounded-lg p-3 mb-3">
              <Textarea
                className="w-full text-sm text-blue-600"
                value={urlScheme}
                placeholder="生成的 URL Scheme"
                disabled
              />
            </View>
            <Button className="w-full bg-green-500" onClick={handleCopy}>
              复制 URL Scheme
            </Button>
          </View>
        )}

        {/* 其他操作 */}
        <View className="bg-white rounded-lg shadow-sm p-4">
          <Text className="block text-lg font-semibold mb-3">其他操作</Text>
          <View className="flex flex-col gap-2">
            <Button className="w-full bg-orange-500" onClick={handleSaveQRCode}>
              生成二维码
            </Button>
            <Button className="w-full bg-purple-500" onClick={handleTestNFC}>
              测试 NFC 跳转
            </Button>
          </View>
        </View>

        {/* 使用说明 */}
        <View className="mt-4 bg-yellow-50 rounded-lg p-4">
          <Text className="block text-sm font-medium text-yellow-800 mb-2">
            使用说明：
          </Text>
          <Text className="block text-xs text-yellow-700">
            1. 配置设备 ID 和页面路径{'\n'}
            2. 选择操作类型{'\n'}
            3. 点击 &ldquo;生成 URL Scheme&rdquo; 按钮{'\n'}
            4. 复制生成的 URL Scheme{'\n'}
            5. 使用 NFC 写入工具将 URL Scheme 写入芯片{'\n'}
            6. 测试 NFC 跳转功能
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

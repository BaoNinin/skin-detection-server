/**
 * NFC 工具类
 * 用于处理 NFC 读写和监听
 */

import Taro from '@tarojs/taro'

export interface NFCData {
  action: string
  page: string
  deviceId?: string
  timestamp?: number
}

/**
 * 检查设备是否支持 NFC
 */
export function checkNFCSupport(): boolean {
  const systemInfo = Taro.getSystemInfoSync()
  return !!systemInfo.NFC
}

/**
 * 获取 NFC 适配器
 */
export function getNFCAdapter(): Taro.NFCAdapter | null {
  if (!checkNFCSupport()) {
    console.warn('设备不支持 NFC')
    return null
  }

  try {
    // @ts-ignore - Taro 类型定义可能不完整
    return Taro.getNFCAdapter()
  } catch (error) {
    console.error('获取 NFC 适配器失败:', error)
    return null
  }
}

/**
 * 启动 NFC 监听
 */
export function startNFCDiscovery(
  onDiscovered: (data: NFCData) => void,
  onError?: (error: any) => void
): void {
  const nfcAdapter = getNFCAdapter()

  if (!nfcAdapter) {
    console.error('NFC 适配器不可用')
    return
  }

  console.log('启动 NFC 监听...')

  // 启动 NFC
  nfcAdapter.startDiscovery({
    success: () => {
      console.log('NFC 监听已启动')
    },
    fail: (err) => {
      console.error('启动 NFC 监听失败:', err)
      onError?.(err)
    },
  })

  // 监听 NFC 发现事件
  nfcAdapter.onDiscovered((res: any) => {
    console.log('发现 NFC 标签:', res)

    try {
      // 解析 NFC 数据
      const nfcData = parseNFCData(res.records || res)
      console.log('解析的 NFC 数据:', nfcData)

      // 执行回调
      onDiscovered(nfcData)

      // 处理跳转
      handleNFCData(nfcData)
    } catch (error) {
      console.error('处理 NFC 数据失败:', error)
      onError?.(error)
    }
  })
}

/**
 * 停止 NFC 监听
 */
export function stopNFCDiscovery(): void {
  const nfcAdapter = getNFCAdapter()

  if (!nfcAdapter) {
    return
  }

  console.log('停止 NFC 监听...')

  nfcAdapter.stopDiscovery({
    success: () => {
      console.log('NFC 监听已停止')
    },
    fail: (err) => {
      console.error('停止 NFC 监听失败:', err)
    },
  })
}

/**
 * 解析 NFC 数据
 */
export function parseNFCData(records: any[]): NFCData {
  if (!records || records.length === 0) {
    throw new Error('NFC 数据为空')
  }

  // 尝试解析文本记录
  for (const record of records) {
    try {
      // 如果是文本记录，尝试解析 JSON
      if (record.payload) {
        // 将 ArrayBuffer 转换为字符串
        const text = arrayBufferToString(record.payload)

        console.log('NFC 文本内容:', text)

        // 尝试解析为 JSON
        const jsonData = JSON.parse(text)

        // 验证数据格式
        if (jsonData.action && jsonData.page) {
          return jsonData as NFCData
        }
      }
    } catch (error) {
      console.log('解析记录失败:', error)
      continue
    }
  }

  // 如果无法解析，返回默认数据
  return {
    action: 'open',
    page: 'index',
    timestamp: Date.now(),
  }
}

/**
 * 处理 NFC 数据
 */
export function handleNFCData(data: NFCData): void {
  console.log('处理 NFC 数据:', data)

  // 保存 NFC 设备 ID
  if (data.deviceId) {
    Taro.setStorageSync('nfc_device_id', data.deviceId)
    console.log('保存 NFC 设备 ID:', data.deviceId)
  }

  // 保存 NFC 触发时间
  if (data.timestamp) {
    Taro.setStorageSync('nfc_timestamp', data.timestamp)
  }

  // 根据数据跳转到相应页面
  switch (data.action) {
    case 'open':
      navigateToPage(data.page)
      break

    case 'analyze':
      // 直接跳转到相机页面进行分析
      navigateToPage('/pages/camera/index')
      break

    default:
      console.log('未知的 NFC action:', data.action)
      navigateToPage('/pages/index/index')
  }
}

/**
 * 跳转到指定页面
 */
function navigateToPage(pagePath: string): void {
  console.log('跳转到页面:', pagePath)

  Taro.reLaunch({
    url: pagePath,
    success: () => {
      console.log('页面跳转成功')
    },
    fail: (err) => {
      console.error('页面跳转失败:', err)
      // 降级到首页
      Taro.reLaunch({
        url: '/pages/index/index',
      })
    },
  })
}

/**
 * ArrayBuffer 转 String
 */
function arrayBufferToString(buffer: ArrayBuffer): string {
  const decoder = new TextDecoder('utf-8')
  return decoder.decode(buffer)
}

/**
 * String 转 ArrayBuffer
 */
export function stringToArrayBuffer(str: string): ArrayBuffer {
  const encoder = new TextEncoder()
  return encoder.encode(str).buffer
}

/**
 * 生成 NFC 写入数据
 */
export function generateNFCWriteData(options: {
  action: string
  page: string
  deviceId?: string
}): string {
  const data: NFCData = {
    action: options.action,
    page: options.page,
    deviceId: options.deviceId,
    timestamp: Date.now(),
  }

  return JSON.stringify(data)
}

/**
 * 检查是否由 NFC 启动
 */
export function checkNFCStartup(): boolean {
  const launchOptions = Taro.getLaunchOptionsSync()
  const { query, scene } = launchOptions

  console.log('启动参数:', { query, scene })

  // 检查是否来自 NFC
  if (query?.from === 'nfc' || scene === 1047) {
    console.log('检测到 NFC 启动')

    // 保存设备 ID（如果有）
    if (query?.deviceId) {
      console.log('NFC 设备 ID:', query.deviceId)
      Taro.setStorageSync('nfc_device_id', query.deviceId)
    }

    return true
  }

  return false
}

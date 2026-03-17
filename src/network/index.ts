/**
 * 网络请求封装模块
 * 
 * 功能：
 * - 封装 Taro.request、Taro.uploadFile、Taro.downloadFile
 * - 自动添加项目域名前缀
 * - 统一错误处理
 * - 请求/响应日志打印
 */

import Taro from '@tarojs/taro'

// 获取项目域名
const getProjectDomain = (): string => {
  // 开发环境使用相对路径，由 Vite proxy 处理
  if (process.env.NODE_ENV === 'development') {
    return ''
  }

  // 生产环境使用配置的域名
  const domain = process.env.PROJECT_DOMAIN || ''
  return domain
}

// 判断是否为完整 URL
const isFullUrl = (url: string): boolean => {
  return url.startsWith('http://') || url.startsWith('https://')
}

// 构建 URL
const buildUrl = (url: string): string => {
  // 如果是完整 URL，直接返回
  if (isFullUrl(url)) {
    return url
  }

  // 否则添加域名前缀
  const domain = getProjectDomain()
  return domain ? `${domain}${url}` : url
}

// 请求方法
export interface RequestOptions extends Taro.request.Option {
  url: string
}

// 上传方法
export interface UploadFileOptions extends Omit<Taro.uploadFile.Option, 'url'> {
  url: string
  filePath: string
  name: string
}

// 下载方法
export interface DownloadFileOptions extends Omit<Taro.downloadFile.Option, 'url'> {
  url: string
}

// 统一响应格式
export interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

class Network {
  /**
   * 发起 GET/POST 请求
   */
  static async request<T = any>(options: RequestOptions): Promise<Taro.request.SuccessCallbackResult<ApiResponse<T>>> {
    const { url, method = 'GET', data, header = {}, ...rest } = options

    // 构建 URL
    const fullUrl = buildUrl(url)

    // 打印请求日志
    console.log('=== Network Request ===')
    console.log('URL:', fullUrl)
    console.log('Method:', method)
    console.log('Data:', data)
    console.log('Headers:', header)

    try {
      const response = await Taro.request({
        url: fullUrl,
        method,
        data,
        header: {
          'Content-Type': 'application/json',
          ...header,
        },
        ...rest,
      })

      // 打印响应日志
      console.log('=== Network Response ===')
      console.log('Status:', response.statusCode)
      console.log('Data:', response.data)

      return response
    } catch (error) {
      console.error('=== Network Error ===')
      console.error('URL:', fullUrl)
      console.error('Error:', error)
      throw error
    }
  }

  /**
   * 上传文件
   */
  static async uploadFile(options: UploadFileOptions): Promise<Taro.uploadFile.SuccessCallbackResult> {
    const { url, filePath, name, formData = {}, header = {}, ...rest } = options

    // 构建 URL
    const fullUrl = buildUrl(url)

    // 打印请求日志
    console.log('=== Network Upload ===')
    console.log('URL:', fullUrl)
    console.log('FilePath:', filePath)
    console.log('Name:', name)
    console.log('FormData:', formData)
    console.log('Headers:', header)

    try {
      const response = await Taro.uploadFile({
        url: fullUrl,
        filePath,
        name,
        formData,
        header: {
          // 不要设置 Content-Type，让 Taro 自动处理 multipart/form-data
          ...header,
        },
        ...rest,
      })

      // 打印响应日志
      console.log('=== Network Upload Response ===')
      console.log('Status:', response.statusCode)
      console.log('Data:', response.data)

      return response
    } catch (error) {
      console.error('=== Network Upload Error ===')
      console.error('URL:', fullUrl)
      console.error('Error:', error)
      throw error
    }
  }

  /**
   * 下载文件
   */
  static async downloadFile(options: DownloadFileOptions): Promise<Taro.downloadFile.SuccessCallbackResult> {
    const { url, header = {}, ...rest } = options

    // 构建 URL
    const fullUrl = buildUrl(url)

    // 打印请求日志
    console.log('=== Network Download ===')
    console.log('URL:', fullUrl)
    console.log('Headers:', header)

    try {
      const response = await Taro.downloadFile({
        url: fullUrl,
        header,
        ...rest,
      })

      // 打印响应日志
      console.log('=== Network Download Response ===')
      console.log('Status:', response.statusCode)
      console.log('TempFilePath:', response.tempFilePath)

      return response
    } catch (error) {
      console.error('=== Network Download Error ===')
      console.error('URL:', fullUrl)
      console.error('Error:', error)
      throw error
    }
  }
}

export default Network

import Taro from '@tarojs/taro'

// 缓存接口
interface CacheItem {
  data: any
  timestamp: number
}

// 网络请求缓存管理
class RequestCache {
  private cache: Map<string, CacheItem> = new Map()
  private defaultTTL: number = 5 * 60 * 1000 // 默认缓存 5 分钟

  // 生成缓存键
  private generateKey(url: string, method: string, data?: any): string {
    const dataStr = data ? JSON.stringify(data) : ''
    return `${method}:${url}:${dataStr}`
  }

  // 获取缓存
  get(url: string, method: string, data?: any): any {
    const key = this.generateKey(url, method, data)
    const item = this.cache.get(key)

    if (!item) return null

    // 检查缓存是否过期
    const now = Date.now()
    if (now - item.timestamp > this.defaultTTL) {
      this.cache.delete(key)
      return null
    }

    console.log(`[缓存命中] ${method} ${url}`)
    return item.data
  }

  // 设置缓存（只缓存 GET 请求）
  set(url: string, method: string, data: any, response: any): void {
    if (method.toUpperCase() !== 'GET') return

    const key = this.generateKey(url, method, data)
    this.cache.set(key, {
      data: response,
      timestamp: Date.now()
    })
    console.log(`[缓存保存] ${method} ${url}`)
  }

  // 清除缓存
  clear(): void {
    this.cache.clear()
    console.log('[缓存清除] 所有缓存已清除')
  }

  // 清除指定 URL 的缓存
  clearUrl(url: string): void {
    const keysToDelete: string[] = []
    this.cache.forEach((_, key) => {
      if (key.includes(url)) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => this.cache.delete(key))
    console.log(`[缓存清除] ${url} 相关缓存已清除`)
  }
}

// 全局缓存实例
const requestCache = new RequestCache()

export namespace Network {
    const createUrl = (url: string): string => {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url
        }
        return `${PROJECT_DOMAIN}${url}`
    }

    export const request: any = option => {
        const fullUrl = createUrl(option.url)
        const method = (option.method || 'GET').toUpperCase()

        // 尝试从缓存获取（仅 GET 请求）
        if (method === 'GET' && option.method === 'GET') {
          const cachedData = requestCache.get(fullUrl, method, option.data)
          if (cachedData) {
            return Promise.resolve({
              statusCode: 200,
              data: cachedData,
              header: {},
              cookies: []
            } as any)
          }
        }

        // 发送网络请求
        return Taro.request({
            ...option,
            url: fullUrl,
        }).then(response => {
          // 缓存成功响应（仅 GET 请求）
          if (method === 'GET' && response.statusCode === 200) {
            requestCache.set(fullUrl, method, option.data, response.data)
          }
          return response
        })
    }

    export const uploadFile: typeof Taro.uploadFile = option => {
        return Taro.uploadFile({
            ...option,
            url: createUrl(option.url),
        })
    }

    export const downloadFile: typeof Taro.downloadFile = option => {
        return Taro.downloadFile({
            ...option,
            url: createUrl(option.url),
        })
    }

    // 缓存管理方法
    export const cache = {
      clear: () => requestCache.clear(),
      clearUrl: (url: string) => requestCache.clearUrl(createUrl(url))
    }
}

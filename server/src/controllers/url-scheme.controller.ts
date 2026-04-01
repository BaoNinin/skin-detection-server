import { Controller, Get, Post, Body, Query } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'

@Controller('url-scheme')
export class URLSchemeController {
  private readonly accessToken: string | null = null

  constructor(private readonly configService: ConfigService) {}

  /**
   * 生成微信小程序 URL Scheme
   * 
   * POST /api/url-scheme/generate
   * 
   * 请求体：
   * {
   *   "path": "pages/camera/index",
   *   "query": { "from": "nfc", "deviceId": "DEVICE_001" }
   * }
   * 
   * 响应：
   * {
   *   "code": 200,
   *   "msg": "生成成功",
   *   "data": {
   *     "openlink": "weixin://dl/business/?t=TICKET",
   *     "expiresIn": 30
   *   }
   * }
   */
  @Post('generate')
  async generateURLScheme(@Body() body: {
    path?: string
    query?: Record<string, any>
  }) {
    try {
      const { path = 'pages/landing/index', query = {} } = body

      console.log('=== 生成 URL Scheme ===')
      console.log('路径:', path)
      console.log('参数:', query)

      // 获取微信 Access Token
      const accessToken = await this.getAccessToken()

      if (!accessToken) {
        throw new Error('无法获取微信 Access Token')
      }

      console.log('Access Token 获取成功:', accessToken.substring(0, 10) + '...')

      // 生成 URL Scheme
      const response = await axios.post(
        'https://api.weixin.qq.com/wxa/generatescheme',
        {
          jump_wxa: {
            path,
            query: this.buildQuery(query),
          },
          is_expire: true,
          expire_type: 1, // 1: 到期失效，2: 永久有效
          expire_interval: 30, // 30天后失效
        },
        {
          params: {
            access_token: accessToken,
          },
        }
      )

      console.log('微信 API 响应:', response.data)

      if (response.data.errcode !== 0) {
        throw new Error(`微信 API 错误: ${response.data.errmsg}`)
      }

      const openlink = response.data.openlink
      console.log('生成的 URL Scheme:', openlink)

      return {
        code: 200,
        msg: '生成成功',
        data: {
          openlink,
          expiresIn: 30, // 30天
          path,
          query,
        },
      }
    } catch (error: any) {
      console.error('生成 URL Scheme 失败:', error)
      return {
        code: 500,
        msg: error.message || '生成失败',
        data: null,
      }
    }
  }

  /**
   * 生成 NFC 写入数据
   * 
   * POST /api/url-scheme/nfc-data
   */
  @Post('nfc-data')
  async generateNFCData(@Body() body: {
    deviceId?: string
    page?: string
    action?: 'open' | 'analyze'
  }) {
    try {
      const { deviceId = 'DEVICE_001', page = '/pages/camera/index', action = 'analyze' } = body

      console.log('=== 生成 NFC 数据 ===')
      console.log('设备 ID:', deviceId)
      console.log('页面:', page)
      console.log('操作:', action)

      // 方法 1：使用 URL Scheme（推荐）
      const urlSchemeResult = await this.generateURLScheme({
        path: page.replace(/^\//, ''),
        query: {
          from: 'nfc',
          action,
          deviceId,
        },
      })

      if (urlSchemeResult.code !== 200) {
        throw new Error('生成 URL Scheme 失败')
      }

      // 方法 2：使用自定义数据（备用方案）
      const customData = {
        action,
        page,
        deviceId,
        timestamp: Date.now(),
      }

      // 验证 URL Scheme 结果
      if (!urlSchemeResult.data) {
        throw new Error('生成 URL Scheme 失败：返回数据为空')
      }

      return {
        code: 200,
        msg: '生成成功',
        data: {
          // 方案 1：URL Scheme（推荐）
          urlScheme: urlSchemeResult.data.openlink,
          nfcDataFormat: 'URI', // NDEF URI Record

          // 方案 2：自定义数据（备用）
          customData: JSON.stringify(customData),
          customDataFormat: 'TEXT', // NDEF Text Record

          // 推荐方案
          recommended: 'urlScheme',
          recommendedFormat: 'URI',
        },
      }
    } catch (error: any) {
      console.error('生成 NFC 数据失败:', error)
      return {
        code: 500,
        msg: error.message || '生成失败',
        data: null,
      }
    }
  }

  /**
   * 获取微信 Access Token
   */
  private async getAccessToken(): Promise<string | null> {
    try {
      // 从环境变量获取 AppID 和 AppSecret
      const appid = this.configService.get<string>('WECHAT_APPID')
      const secret = this.configService.get<string>('WECHAT_APP_SECRET')

      if (!appid || !secret) {
        console.error('微信 AppID 或 AppSecret 未配置')
        return null
      }

      console.log('获取微信 Access Token...')
      console.log('AppID:', appid)

      const response = await axios.get(
        'https://api.weixin.qq.com/cgi-bin/token',
        {
          params: {
            grant_type: 'client_credential',
            appid,
            secret,
          },
        }
      )

      // 检查微信 API 响应
      if (response.data.errcode) {
        console.error('获取 Access Token 失败:', response.data)
        return null
      }

      if (!response.data.access_token) {
        console.error('获取 Access Token 失败: 响应中没有 access_token', response.data)
        return null
      }

      const accessToken = response.data.access_token
      console.log('Access Token 获取成功')

      return accessToken
    } catch (error) {
      console.error('获取 Access Token 异常:', error)
      return null
    }
  }

  /**
   * 构建查询字符串
   */
  private buildQuery(query: Record<string, any>): string {
    const queryString = Object.keys(query)
      .map((key) => {
        const value = query[key]
        if (typeof value === 'object') {
          return `${key}=${encodeURIComponent(JSON.stringify(value))}`
        }
        return `${key}=${encodeURIComponent(value)}`
      })
      .join('&')

    return queryString
  }
}

/**
 * 微信小程序 URL Scheme 生成服务
 *
 * 用途：生成 URL Scheme 用于外部拉起小程序
 * 文档：https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/url-link/urlscheme.generate.html
 */

import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class WechatUrlSchemeService {
  private appId = process.env.WECHAT_APP_ID || '';
  private appSecret = process.env.WECHAT_APP_SECRET || '';

  /**
   * 生成 URL Scheme
   *
   * @param path 小程序页面路径
   * @param query 查询参数（对象形式）
   * @param isExpire 是否永久有效（需要小程序认证）
   * @param expireTime 有效期（秒），最长 30 天 = 2592000 秒
   * @returns URL Scheme 字符串
   */
  async generateUrlScheme(
    path: string,
    query: Record<string, any> = {},
    isExpire: boolean = false,
    expireTime: number = 2592000 // 默认 30 天
  ): Promise<string> {
    try {
      console.log('=== 生成 URL Scheme ===');
      console.log('页面路径:', path);
      console.log('查询参数:', query);

      // 1. 获取 Access Token
      const accessToken = await this.getAccessToken();
      console.log('Access Token:', accessToken.substring(0, 10) + '...');

      // 2. 构建请求参数
      const jumpWxa = {
        path,
        query: this.buildQueryString(query),
      };

      const requestBody = {
        jump_wxa: jumpWxa,
        is_expire: isExpire,
        expire_type: isExpire ? 0 : 1, // 0: 永久有效, 1: 临时有效
        expire_interval: isExpire ? undefined : expireTime,
      };

      console.log('请求参数:', JSON.stringify(requestBody, null, 2));

      // 3. 调用微信 API
      const apiUrl = `https://api.weixin.qq.com/wxa/generatescheme?access_token=${accessToken}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('微信 API 响应:', JSON.stringify(data, null, 2));

      if (data.errcode !== 0) {
        throw new Error(`生成 URL Scheme 失败: ${data.errcode} - ${data.errmsg}`);
      }

      const urlScheme = data.openlink;
      console.log('生成的 URL Scheme:', urlScheme);

      return urlScheme;
    } catch (error) {
      console.error('生成 URL Scheme 失败:', error);
      throw error;
    }
  }

  /**
   * 生成 URL Link（H5 专用）
   *
   * @param path 小程序页面路径
   * @param query 查询参数
   * @param isExpire 是否永久有效
   * @param expireTime 有效期（秒）
   * @returns URL Link 字符串
   */
  async generateUrlLink(
    path: string,
    query: Record<string, any> = {},
    isExpire: boolean = false,
    expireTime: number = 2592000
  ): Promise<string> {
    try {
      console.log('=== 生成 URL Link ===');
      console.log('页面路径:', path);
      console.log('查询参数:', query);

      // 1. 获取 Access Token
      const accessToken = await this.getAccessToken();

      // 2. 构建请求参数
      const jumpWxa = {
        path,
        query: this.buildQueryString(query),
      };

      const requestBody = {
        jump_wxa: jumpWxa,
        is_expire: isExpire,
        expire_type: isExpire ? 0 : 1,
        expire_interval: isExpire ? undefined : expireTime,
      };

      console.log('请求参数:', JSON.stringify(requestBody, null, 2));

      // 3. 调用微信 API
      const apiUrl = `https://api.weixin.qq.com/wxa/generate_urllink?access_token=${accessToken}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('微信 API 响应:', JSON.stringify(data, null, 2));

      if (data.errcode !== 0) {
        throw new Error(`生成 URL Link 失败: ${data.errcode} - ${data.errmsg}`);
      }

      const urlLink = data.url_link;
      console.log('生成的 URL Link:', urlLink);

      return urlLink;
    } catch (error) {
      console.error('生成 URL Link 失败:', error);
      throw error;
    }
  }

  /**
   * 获取 Access Token
   */
  private async getAccessToken(): Promise<string> {
    const apiUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.errcode) {
      throw new Error(`获取 Access Token 失败: ${data.errcode} - ${data.errmsg}`);
    }

    return data.access_token;
  }

  /**
   * 构建查询字符串
   */
  private buildQueryString(params: Record<string, any>): string {
    const queryPairs = Object.entries(params).map(([key, value]) => {
      return `${key}=${encodeURIComponent(String(value))}`;
    });

    return queryPairs.join('&');
  }
}

/**
 * 微信 URL Scheme API 控制器
 *
 * 提供接口用于生成 URL Scheme 和 URL Link
 */

import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { WechatUrlSchemeService } from '../services/wechat-url-scheme.service';

@Controller('wechat')
export class WechatUrlSchemeController {
  constructor(
    private readonly urlSchemeService: WechatUrlSchemeService,
  ) {}

  /**
   * 生成 URL Scheme
   *
   * POST /api/wechat/url-scheme
   *
   * 请求体示例：
   * {
   *   "path": "pages/camera/index",
   *   "query": {
   *     "userId": "123",
   *     "from": "external"
   *   },
   *   "isExpire": false,
   *   "expireTime": 2592000
   * }
   */
  @Post('url-scheme')
  async generateUrlScheme(@Body() body: {
    path: string;
    query?: Record<string, any>;
    isExpire?: boolean;
    expireTime?: number;
  }) {
    try {
      const { path, query = {}, isExpire = false, expireTime = 2592000 } = body;

      const urlScheme = await this.urlSchemeService.generateUrlScheme(
        path,
        query,
        isExpire,
        expireTime
      );

      return {
        code: 200,
        msg: '生成成功',
        data: {
          urlScheme,
          path,
          query,
          expireTime,
          isExpire,
        },
      };
    } catch (error: any) {
      return {
        code: 500,
        msg: error.message || '生成失败',
        data: null,
      };
    }
  }

  /**
   * 生成 URL Link（H5 专用）
   *
   * POST /api/wechat/url-link
   */
  @Post('url-link')
  async generateUrlLink(@Body() body: {
    path: string;
    query?: Record<string, any>;
    isExpire?: boolean;
    expireTime?: number;
  }) {
    try {
      const { path, query = {}, isExpire = false, expireTime = 2592000 } = body;

      const urlLink = await this.urlSchemeService.generateUrlLink(
        path,
        query,
        isExpire,
        expireTime
      );

      return {
        code: 200,
        msg: '生成成功',
        data: {
          urlLink,
          path,
          query,
          expireTime,
          isExpire,
        },
      };
    } catch (error: any) {
      return {
        code: 500,
        msg: error.message || '生成失败',
        data: null,
      };
    }
  }

  /**
   * 生成预设场景的 URL Scheme
   *
   * GET /api/wechat/scheme/preset?scene=xxx
   */
  @Get('scheme/preset')
  async generatePresetScheme(@Query('scene') scene: string) {
    try {
      let path = '';
      let query: Record<string, any> = {};

      // 根据场景预设配置
      switch (scene) {
        case 'camera':
          path = 'pages/camera/index';
          query = { from: 'external_link' };
          break;
        case 'history':
          path = 'pages/history/index';
          query = { from: 'external_link' };
          break;
        case 'profile':
          path = 'pages/profile/index';
          query = { from: 'external_link' };
          break;
        case 'mall':
          path = 'pages/mall/index';
          query = { from: 'external_link' };
          break;
        default:
          return {
            code: 400,
            msg: '无效的场景参数',
            data: null,
          };
      }

      const urlScheme = await this.urlSchemeService.generateUrlScheme(path, query);

      return {
        code: 200,
        msg: '生成成功',
        data: {
          urlScheme,
          path,
          query,
          scene,
        },
      };
    } catch (error: any) {
      return {
        code: 500,
        msg: error.message || '生成失败',
        data: null,
      };
    }
  }
}

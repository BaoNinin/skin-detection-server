import { Controller, Get } from '@nestjs/common';
import { AppService } from '@/app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  getHello(): { status: string; data: string } {
    return {
      status: 'success',
      data: this.appService.getHello()
    };
  }

  @Get('health')
  getHealth(): { status: string; data: string } {
    return {
      status: 'success',
      data: new Date().toISOString(),
    };
  }

  @Get('config-check')
  getConfigCheck(): { status: string; data: any } {
    return {
      status: 'success',
      data: {
        cozeModel: process.env.COZE_MODEL || '未配置',
        cozeApiBase: process.env.COZE_API_BASE || '未配置',
        cozeApiKey: process.env.COZE_API_KEY ? `${process.env.COZE_API_KEY.substring(0, 10)}...` : '未配置',
        useMock: process.env.COZE_USE_MOCK || 'false',
        nodeEnv: process.env.NODE_ENV || 'development',
        wechatAppId: process.env.WECHAT_APPID || process.env.WECHAT_APP_ID || '未配置',
      }
    };
  }
}

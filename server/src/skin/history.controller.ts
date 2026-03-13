import { Controller, Get, Post, Body } from '@nestjs/common';
import { SkinService } from './skin.service';

@Controller('skin')
export class HistoryController {
  constructor(private readonly skinService: SkinService) {}

  @Get('history')
  async getHistory() {
    console.log('收到历史记录查询请求');

    try {
      const result = await this.skinService.getHistory();

      return {
        code: 200,
        msg: '查询成功',
        data: result
      };
    } catch (error) {
      console.error('查询历史记录失败:', error);
      throw error;
    }
  }

  @Post('history')
  async saveHistory(@Body() body: any) {
    console.log('收到保存历史记录请求');

    try {
      const result = await this.skinService.saveHistory(body);

      return {
        code: 200,
        msg: '保存成功',
        data: result
      };
    } catch (error) {
      console.error('保存历史记录失败:', error);
      throw error;
    }
  }
}

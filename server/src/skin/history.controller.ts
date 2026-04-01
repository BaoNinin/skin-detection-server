import { Controller, Get, Post, Body, Query, Delete, Param } from '@nestjs/common';
import { HistoryService } from './history.service';

@Controller('skin')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get('history')
  async getHistory(@Query('userId') userId?: string) {
    console.log('收到历史记录查询请求', userId ? `用户ID: ${userId}` : '');

    // 如果没有提供 userId，返回错误提示
    if (!userId) {
      return {
        code: 401,
        msg: '请先登录',
        data: []
      };
    }

    try {
      const result = await this.historyService.getHistory(parseInt(userId));

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
  async saveHistory(@Body() body: any): Promise<any> {
    console.log('收到保存历史记录请求');

    try {
      const result = await this.historyService.saveHistory(body);

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

  @Delete('history/:id')
  async deleteHistory(@Param('id') id: string) {
    console.log('收到删除历史记录请求，ID:', id);

    try {
      const result = await this.historyService.deleteHistory(id);

      return {
        code: 200,
        msg: '删除成功',
        data: result
      };
    } catch (error) {
      console.error('删除历史记录失败:', error);
      throw error;
    }
  }
}

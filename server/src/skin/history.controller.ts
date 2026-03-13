import { Controller, Get, Post, Body, Query, Delete, Param } from '@nestjs/common';
import { SkinService } from './skin.service';

@Controller('skin')
export class HistoryController {
  constructor(private readonly skinService: SkinService) {}

  @Get('history')
  async getHistory(@Query('userId') userId?: string) {
    console.log('收到历史记录查询请求', userId ? `用户ID: ${userId}` : '');

    try {
      const result = await this.skinService.getHistory(userId ? parseInt(userId) : undefined);

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

  @Delete('history/:id')
  async deleteHistory(@Param('id') id: string) {
    console.log('收到删除历史记录请求，ID:', id);

    try {
      const client = await import('@/storage/database/supabase-client').then(m => m.getSupabaseClient());
      const { error } = await client
        .from('skin_analysis_history')
        .delete()
        .eq('id', parseInt(id));

      if (error) {
        console.error('删除历史记录失败:', error);
        throw error;
      }

      return {
        code: 200,
        msg: '删除成功'
      };
    } catch (error) {
      console.error('删除历史记录失败:', error);
      throw error;
    }
  }
}

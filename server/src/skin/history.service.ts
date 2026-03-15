import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { UserService } from '@/user/user.service';

@Injectable()
export class HistoryService {
  constructor(private readonly userService: UserService) {
    console.log('HistoryService 初始化完成，使用 Supabase 数据库');
  }

  async getHistory(userId?: number) {
    try {
      // 如果没有提供 userId，返回空数组
      if (!userId) {
        console.warn('历史记录查询未提供用户ID，返回空数组');
        return [];
      }

      const client = getSupabaseClient();

      const { data, error } = await client
        .from('skin_analysis_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('查询历史记录失败:', error);
        throw error;
      }

      // 转换数据格式，将蛇形命名转换为前端期望的格式
      const formattedData = (data || []).map((record: any) => ({
        id: record.id,
        skin_type: record.skin_type,
        concerns: record.concerns || [],
        moisture: record.moisture,
        oiliness: record.oiliness,
        sensitivity: record.sensitivity,
        acne: record.acne || 0,
        wrinkles: record.wrinkles || 0,
        spots: record.spots || 0,
        pores: record.pores || 0,
        blackheads: record.blackheads || 0,
        recommendations: record.recommendations || [],
        image_url: record.image_url || null,
        created_at: record.created_at
      }));

      return formattedData;
    } catch (error) {
      console.error('获取历史记录失败:', error);
      throw error;
    }
  }

  async saveHistory(record: {
    userId: number;
    skinType: string;
    concerns: string[];
    moisture: number;
    oiliness: number;
    sensitivity: number;
    recommendations: string[];
    imageUrl?: string;
    acne?: number;
    wrinkles?: number;
    spots?: number;
    pores?: number;
    blackheads?: number;
  }) {
    try {
      const client = getSupabaseClient();
      const timestamp = new Date().toISOString();

      const { data, error } = await client
        .from('skin_analysis_history')
        .insert({
          user_id: record.userId,
          skin_type: record.skinType,
          concerns: record.concerns || [],
          moisture: record.moisture,
          oiliness: record.oiliness,
          sensitivity: record.sensitivity,
          acne: record.acne || 0,
          wrinkles: record.wrinkles || 0,
          spots: record.spots || 0,
          pores: record.pores || 0,
          blackheads: record.blackheads || 0,
          recommendations: record.recommendations || [],
          image_url: record.imageUrl || null,
          created_at: timestamp,
          updated_at: timestamp
        })
        .select()
        .single();

      if (error) {
        console.error('保存历史记录失败:', error);
        throw error;
      }

      // 增加用户的检测次数
      await this.userService.incrementDetectionCount(record.userId);

      return data;
    } catch (error) {
      console.error('保存历史记录失败:', error);
      throw error;
    }
  }

  async deleteHistory(id: string) {
    try {
      const client = getSupabaseClient();

      const { error } = await client
        .from('skin_analysis_history')
        .delete()
        .eq('id', parseInt(id));

      if (error) {
        console.error('删除历史记录失败:', error);
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('删除历史记录失败:', error);
      throw error;
    }
  }
}

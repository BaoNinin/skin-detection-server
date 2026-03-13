import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { UserService } from '@/user/user.service';

@Injectable()
export class HistoryService {
  private client;

  constructor(private readonly userService: UserService) {
    this.client = getSupabaseClient();
  }

  async getHistory(userId?: number) {
    try {
      // 如果没有提供 userId，返回空数组而不是所有记录
      if (!userId) {
        console.warn('历史记录查询未提供用户ID，返回空数组');
        return [];
      }

      const { data, error } = await this.client
        .from('skin_analysis_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('查询历史记录失败:', error);
        throw error;
      }

      return data || [];
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
  }) {
    try {
      const { data, error } = await this.client
        .from('skin_analysis_history')
        .insert({
          user_id: record.userId,
          skin_type: record.skinType,
          concerns: record.concerns || [],
          moisture: record.moisture,
          oiliness: record.oiliness,
          sensitivity: record.sensitivity,
          recommendations: record.recommendations || [],
          image_url: record.imageUrl || null
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
}

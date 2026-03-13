import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

@Injectable()
export class HistoryService {
  private client;

  constructor() {
    this.client = getSupabaseClient();
  }

  async getHistory() {
    try {
      const { data, error } = await this.client
        .from('skin_analysis_history')
        .select('*')
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

      return data;
    } catch (error) {
      console.error('保存历史记录失败:', error);
      throw error;
    }
  }
}

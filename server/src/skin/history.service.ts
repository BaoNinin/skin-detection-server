import { Injectable } from '@nestjs/common';
import { db, COLLECTIONS } from '@/config/cloud.config';
import { UserService } from '@/user/user.service';

@Injectable()
export class HistoryService {
  constructor(private readonly userService: UserService) {
    console.log('HistoryService 初始化完成，使用云数据库');
  }

  async getHistory(userId?: number) {
    try {
      // 如果没有提供 userId，返回空数组
      if (!userId) {
        console.warn('历史记录查询未提供用户ID，返回空数组');
        return [];
      }

      const { data } = await db
        .collection(COLLECTIONS.HISTORY)
        .where({
          userId: userId
        })
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

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
      const timestamp = new Date().getTime();

      const { data } = await db
        .collection(COLLECTIONS.HISTORY)
        .add({
          userId: record.userId,
          skinType: record.skinType,
          concerns: record.concerns || [],
          moisture: record.moisture,
          oiliness: record.oiliness,
          sensitivity: record.sensitivity,
          recommendations: record.recommendations || [],
          imageUrl: record.imageUrl || null,
          createdAt: timestamp,
          updatedAt: timestamp
        });

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
      const { data } = await db
        .collection(COLLECTIONS.HISTORY)
        .doc(id)
        .remove();

      return data;
    } catch (error) {
      console.error('删除历史记录失败:', error);
      throw error;
    }
  }
}

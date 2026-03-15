import { Injectable } from '@nestjs/common';
import { UserService } from '@/user/user.service';
import * as fs from 'fs/promises';
import * as path from 'path';

interface HistoryRecord {
  id: number;
  userId: number;
  skinType: string;
  concerns: string[];
  moisture: number;
  oiliness: number;
  sensitivity: number;
  acne: number;
  wrinkles: number;
  spots: number;
  pores: number;
  blackheads: number;
  recommendations: string[];
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class HistoryService {
  private readonly dataDir: string;
  private readonly historyFilePath: string;
  private nextId = 1;

  constructor(private readonly userService: UserService) {
    this.dataDir = path.join(process.cwd(), 'data');
    this.historyFilePath = path.join(this.dataDir, 'history.json');
    this.ensureDataDir();
    console.log('HistoryService 初始化完成，使用本地文件存储');
  }

  private async ensureDataDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.error('创建数据目录失败:', error);
    }
  }

  private async readHistoryFile(): Promise<HistoryRecord[]> {
    try {
      const data = await fs.readFile(this.historyFilePath, 'utf-8');
      const records = JSON.parse(data);
      // 更新 nextId
      if (records.length > 0) {
        const maxId = Math.max(...records.map(r => r.id));
        this.nextId = maxId + 1;
      }
      return records;
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        // 文件不存在，返回空数组
        return [];
      }
      throw error;
    }
  }

  private async writeHistoryFile(records: HistoryRecord[]): Promise<void> {
    try {
      await fs.writeFile(this.historyFilePath, JSON.stringify(records, null, 2), 'utf-8');
    } catch (error) {
      console.error('写入历史记录文件失败:', error);
      throw error;
    }
  }

  async getHistory(userId?: number) {
    try {
      // 如果没有提供 userId，返回空数组
      if (!userId) {
        console.warn('历史记录查询未提供用户ID，返回空数组');
        return [];
      }

      const allRecords = await this.readHistoryFile();

      // 过滤出指定用户的记录，按创建时间倒序排列
      const userRecords = allRecords
        .filter(record => record.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 50);

      // 转换数据格式为前端期望的格式
      const formattedData = userRecords.map((record: any) => ({
        id: record.id,
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
        created_at: record.createdAt
      }));

      console.log(`查询到用户 ${userId} 的 ${formattedData.length} 条历史记录`);
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
      const timestamp = new Date().toISOString();
      const allRecords = await this.readHistoryFile();

      const newRecord: HistoryRecord = {
        id: this.nextId++,
        userId: record.userId,
        skinType: record.skinType,
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
        imageUrl: record.imageUrl || null,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      allRecords.push(newRecord);
      await this.writeHistoryFile(allRecords);

      console.log(`保存历史记录成功，ID: ${newRecord.id}, 用户ID: ${record.userId}`);

      // 增加用户的检测次数
      await this.userService.incrementDetectionCount(record.userId);

      return newRecord;
    } catch (error) {
      console.error('保存历史记录失败:', error);
      throw error;
    }
  }

  async deleteHistory(id: string) {
    try {
      const allRecords = await this.readHistoryFile();
      const filteredRecords = allRecords.filter(record => record.id !== parseInt(id));

      if (filteredRecords.length === allRecords.length) {
        throw new Error('记录不存在');
      }

      await this.writeHistoryFile(filteredRecords);

      console.log(`删除历史记录成功，ID: ${id}`);
      return { success: true };
    } catch (error) {
      console.error('删除历史记录失败:', error);
      throw error;
    }
  }
}

import { Injectable } from '@nestjs/common';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import * as fs from 'fs';
import { UploadedFile, SkinAnalysisResult } from './skin.types';
import { ProductService } from './product.service';
import { HistoryService } from './history.service';

@Injectable()
export class SkinService {
  private client: LLMClient;

  constructor(
    private readonly productService: ProductService,
    private readonly historyService: HistoryService
  ) {
    const config = new Config();
    this.client = new LLMClient(config);
  }

  async analyzeSkinImage(file: UploadedFile): Promise<SkinAnalysisResult> {
    try {
      console.log('开始分析皮肤图像...');
      console.log('文件路径:', file.path);
      console.log('文件大小:', file.size);
      console.log('MIME 类型:', file.mimetype);

      let imageData: string;

      if (file.path) {
        const imageBuffer = fs.readFileSync(file.path);
        console.log('从路径读取，buffer 大小:', imageBuffer.length);
        imageData = imageBuffer.toString('base64');
      } else if (file.buffer) {
        console.log('从 buffer 读取，buffer 大小:', file.buffer.length);
        imageData = file.buffer.toString('base64');
      } else {
        throw new Error('无法读取文件数据');
      }

      console.log('Base64 数据长度:', imageData.length);

      const dataUri = `data:${file.mimetype || 'image/jpeg'};base64,${imageData}`;
      console.log('Data URI 前 100 字符:', dataUri.substring(0, 100));

      const messages = [
        {
          role: 'system' as const,
          content: '你是一位专业的皮肤科医生和美容专家。请分析用户的面部皮肤照片，评估皮肤状态并提供专业建议。'
        },
        {
          role: 'user' as const,
          content: [
            {
              type: 'text' as const,
              text: `请分析这张面部照片的皮肤状态，并按以下 JSON 格式返回结果（只返回 JSON，不要有其他文字）：
{
  "skinType": "皮肤类型（如：干性皮肤、油性皮肤、混合性皮肤、中性皮肤、敏感性皮肤）",
  "concerns": ["皮肤问题1", "皮肤问题2"],
  "moisture": 水分百分比（0-100的整数）,
  "oiliness": 油性百分比（0-100的整数）,
  "sensitivity": 敏感度百分比（0-100的整数）,
  "recommendations": ["护肤建议1", "护肤建议2"]
}`
            },
            {
              type: 'image_url' as const,
              image_url: {
                url: dataUri,
                detail: 'high' as const
              }
            }
          ]
        }
      ];

      console.log('调用 LLM...');
      const response = await this.client.invoke(messages, {
        model: 'doubao-seed-1-6-vision-250815',
        temperature: 0.7
      });

      console.log('LLM 响应长度:', response.content.length);
      console.log('LLM 响应前 200 字符:', response.content.substring(0, 200));

      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('无法解析 LLM 响应为 JSON');
      }

      const result = JSON.parse(jsonMatch[0]);

      return {
        skinType: result.skinType || '中性皮肤',
        concerns: Array.isArray(result.concerns) ? result.concerns : [],
        moisture: Math.min(100, Math.max(0, parseInt(result.moisture) || 70)),
        oiliness: Math.min(100, Math.max(0, parseInt(result.oiliness) || 50)),
        sensitivity: Math.min(100, Math.max(0, parseInt(result.sensitivity) || 30)),
        recommendations: Array.isArray(result.recommendations) ? result.recommendations : []
      };
    } catch (error) {
      console.error('皮肤分析失败:', error);
      console.error('错误详情:', JSON.stringify(error, null, 2));
      throw error;
    }
  }

  async recommendProducts(skinData: {
    skinType: string;
    concerns: string[];
    moisture: number;
    oiliness: number;
    sensitivity: number;
  }) {
    return this.productService.recommendProducts(skinData);
  }

  async getHistory() {
    return this.historyService.getHistory();
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
    return this.historyService.saveHistory(record);
  }
}

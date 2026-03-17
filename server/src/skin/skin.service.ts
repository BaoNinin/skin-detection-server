import { Injectable } from '@nestjs/common';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import * as fs from 'fs';
import { UploadedFile, SkinAnalysisResult } from './skin.types';
import { ProductService } from './product.service';
import { HistoryService } from './history.service';
import { CloudStorageService } from '@/config/cloud-storage.service';

@Injectable()
export class SkinService {
  private client: LLMClient;

  constructor(
    private readonly productService: ProductService,
    private readonly historyService: HistoryService,
    private readonly cloudStorageService: CloudStorageService
  ) {
    const apiKey = process.env.COZE_API_KEY || '';

    const config = new Config({
      apiKey
    });
    this.client = new LLMClient(config);
    const model = process.env.COZE_MODEL || 'doubao-seed-1-6-vision-250815';
    console.log('SkinService 初始化完成，使用模型:', model);
    console.log('使用豆包视觉模型进行皮肤分析');
    console.log('使用云存储保存图片');
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
          content: '你是一位专业的皮肤科医生和美容专家，拥有10年以上的临床经验。你擅长通过面部照片分析皮肤状态，能够准确识别皮肤类型、问题并提供专业建议。'
        },
        {
          role: 'user' as const,
          content: [
            {
              type: 'text' as const,
              text: `请仔细分析这张面部照片的皮肤状态。请按照以下标准和流程进行评估：

【评估标准】
1. 皮肤类型：
   - 干性皮肤：皮肤缺乏水分，容易起皮，毛孔细小，T区不油腻
   - 油性皮肤：T区和全脸油腻，毛孔粗大，容易长痘
   - 混合性皮肤：T区油腻，两颊干燥
   - 中性皮肤：水油平衡，毛孔适中，肤质健康
   - 敏感性皮肤：容易泛红、刺痛、过敏

2. 水分含量（0-100）：
   - 80-100：水分充足
   - 60-79：水分良好
   - 40-59：水分不足
   - 20-39：水分缺乏
   - 0-19：极度干燥

3. 油性程度（0-100）：
   - 0-20：几乎无油
   - 21-40：轻微出油
   - 41-60：中度出油
   - 61-80：重度出油
   - 81-100：极度油腻

4. 敏感度（0-100）：
   - 0-20：健康稳定
   - 21-40：轻微敏感
   - 41-60：中度敏感
   - 61-80：高度敏感
   - 81-100：极度敏感

5. 问题指标（0-100）：
   - 痘痘：根据痘痘数量和严重程度评估
   - 皱纹：根据细纹、皱纹数量和深度评估
   - 色斑：根据色斑数量、面积和颜色深浅评估
   - 毛孔：根据毛孔粗大程度评估
   - 黑头：根据黑头数量和明显程度评估

【输出格式】
请严格按照以下 JSON 格式返回结果（只返回 JSON，不要有任何其他文字或说明）：
{
  "skinType": "皮肤类型（必须是：干性皮肤/油性皮肤/混合性皮肤/中性皮肤/敏感性皮肤）",
  "concerns": ["主要皮肤问题1", "主要皮肤问题2", "主要皮肤问题3"],
  "moisture": 水分百分比（0-100的整数）,
  "oiliness": 油性百分比（0-100的整数）,
  "sensitivity": 敏感度百分比（0-100的整数）,
  "acne": 痘痘严重程度（0-100的整数，如无明显问题则为0）,
  "wrinkles": 皱纹严重程度（0-100的整数，如无明显问题则为0）,
  "spots": 色斑严重程度（0-100的整数，如无明显问题则为0）,
  "pores": 毛孔粗大程度（0-100的整数，如无明显问题则为0）,
  "blackheads": 黑头严重程度（0-100的整数，如无明显问题则为0）,
  "recommendations": ["专业护肤建议1", "专业护肤建议2", "专业护肤建议3"]
}

【注意事项】
1. 所有数值必须是0-100之间的整数
2. concerns 数组应该列出最明显的2-4个皮肤问题
3. recommendations 应该针对具体问题提供实用建议
4. 如果照片中无法清晰看到某个指标，请根据整体状态合理推断
5. 确保JSON格式正确，可以被直接解析`
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

      console.log('调用豆包视觉模型...');
      
      // 使用 coze-coding-dev-sdk 的 LLMClient 调用豆包视觉模型
      const response = await this.client.invoke(messages, {
        model: 'doubao-seed-1-6-vision-250815',
        temperature: 0.3,
      });

      console.log('豆包模型响应长度:', response.content?.length);
      const responseContent = response.content || '{}';
      console.log('响应前 200 字符:', responseContent.substring(0, 200));

      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('无法解析 LLM 响应为 JSON');
      }

      const result = JSON.parse(jsonMatch[0]);

      // 验证和限制数值范围
      const validateAndClamp = (value: any, defaultValue: number) => {
        const num = parseInt(value);
        if (isNaN(num)) return defaultValue;
        return Math.min(100, Math.max(0, num));
      };

      return {
        skinType: result.skinType || '中性皮肤',
        concerns: Array.isArray(result.concerns) ? result.concerns : [],
        moisture: validateAndClamp(result.moisture, 70),
        oiliness: validateAndClamp(result.oiliness, 50),
        sensitivity: validateAndClamp(result.sensitivity, 30),
        acne: validateAndClamp(result.acne, 0),
        wrinkles: validateAndClamp(result.wrinkles, 0),
        spots: validateAndClamp(result.spots, 0),
        pores: validateAndClamp(result.pores, 0),
        blackheads: validateAndClamp(result.blackheads, 0),
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

  async getHistory(userId?: number) {
    return this.historyService.getHistory(userId);
  }
}

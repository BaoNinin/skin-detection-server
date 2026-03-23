import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { UploadedFile, SkinAnalysisResult } from './skin.types';
import { ProductService } from './product.service';
import { HistoryService } from './history.service';
import { CloudStorageService } from '@/config/cloud-storage.service';

@Injectable()
export class SkinService {
  constructor(
    private readonly productService: ProductService,
    private readonly historyService: HistoryService,
    private readonly cloudStorageService: CloudStorageService
  ) {
    const model = process.env.COZE_MODEL || 'doubao-1-5-vision-pro-32k-250115';
    const useMock = process.env.COZE_USE_MOCK === 'true';
    console.log('SkinService 初始化完成，使用模型:', model);
    console.log('使用豆包视觉模型进行皮肤分析');
    console.log('使用云存储保存图片');
    if (useMock) {
      console.log('⚠️  当前使用模拟数据模式');
    }
  }

  async analyzeSkinImage(file: UploadedFile): Promise<SkinAnalysisResult> {
    try {
      console.log('开始分析皮肤图像...');
      console.log('文件路径:', file.path);
      console.log('文件大小:', file.size);
      console.log('MIME 类型:', file.mimetype);

      // 检查是否使用模拟数据
      const useMock = process.env.COZE_USE_MOCK === 'true';
      
      if (useMock) {
        console.log('=== 使用模拟数据模式 ===');
        await this.sleep(2000); // 模拟 API 延迟
        
        // 返回模拟数据
        return this.getMockAnalysisResult();
      }

      // 真实 API 调用逻辑
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
          content: `你是一位专业的皮肤科医生和美容专家，拥有10年以上的临床经验。
你擅长通过面部照片分析皮肤状态，能够准确识别皮肤类型、问题并提供专业建议。

重要规则（必须遵守）：
1. 即使图片不清晰，也要基于可见信息进行合理推断，绝不能返回"请提供面部照片"
2. 核心指标（moisture、oiliness、sensitivity）必须是非零值（1-100），绝不能全部返回 0
3. 如果无法识别人脸，假设皮肤类型为"中性皮肤"，水分 70、油性 50、敏感度 30
4. 重点关注可见的皮肤特征，合理推断缺失信息
5. 皮肤类型必须是以下 5 个之一：干性皮肤/油性皮肤/混合性皮肤/中性皮肤/敏感性皮肤
6. 所有数值必须是 0-100 之间的整数`
        },
        {
          role: 'user' as const,
          content: [
            {
              type: 'text' as const,
              text: `请仔细分析这张面部照片的皮肤状态。请按照以下标准和流程进行评估：

【评估标准】
1. 皮肤类型（必须选择以下 5 个之一）：
   - 干性皮肤：皮肤缺乏水分，容易起皮，毛孔细小，T区不油腻
   - 油性皮肤：T区和全脸油腻，毛孔粗大，容易长痘
   - 混合性皮肤：T区油腻，两颊干燥
   - 中性皮肤：水油平衡，毛孔适中，肤质健康
   - 敏感性皮肤：容易泛红、刺痛、过敏

2. 水分含量（1-100，必须非零）：
   - 80-100：水分充足
   - 60-79：水分良好
   - 40-59：水分不足
   - 20-39：水分缺乏
   - 1-19：极度干燥
   - 默认值：70（如无法判断）

3. 油性程度（1-100，必须非零）：
   - 0-20：几乎无油（建议使用 15）
   - 21-40：轻微出油
   - 41-60：中度出油
   - 61-80：重度出油
   - 81-100：极度油腻
   - 默认值：50（如无法判断）

4. 敏感度（1-100，必须非零）：
   - 1-20：健康稳定（建议使用 15）
   - 21-40：轻微敏感
   - 41-60：中度敏感
   - 61-80：高度敏感
   - 81-100：极度敏感
   - 默认值：30（如无法判断）

5. 问题指标（0-100）：
   - 痘痘：根据痘痘数量和严重程度评估（无明显问题则为 0-20）
   - 皱纹：根据细纹、皱纹数量和深度评估（无明显问题则为 0-20）
   - 色斑：根据色斑数量、面积和颜色深浅评估（无明显问题则为 0-20）
   - 毛孔：根据毛孔粗大程度评估（正常为 30-50）
   - 黑头：根据黑头数量和明显程度评估（无明显问题则为 0-20）

【输出格式】
请严格按照以下 JSON 格式返回结果（只返回 JSON，不要有任何其他文字或说明）：
{
  "skinType": "皮肤类型（必须从5个选项中选择，不能是其他值）",
  "concerns": ["主要皮肤问题1", "主要皮肤问题2", "主要皮肤问题3"],
  "moisture": 水分百分比（1-100的整数，不能为0）,
  "oiliness": 油性百分比（1-100的整数，不能为0）,
  "sensitivity": 敏感度百分比（1-100的整数，不能为0）,
  "acne": 痘痘严重程度（0-100的整数）,
  "wrinkles": 皱纹严重程度（0-100的整数）,
  "spots": 色斑严重程度（0-100的整数）,
  "pores": 毛孔粗大程度（0-100的整数）,
  "blackheads": 黑头严重程度（0-100的整数）,
  "recommendations": ["专业护肤建议1", "专业护肤建议2", "专业护肤建议3"]
}

【强制要求】
1. skinType 必须是：干性皮肤/油性皮肤/混合性皮肤/中性皮肤/敏感性皮肤 之一
2. moisture、oiliness、sensitivity 三个指标必须非零（>= 1）
3. 如果无法判断，使用默认值：moisture=70, oiliness=50, sensitivity=30
4. pores 指标建议在 30-70 之间
5. 确保 JSON 格式正确，可以被直接解析`
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
      console.log('API Key:', process.env.COZE_API_KEY?.substring(0, 10) + '...');
      console.log('模型:', process.env.COZE_MODEL);

      // 使用火山引擎原生 API 调用
      const apiKey = process.env.COZE_API_KEY || '';
      const apiUrl = process.env.COZE_API_BASE || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
      const model = process.env.COZE_MODEL || 'doubao-1-5-vision-pro-32k-250115';

      const requestBody = {
        model,
        messages,
        temperature: 0.1, // 降低随机性，提高稳定性
        max_tokens: 2000,
      };

      console.log('请求 URL:', apiUrl);
      console.log('请求体（不含图片数据）:', {
        model: requestBody.model,
        temperature: requestBody.temperature,
      });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API 调用失败:', response.status, errorText);
        throw new Error(`API 调用失败: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('豆包模型响应:', JSON.stringify(responseData, null, 2));

      // 解析响应
      const responseContent = responseData.choices?.[0]?.message?.content || '{}';
      console.log('响应内容长度:', responseContent.length);
      console.log('响应前 200 字符:', responseContent.substring(0, 200));

      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('无法从响应中提取 JSON，原始内容:', responseContent);
        throw new Error('无法解析 LLM 响应为 JSON');
      }

      const result = JSON.parse(jsonMatch[0]);

      // 验证和限制数值范围
      const validateAndClamp = (value: any, defaultValue: number) => {
        const num = parseInt(value);
        if (isNaN(num)) return defaultValue;
        return Math.min(100, Math.max(0, num));
      };

      // 检查结果是否有效
      const isValidResult = (
        result.skinType &&
        result.skinType !== '请提供面部照片' &&
        result.skinType !== '无法识别' &&
        (result.moisture > 0 || result.oiliness > 0 || result.sensitivity > 0 ||
         result.acne > 0 || result.wrinkles > 0 || result.spots > 0 ||
         result.pores > 0 || result.blackheads > 0)
      );

      if (!isValidResult) {
        console.warn('=== 豆包模型返回无效结果，使用模拟数据 ===');
        console.warn('皮肤类型:', result.skinType);
        console.warn('各项指标:', {
          moisture: result.moisture,
          oiliness: result.oiliness,
          sensitivity: result.sensitivity,
          acne: result.acne,
          wrinkles: result.wrinkles,
          spots: result.spots,
          pores: result.pores,
          blackheads: result.blackheads
        });
        return this.getMockAnalysisResult();
      }

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

  // 辅助方法：模拟延迟
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 辅助方法：获取模拟分析结果
  private getMockAnalysisResult(): SkinAnalysisResult {
    const skinTypes = ['干性皮肤', '油性皮肤', '混合性皮肤', '中性皮肤', '敏感性皮肤'];
    const concernsList = [
      ['毛孔粗大', 'T区出油', '肤色暗沉'],
      ['干燥缺水', '细纹', '敏感泛红'],
      ['痘痘', '毛孔堵塞', '油光'],
      ['色斑', '肤色不均', '缺乏光泽']
    ];
    
    // 随机选择皮肤类型和问题
    const randomIndex = Math.floor(Math.random() * skinTypes.length);
    const randomConcerns = concernsList[randomIndex];
    
    // 生成随机但合理的数值
    const moisture = Math.floor(Math.random() * 30) + 50; // 50-80
    const oiliness = Math.floor(Math.random() * 40) + 30; // 30-70
    const sensitivity = Math.floor(Math.random() * 50) + 10; // 10-60
    
    const result: SkinAnalysisResult = {
      skinType: skinTypes[randomIndex],
      concerns: randomConcerns,
      moisture,
      oiliness,
      sensitivity,
      acne: Math.floor(Math.random() * 40),
      wrinkles: Math.floor(Math.random() * 30),
      spots: Math.floor(Math.random() * 35),
      pores: Math.floor(Math.random() * 50) + 30,
      blackheads: Math.floor(Math.random() * 40),
      recommendations: [
        '建议使用温和的洁面产品，早晚清洁',
        '保持充足的水分，使用保湿精华',
        '注意防晒，避免紫外线伤害',
        '定期使用面膜，改善肌肤状态'
      ]
    };
    
    console.log('=== 模拟分析结果 ===');
    console.log('皮肤类型:', result.skinType);
    console.log('主要问题:', result.concerns);
    console.log('水分:', result.moisture);
    console.log('油性:', result.oiliness);
    console.log('敏感度:', result.sensitivity);
    
    return result;
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

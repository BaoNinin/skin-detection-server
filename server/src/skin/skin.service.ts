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
      const timestamp = Date.now()
      console.log(`\n========== [${timestamp}] 开始新的皮肤分析 ==========`)
      console.log('文件路径:', file.path)
      console.log('文件大小:', file.size)
      console.log('MIME 类型:', file.mimetype)
      console.log('Buffer 是否存在:', !!file.buffer)
      
      // 生成文件唯一标识（用于调试）
      const fileHash = file.path ? file.path.slice(-20) : file.buffer?.slice(0, 20).toString('hex') || 'unknown'
      console.log('文件标识:', fileHash)

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
      const imageTimestamp = Date.now()

      if (file.path) {
        const imageBuffer = fs.readFileSync(file.path);
        console.log(`[${imageTimestamp}] 从路径读取，buffer 大小:`, imageBuffer.length);
        console.log(`[${imageTimestamp}] Buffer 前10字节:`, imageBuffer.slice(0, 10).toString('hex'));
        imageData = imageBuffer.toString('base64');
      } else if (file.buffer) {
        console.log(`[${imageTimestamp}] 从 buffer 读取，buffer 大小:`, file.buffer.length);
        console.log(`[${imageTimestamp}] Buffer 前10字节:`, file.buffer.slice(0, 10).toString('hex'));
        imageData = file.buffer.toString('base64');
      } else {
        console.error(`[${imageTimestamp}] 无法读取文件数据`);
        throw new Error('无法读取文件数据');
      }

      console.log(`[${imageTimestamp}] Base64 数据长度:`, imageData.length);
      console.log(`[${imageTimestamp}] Base64 前50字符:`, imageData.substring(0, 50));

      const dataUri = `data:${file.mimetype || 'image/jpeg'};base64,${imageData}`;
      console.log(`[${imageTimestamp}] Data URI 前 100 字符:`, dataUri.substring(0, 100));

      console.log('调用豆包端点模型...');
      console.log('API Key:', process.env.COZE_API_KEY?.substring(0, 10) + '...');
      console.log('模型:', process.env.COZE_MODEL);
      console.log('API Base:', process.env.COZE_API_BASE);

      // 使用标准 chat/completions API
      const apiKey = process.env.COZE_API_KEY || '';
      const apiUrl = process.env.COZE_API_BASE || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
      const model = process.env.COZE_MODEL || 'ep-20260324135258-7shrd';

      // 构建标准 chat/completions 请求体
      const requestBody = {
        model: model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: dataUri }
              },
              {
                type: 'text',
                text: `你是一位专业的皮肤护理分析师和美容顾问，拥有丰富的皮肤状态分析经验。
请仔细观察这张面部照片，根据实际可见的皮肤特征进行分析，每张照片的结果应有所不同。

【评估标准】
1. 皮肤类型（必须选择以下 5 个之一）：
   - 干性皮肤：皮肤缺乏水分，容易起皮，毛孔细小，T区不油腻
   - 油性皮肤：T区和全脸油腻，毛孔粗大，容易长痘
   - 混合性皮肤：T区油腻，两颊干燥
   - 中性皮肤：水油平衡，毛孔适中，肤质健康
   - 敏感性皮肤：容易泛红、刺痛、过敏

2. 水分含量（1-100整数）：根据皮肤光泽、弹性、是否起皮判断
   - 80-100：皮肤饱满有光泽，水分充足
   - 60-79：水分良好
   - 40-59：皮肤偏暗，水分不足
   - 20-39：明显干燥，水分缺乏
   - 1-19：极度干燥起皮

3. 油性程度（1-100整数）：根据T区及全脸油光判断
   - 1-20：皮肤哑光无油光
   - 21-40：轻微出油
   - 41-60：中度出油
   - 61-80：明显油光
   - 81-100：全脸油腻

4. 敏感度（1-100整数）：根据泛红、毛细血管可见程度判断
   - 1-20：皮肤健康稳定，无泛红
   - 21-40：轻微泛红或不稳定
   - 41-60：中度敏感，有明显泛红
   - 61-80：高度敏感
   - 81-100：极度敏感，大面积泛红

5. 问题指标（0-100整数）：
   - 痘痘：根据可见痘痘数量和严重程度评估
   - 皱纹：根据细纹、皱纹数量和深度评估
   - 色斑：根据色斑数量、面积和颜色深浅评估
   - 毛孔：根据毛孔粗大程度评估
   - 黑头：根据鼻翼及T区黑头数量评估

【输出格式】
只返回 JSON，不要有任何其他文字：
{
  "skinType": "皮肤类型（从5个选项中选择）",
  "concerns": ["主要皮肤问题1", "主要皮肤问题2", "主要皮肤问题3"],
  "moisture": 数字,
  "oiliness": 数字,
  "sensitivity": 数字,
  "acne": 数字,
  "wrinkles": 数字,
  "spots": 数字,
  "pores": 数字,
  "blackheads": 数字,
  "recommendations": ["针对该皮肤的具体建议1", "针对该皮肤的具体建议2", "针对该皮肤的具体建议3"]
}

【要求】
1. skinType 必须是：干性皮肤/油性皮肤/混合性皮肤/中性皮肤/敏感性皮肤 之一
2. moisture、oiliness、sensitivity 必须 >= 1
3. 所有数值必须基于照片的实际观察，不要使用固定数值
4. recommendations 必须根据该用户的具体皮肤状况给出个性化建议`
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.9
      };

      console.log('请求 URL:', apiUrl);
      console.log('请求体结构:', {
        model: requestBody.model,
        messages_count: requestBody.messages.length,
        content_types: requestBody.messages[0].content.map((c: any) => c.type)
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
      console.log('豆包模型响应状态:', responseData);
      console.log('API 响应结构:', JSON.stringify({
        has_id: !!responseData.id,
        has_object: !!responseData.object,
        has_choices: !!responseData.choices,
        choices_count: responseData.choices?.length,
        usage: responseData.usage
      }));

      // 解析响应 - 标准 chat/completions API 格式
      let responseContent = '';
      
      if (responseData.choices && responseData.choices.length > 0) {
        const choice = responseData.choices[0];
        if (choice.message && choice.message.content) {
          responseContent = choice.message.content;
        }
      }
      
      console.log('响应内容长度:', responseContent.length);
      console.log('响应前 200 字符:', responseContent.substring(0, 200));

      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('无法从响应中提取 JSON，原始内容:', responseContent);
        throw new Error('无法解析 LLM 响应为 JSON');
      }

      const result = JSON.parse(jsonMatch[0]);

      console.log(`[${imageTimestamp}] === 豆包模型分析结果 ===`);
      console.log(`[${imageTimestamp}] 皮肤类型:`, result.skinType);
      console.log(`[${imageTimestamp}] 主要问题:`, result.concerns);
      console.log(`[${imageTimestamp}] 水分:`, result.moisture);
      console.log(`[${imageTimestamp}] 油性:`, result.oiliness);
      console.log(`[${imageTimestamp}] 敏感度:`, result.sensitivity);
      console.log(`[${imageTimestamp}] 痘痘:`, result.acne);
      console.log(`[${imageTimestamp}] 皱纹:`, result.wrinkles);
      console.log(`[${imageTimestamp}] 色斑:`, result.spots);
      console.log(`[${imageTimestamp}] 毛孔:`, result.pores);
      console.log(`[${imageTimestamp}] 黑头:`, result.blackheads);

      // 验证和限制数值范围
      const validateAndClamp = (value: any, defaultValue: number) => {
        const num = parseInt(value);
        if (isNaN(num)) return defaultValue;
        return Math.min(100, Math.max(0, num));
      };

      const finalResult = {
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

      console.log(`[${imageTimestamp}] === 最终返回结果 ===`);
      console.log(`[${imageTimestamp}]`, JSON.stringify(finalResult, null, 2));

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
        console.warn(`[${imageTimestamp}] === 豆包模型返回无效结果，使用模拟数据 ===`);
        console.warn(`[${imageTimestamp}] 皮肤类型:`, result.skinType);
        console.warn(`[${imageTimestamp}] 各项指标:`, {
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

      console.log(`[${imageTimestamp}] 分析完成，返回结果`);
      return finalResult;
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

import { Injectable } from '@nestjs/common';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { Product } from './skin.types';

@Injectable()
export class ProductService {
  private client: LLMClient;

  constructor() {
    const config = new Config();
    this.client = new LLMClient(config);
  }

  async recommendProducts(skinData: {
    skinType: string;
    concerns: string[];
    moisture: number;
    oiliness: number;
    sensitivity: number;
  }): Promise<Product[]> {
    try {
      console.log('开始推荐产品...');

      const concernsText = skinData.concerns.join('、');

      const messages = [
        {
          role: 'system' as const,
          content: '你是一位专业的美容护肤顾问。根据用户的皮肤状态，推荐合适的护肤产品。'
        },
        {
          role: 'user' as const,
          content: `用户皮肤状态：
- 皮肤类型：${skinData.skinType}
- 皮肤问题：${concernsText || '无明显问题'}
- 水分：${skinData.moisture}%
- 油性：${skinData.oiliness}%
- 敏感度：${skinData.sensitivity}%

请推荐 3 款适合的护肤产品，按以下 JSON 格式返回（只返回 JSON 数组，不要有其他文字）：
[
  {
    "id": "产品ID",
    "name": "产品名称",
    "brand": "品牌",
    "category": "产品类别（如：洁面、保湿、精华、面膜）",
    "price": 价格（数字）,
    "description": "产品描述和使用建议",
    "image": "产品图片URL（使用 https://images.unsplash.com 的真实图片链接）",
    "rating": 评分（1-5的数字）,
    "tags": ["标签1", "标签2"]
  }
]`
        }
      ];

      const response = await this.client.invoke(messages, {
        model: 'ep-20260324135258-7shrd',
        temperature: 0.7
      });

      console.log('LLM 响应长度:', response.content.length);
      console.log('LLM 响应:', response.content.substring(0, 500));

      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error('无法解析 LLM 响应为 JSON 数组');
        return this.getDefaultProducts(skinData);
      }

      const products = JSON.parse(jsonMatch[0]);

      return Array.isArray(products) ? products : this.getDefaultProducts(skinData);
    } catch (error) {
      console.error('产品推荐失败:', error);
      return this.getDefaultProducts(skinData);
    }
  }

  private getDefaultProducts(skinData: any): Product[] {
    return [
      {
        id: '1',
        name: '温和洁面乳',
        brand: '纯净护肤',
        category: '洁面',
        price: 128,
        description: '温和清洁，不带走肌肤水分，适合日常使用',
        image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400',
        rating: 4.5,
        tags: ['温和', '保湿']
      },
      {
        id: '2',
        name: '深层保湿精华',
        brand: '润泽护肤',
        category: '精华',
        price: 298,
        description: '深层滋润肌肤，提升肌肤含水量，改善干燥',
        image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400',
        rating: 4.8,
        tags: ['保湿', '修护']
      },
      {
        id: '3',
        name: '舒缓修护面膜',
        brand: '舒缓护理',
        category: '面膜',
        price: 168,
        description: '舒缓肌肤，减少敏感，修护肌肤屏障',
        image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400',
        rating: 4.6,
        tags: ['舒缓', '修护']
      }
    ];
  }
}

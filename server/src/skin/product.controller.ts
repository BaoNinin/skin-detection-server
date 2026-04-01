import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { SkinService } from './skin.service';

@Controller('skin')
export class ProductController {
  constructor(private readonly skinService: SkinService) {}

  @Get('recommend')
  async getRecommendations(
    @Query('skinType') skinType?: string,
    @Query('concerns') concerns?: string,
    @Query('moisture') moisture?: string,
    @Query('oiliness') oiliness?: string,
    @Query('sensitivity') sensitivity?: string,
  ) {
    console.log('收到产品推荐请求:', { skinType, concerns, moisture, oiliness, sensitivity });

    if (!skinType) {
      throw new BadRequestException('缺少皮肤类型参数');
    }

    try {
      const result = await this.skinService.recommendProducts({
        skinType,
        concerns: concerns ? concerns.split(',') : [],
        moisture: moisture ? parseInt(moisture) : 50,
        oiliness: oiliness ? parseInt(oiliness) : 50,
        sensitivity: sensitivity ? parseInt(sensitivity) : 30
      });

      return {
        code: 200,
        msg: '推荐成功',
        data: result
      };
    } catch (error) {
      console.error('产品推荐失败:', error);
      throw error;
    }
  }
}

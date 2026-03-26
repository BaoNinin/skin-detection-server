import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, Body, Get, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SkinService } from './skin.service';
import { UploadedFile as UploadedFileType } from './skin.types';

@Controller('skin')
export class SkinController {
  constructor(private readonly skinService: SkinService) {}

  @Post('analyze')
  @UseInterceptors(FileInterceptor('image'))
  async analyzeSkin(
    @UploadedFile() file: UploadedFileType,
    @Body() body: { userId?: number }
  ) {
    if (!file) {
      throw new BadRequestException('未上传图片');
    }

    if (!body.userId) {
      throw new BadRequestException('缺少用户ID');
    }

    console.log('收到皮肤分析请求，文件名:', file.originalname);
    console.log('文件大小:', file.size);
    console.log('用户ID:', body.userId);

    try {
      const result = await this.skinService.analyzeSkinImage(file, body.userId);

      // 分析成功后，增加用户的检测次数
      try {
        await this.skinService.incrementDetectionCount(body.userId);
        console.log('用户检测次数已增加');
      } catch (error) {
        console.error('增加检测次数失败:', error);
        // 即使增加检测次数失败，也返回分析结果（容错处理）
      }

      return {
        code: 200,
        msg: '分析成功',
        data: result
      };
    } catch (error) {
      console.error('皮肤分析失败:', error);
      throw error;
    }
  }

  @Get('recommend')
  async recommendProducts(@Query() query: any) {
    const { skinType, moisture, oiliness, sensitivity, concerns, acne, wrinkles, spots, pores, blackheads } = query;

    const skinData = {
      skinType: skinType || '中性皮肤',
      concerns: concerns ? concerns.split(',').map((c: string) => c.trim()) : [],
      moisture: parseInt(moisture) || 70,
      oiliness: parseInt(oiliness) || 50,
      sensitivity: parseInt(sensitivity) || 30,
      acne: acne !== undefined ? parseInt(acne) : undefined,
      wrinkles: wrinkles !== undefined ? parseInt(wrinkles) : undefined,
      spots: spots !== undefined ? parseInt(spots) : undefined,
      pores: pores !== undefined ? parseInt(pores) : undefined,
      blackheads: blackheads !== undefined ? parseInt(blackheads) : undefined
    };

    try {
      const products = await this.skinService.recommendProducts(skinData);
      return {
        code: 200,
        msg: '推荐成功',
        data: products
      };
    } catch (error) {
      console.error('产品推荐失败:', error);
      throw error;
    }
  }
}

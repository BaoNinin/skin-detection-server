import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, Body } from '@nestjs/common';
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
      const result = await this.skinService.analyzeSkinImage(file);
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
}

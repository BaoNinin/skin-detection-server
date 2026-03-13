import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SkinService } from './skin.service';
import { UploadedFile as UploadedFileType } from './skin.types';

@Controller('skin')
export class SkinController {
  constructor(private readonly skinService: SkinService) {}

  @Post('analyze')
  @UseInterceptors(FileInterceptor('image'))
  async analyzeSkin(@UploadedFile() file: UploadedFileType) {
    if (!file) {
      throw new BadRequestException('未上传图片');
    }

    console.log('收到皮肤分析请求，文件名:', file.originalname);
    console.log('文件大小:', file.size);

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

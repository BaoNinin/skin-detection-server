import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { SkinModule } from './skin/skin.module';
import { UserModule } from './user/user.module';
import { WechatUrlSchemeController } from './controller/wechat-url-scheme.controller';
import { WechatUrlSchemeService } from './services/wechat-url-scheme.service';

@Module({
  imports: [SkinModule, UserModule],
  controllers: [AppController, WechatUrlSchemeController],
  providers: [AppService, WechatUrlSchemeService],
})
export class AppModule {}

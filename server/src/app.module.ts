import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { SkinModule } from './skin/skin.module';
import { UserModule } from './user/user.module';
import { URLSchemeModule } from './modules/url-scheme/url-scheme.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local',
    }),
    SkinModule,
    UserModule,
    URLSchemeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

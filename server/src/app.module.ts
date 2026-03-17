import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { SkinModule } from './skin/skin.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [SkinModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

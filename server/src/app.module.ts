import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { SkinModule } from './skin/skin.module';

@Module({
  imports: [SkinModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { SkinController } from './skin.controller';
import { ProductController } from './product.controller';
import { HistoryController } from './history.controller';
import { SkinService } from './skin.service';
import { ProductService } from './product.service';
import { HistoryService } from './history.service';
import { CloudStorageService } from '../config/cloud-storage.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    UserModule,
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      dest: '/tmp/uploads',
    }),
  ],
  controllers: [SkinController, ProductController, HistoryController],
  providers: [SkinService, ProductService, HistoryService, CloudStorageService],
})
export class SkinModule {}

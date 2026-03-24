import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局验证管道
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // 启用 CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 设置全局前缀
  app.setGlobalPrefix('api');

  // 自动检测端口（支持云托管和本地开发）
  // 优先使用环境变量 PORT，其次是 80（云托管），最后是 3000（本地开发）
  const port = process.env.PORT || process.env.CLOUD_RUN_PORT || 80;
  console.log(`[DEBUG] Using port ${port} from PORT env var`);

  await app.listen(port);
  console.log(`✅ Server running on http://localhost:${port}`);
}

bootstrap();

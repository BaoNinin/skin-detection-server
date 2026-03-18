require('dotenv').config({ path: 'server/.env.local' });
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import * as express from 'express';
import { HttpStatusInterceptor } from '@/interceptors/http-status.interceptor';

function parsePort(): number {
  // 优先读取 PORT 环境变量（最高优先级）
  if (process.env.PORT) {
    const port = parseInt(process.env.PORT, 10);
    if (!isNaN(port) && port > 0 && port < 65536) {
      console.log(`[DEBUG] Using port ${port} from PORT env var`);
      return port;
    }
  }

  // 检查命令行参数
  const args = process.argv.slice(2);
  const portIndex = args.indexOf('-p');
  if (portIndex !== -1 && args[portIndex + 1]) {
    const port = parseInt(args[portIndex + 1], 10);
    if (!isNaN(port) && port > 0 && port < 65536) {
      console.log(`[DEBUG] Using port ${port} from command line`);
      return port;
    }
  }

  // 云托管环境默认使用 80 端口
  // 如果设置了 CLOUDBASE_ENV_ID 或 NODE_ENV 为 production，则使用 80 端口
  console.log(`[DEBUG] CLOUDBASE_ENV_ID: ${process.env.CLOUDBASE_ENV_ID}`);
  console.log(`[DEBUG] NODE_ENV: ${process.env.NODE_ENV}`);
  if (process.env.CLOUDBASE_ENV_ID || process.env.NODE_ENV === 'production') {
    console.log('[DEBUG] Using port 80 for cloud hosting');
    return 80;
  }
  console.log('[DEBUG] Using port 3000 (default)');
  return 3000;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // 全局拦截器：统一将 POST 请求的 201 状态码改为 200
  app.useGlobalInterceptors(new HttpStatusInterceptor());
  // 1. 开启优雅关闭 Hooks (关键!)
  app.enableShutdownHooks();

  // 2. 解析端口
  const port = parsePort();
  try {
    await app.listen(port);
    console.log(`✅ Server running on http://localhost:${port}`);
    console.log(`🚀 Application is ready to accept connections`);
  } catch (err) {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ 端口 ${port} 被占用! 请运行 'npx kill-port ${port}' 然后重试。`);
      process.exit(1);
    } else {
      throw err;
    }
  }
}
bootstrap();

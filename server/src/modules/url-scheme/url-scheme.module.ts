import { Module } from '@nestjs/common'
import { URLSchemeController } from '../../controllers/url-scheme.controller'

@Module({
  controllers: [URLSchemeController],
})
export class URLSchemeModule {}

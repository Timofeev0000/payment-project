import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { SwaggerModule } from '@nestjs/swagger'
import * as cookieParser from 'cookie-parser'
import { AppModule } from './app.module'
import { getCorsConfig } from './config/cors.config'
import { getSwaggerConfig } from './config/swagger.config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get(ConfigService)
  const swaggerConfig = getSwaggerConfig()
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig)

  SwaggerModule.setup('/docs', app, swaggerDocument, {
    jsonDocumentUrl: 'openapi.json',
  })

  app.use(cookieParser(config.getOrThrow<string>('COOKIES_SECRET')))
  app.useGlobalPipes(new ValidationPipe())
  app.enableCors(getCorsConfig(config))
  await app.listen(config.getOrThrow<number>('HTTP_PORT') || 3000)
}
bootstrap()

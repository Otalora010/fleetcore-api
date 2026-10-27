import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { setupSwagger, SWAGGER_PATH } from './config/swagger.config.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  // Guards, ValidationPipe, interceptor y filtro se registran en CoreModule.
  app.setGlobalPrefix('api');
  app.enableCors();
  setupSwagger(app);
  const port = config.get<number>('port', 3000);
  await app.listen(port);
  const logger = new Logger('Bootstrap');
  logger.log(`API:     http://localhost:${port}/api`);
  logger.log(`Swagger: http://localhost:${port}/${SWAGGER_PATH}`);
}
void bootstrap();

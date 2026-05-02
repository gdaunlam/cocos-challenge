import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Environment } from './config/environment';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const enableSwagger = configService.get<boolean>('environment.enableSwagger') ?? true;
  const port = configService.get<number>('environment.port') ?? 3000;

  if (enableSwagger) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('API Documentation')
      .setDescription('API description')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(port);
}
bootstrap();
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import cors from 'cors';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { IEnvironmentConfig } from './config/environment';
import { runMigrations } from './database/run-migrations';

async function bootstrap() {
  await runMigrations();

  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.use(cors());

  const configService = app.get(ConfigService);
  const env = configService.get<IEnvironmentConfig>('environment')!;

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  if (env.enableSwagger) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('API Documentation')
      .setDescription('API description')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(env.port);
}
bootstrap();
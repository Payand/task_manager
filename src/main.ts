import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import { join } from 'path';
import helmet from 'helmet';
import { ValidationPipe, Logger } from '@nestjs/common';
import { GlobalExceptionsFilter } from './shared/filters/http-exception.filter';
import { LoggerInterceptor } from './shared/interceptor/logger-interceptor';
import { helmetConfig } from './shared/config/helmet.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port: number =
    configService.get<number>('PORT') || Number(process.env.PORT) || 3000;
  app.enableCors({
    origin: ['*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.use(helmet(helmetConfig));
  app.useGlobalInterceptors(new LoggerInterceptor());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new GlobalExceptionsFilter());

  app.use(express.static(join(process.cwd(), '.')));
  app.use('/swagger-static', express.static(join(process.cwd(), '.')));
  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('Task Management API')
    .setDescription('API for managing tasks, categories, and users')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customJs: '/swagger-static/swagger-authtoken.js',
  });

  await app.listen(process.env.PORT || 3000);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(
    `Swagger documentation is available at: http://localhost:${port}/api`,
  );
  logger.log(
    `WebSocket test page is available at: http://localhost:${port}/task-ws-test.html`,
  );
  if (process.env.NODE_ENV !== 'production') {
    const { exec } = await import('child_process');
    const os = process.platform;
    const wsUrl: string = 'http://localhost:3000/task-ws-test.html';
    const swaggerUrl: string = 'http://localhost:3000/api';
    const fs = await import('fs');
    const wsLockFile = './.ws-test-opened.lock';
    const swaggerLockFile = './.swagger-opened.lock';

    if (!fs.existsSync(wsLockFile)) {
      fs.writeFileSync(wsLockFile, 'opened');
      if (os === 'win32') {
        exec(`start ${wsUrl}`);
      } else if (os === 'darwin') {
        exec(`open ${wsUrl}`);
      } else {
        exec(`xdg-open ${wsUrl}`);
      }
    }
    if (!fs.existsSync(swaggerLockFile)) {
      fs.writeFileSync(swaggerLockFile, 'opened');
      if (os === 'win32') {
        exec(`start ${swaggerUrl}`);
      } else if (os === 'darwin') {
        exec(`open ${swaggerUrl}`);
      } else {
        exec(`xdg-open ${swaggerUrl}`);
      }
    }
  }
}
void bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(express.static(join(process.cwd(), '.')));
  app.use('/swagger-static', express.static(join(process.cwd(), '.')));
  app.setGlobalPrefix('v1/api');

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

  await app.listen(process.env.PORT ?? 3000);

  if (process.env.NODE_ENV !== 'production') {
    const { exec } = await import('child_process');
    const os = process.platform;
    let wsUrl = 'http://localhost:3000/task-ws-test.html';
    let swaggerUrl = 'http://localhost:3000/api';
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
bootstrap();

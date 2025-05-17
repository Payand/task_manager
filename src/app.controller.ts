import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import * as fs from 'fs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('unlock-ws-test')
  unlockWsTest(@Res() res: Response) {
    try {
      fs.unlinkSync('./.ws-test-opened.lock');
      res.status(200).send('Lock file removed');
    } catch {
      res.status(404).send('Lock file not found');
    }
  }

  @Get('unlock-swagger')
  unlockSwagger(@Res() res: Response) {
    try {
      fs.unlinkSync('./.swagger-opened.lock');
      res.status(200).send('Swagger lock file removed');
    } catch {
      res.status(404).send('Swagger lock file not found');
    }
  }
}

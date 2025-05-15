import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('User Endpoints (e2e)', () => {
  let app: INestApplication;
  let jwt: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();


    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'useruser', password: 'userpass' });
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'useruser', password: 'userpass' });
    jwt = loginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/register (POST) - should not allow duplicate registration', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'useruser', password: 'userpass' });
    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('message');
  });

  it('/auth/login (POST) - should fail with wrong password', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'useruser', password: 'wrongpass' });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message');
  });
});

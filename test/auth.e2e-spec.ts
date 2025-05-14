import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth Endpoints (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/register (POST) - should register a user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'testuser', password: 'testpass' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('username', 'testuser');
  });

  it('/auth/login (POST) - should login and return JWT', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'testuser2', password: 'testpass2' });
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'testuser2', password: 'testpass2' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('access_token');
  });
});

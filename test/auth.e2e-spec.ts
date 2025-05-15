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
    const username = 'testuser_' + Date.now();
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username, password: 'testpass' });
    expect([201, 409]).toContain(res.status); // Accept 201 (created) or 409 (already exists)
    if (res.status === 201) {
      expect(res.body).toHaveProperty('username', username);
    } else {
      expect(res.body).toHaveProperty('message');
    }
  });

  it('/auth/login (POST) - should login and return JWT', async () => {
    const username = 'testuser2_' + Date.now();
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username, password: 'testpass2' });
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username, password: 'testpass2' });
    expect(res.status).toBe(200); // Login returns 200
    expect(res.body).toHaveProperty('access_token');
  });
});

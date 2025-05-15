import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Category Endpoints (e2e)', () => {
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
      .send({ username: 'catuser', password: 'catpass' });
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'catuser', password: 'catpass' });
    jwt = loginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/categories (POST) - should create a category', async () => {
    const categoryName = 'Work'; // must be a valid enum value
    const res = await request(app.getHttpServer())
      .post(`/categories/${categoryName}`)
      .set('Authorization', `Bearer ${jwt}`);
    expect([201, 409]).toContain(res.status); // Accept 201 (created) or 409 (already exists)
    if (res.status === 201) {
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name', categoryName);
    } else {
      expect(res.body).toHaveProperty('message');
    }
  });

  it('/categories (GET) - should return all categories', async () => {
    await request(app.getHttpServer())
      .post('/categories/Personal')
      .set('Authorization', `Bearer ${jwt}`);
    const res = await request(app.getHttpServer())
      .get('/categories')
      .set('Authorization', `Bearer ${jwt}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

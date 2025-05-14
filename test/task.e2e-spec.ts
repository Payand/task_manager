import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Task Endpoints (e2e)', () => {
  let app: INestApplication;
  let jwt: string;
  let categoryId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // Register and login user
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'taskuser', password: 'taskpass' });
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'taskuser', password: 'taskpass' });
    jwt = loginRes.body.access_token;

    // Create a category
    const catRes = await request(app.getHttpServer())
      .post('/categories')
      .send({ name: 'TestCat' });
    categoryId = catRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/tasks (POST) - should create a task', async () => {
    const res = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${jwt}`)
      .send({ title: 'Test Task', description: 'desc', category: categoryId });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('title', 'Test Task');
  });

  it('/tasks (GET) - should return all tasks for user', async () => {
    const res = await request(app.getHttpServer())
      .get('/tasks')
      .set('Authorization', `Bearer ${jwt}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('/tasks/:id/complete (POST) - should mark task as complete', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${jwt}`)
      .send({ title: 'To Complete', description: '', category: categoryId });
    const taskId = createRes.body.id;
    const res = await request(app.getHttpServer())
      .post(`/tasks/${taskId}/complete`)
      .set('Authorization', `Bearer ${jwt}`);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('completed', true);
  });
});

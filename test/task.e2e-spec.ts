import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Task Endpoints (e2e)', () => {
  let app: INestApplication;
  let jwt: string;
  let categoryId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

 
    const username = 'taskuser_' + Date.now();
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username, password: 'taskpass' });
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username, password: 'taskpass' });
    jwt = loginRes.body.access_token;

    
    const catRes = await request(app.getHttpServer())
      .post('/categories/Work')
      .set('Authorization', `Bearer ${jwt}`);
    if (catRes.status === 201) {
      categoryId = catRes.body.id;
    } else {

      const listRes = await request(app.getHttpServer())
        .get('/categories')
        .set('Authorization', `Bearer ${jwt}`);
      const found = listRes.body.find((c: any) => c.name === 'Work');
      categoryId = found ? found.id : undefined;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('/tasks (POST) - should create a task', async () => {
    const res = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${jwt}`)
      .send({ title: 'Test Task', description: 'desc', categoryId });
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
      .send({ title: 'To Complete', description: '', categoryId });
    const taskId = createRes.body.id;
    const res = await request(app.getHttpServer())
      .post(`/tasks/${taskId}/complete`)
      .set('Authorization', `Bearer ${jwt}`);
    expect([200, 201]).toContain(res.status); // Accept 200 or 201
    expect(res.body).toHaveProperty('completed', true);
  });

  it('/categories (POST) - should not allow duplicate category', async () => {
    const res = await request(app.getHttpServer())
      .post('/categories/Personal')
      .set('Authorization', `Bearer ${jwt}`);
    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('message');
  });

  it('/tasks (POST) - should not allow duplicate task title for user', async () => {

    await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${jwt}`)
      .send({ title: 'Unique Task', description: 'desc', categoryId });
 
    const res = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${jwt}`)
      .send({ title: 'Unique Task', description: 'desc', categoryId });
    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('message');
  });
});

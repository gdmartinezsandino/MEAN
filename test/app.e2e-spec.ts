import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('TasksController (e2e)', () => {
  let app: INestApplication;
  let createdTaskId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  // POST /tasks - create a new task
  it('/tasks (POST) creates a task', async () => {
    const taskDto = {
      title: 'e2e test task',
      status: 'Pending',
      dueDate: new Date(Date.now() + 86400000).toISOString(), // 1 day in future
      tags: ['e2e', 'nestjs'],
    };

    const res = await request(app.getHttpServer())
      .post('/tasks')
      .send(taskDto)
      .expect(201);

    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toBe(taskDto.title);
    createdTaskId = res.body._id; // Save for later tests
  });

  // GET /tasks - retrieve all tasks
  it('/tasks (GET) returns tasks array', async () => {
    const res = await request(app.getHttpServer())
      .get('/tasks')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  // GET /tasks/:id - get specific task by id
  it('/tasks/:id (GET) returns a specific task', async () => {
    const res = await request(app.getHttpServer())
      .get(`/tasks/${createdTaskId}`)
      .expect(200);

    expect(res.body._id).toBe(createdTaskId);
    expect(res.body.title).toBe('e2e test task');
  });

  // GET /tasks/:id - 404 for non-existing id
  it('/tasks/:id (GET) returns 404 for non-existing task', async () => {
    await request(app.getHttpServer())
      .get('/tasks/605c39f7c0a8a91a5c1b2b30') // Some random ObjectId
      .expect(404);
  });

  // PUT /tasks/:id - update existing task
  it('/tasks/:id (PUT) updates a task', async () => {
    const updateDto = { status: 'In Progress' };

    const res = await request(app.getHttpServer())
      .put(`/tasks/${createdTaskId}`)
      .send(updateDto)
      .expect(200);

    expect(res.body.status).toBe('In Progress');
  });

  // PUT /tasks/:id - prevent invalid status transition Pending -> Completed
  it('/tasks/:id (PUT) rejects invalid status change from Pending to Completed', async () => {
    // First, set status back to Pending so we can test the forbidden transition
    await request(app.getHttpServer())
      .put(`/tasks/${createdTaskId}`)
      .send({ status: 'Pending' })
      .expect(200);

    const res = await request(app.getHttpServer())
      .put(`/tasks/${createdTaskId}`)
      .send({ status: 'Completed' })
      .expect(400); // Assuming your controller/service throws 400 on this error

    expect(res.body.message).toContain('Cannot change status directly from Pending to Completed');
  });

  // PUT /tasks/:id - 404 for non-existing id
  it('/tasks/:id (PUT) returns 404 for non-existing task', async () => {
    const updateDto = { title: 'Non-existing task' };

    await request(app.getHttpServer())
      .put('/tasks/605c39f7c0a8a91a5c1b2b30')
      .send(updateDto)
      .expect(404);
  });

  // DELETE /tasks/:id - delete task
  it('/tasks/:id (DELETE) deletes a task', async () => {
    await request(app.getHttpServer())
      .delete(`/tasks/${createdTaskId}`)
      .expect(204);
  });

  // DELETE /tasks/:id - 404 for non-existing id
  it('/tasks/:id (DELETE) returns 404 for non-existing task', async () => {
    await request(app.getHttpServer())
      .delete('/tasks/605c39f7c0a8a91a5c1b2b30')
      .expect(404);
  });

  afterAll(async () => {
    await app.close();
  });
});

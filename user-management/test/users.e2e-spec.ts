import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestUtils } from './test-utils';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: number;

  beforeAll(async () => {
    app = await TestUtils.createTestingApp();
    // Register and login a test user
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'test123',
        username: 'testuser'
      });
    userId = registerResponse.body.id;
    
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'testuser',
        password: 'test123'
      });
    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /users/profile', () => {
    it('should get user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect(({ body }) => {
          expect(body.email).toBe('test@example.com');
        });
    });

    it('should fail without auth token', () => {
      return request(app.getHttpServer())
        .get('/users/profile')
        .expect(401);
    });
  });

  describe('PATCH /users/profile', () => {
    it('should update user profile', () => {
      return request(app.getHttpServer())
        .patch('/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.firstName).toBe('Updated');
          expect(body.lastName).toBe('Name');
        });
    });
  });
});
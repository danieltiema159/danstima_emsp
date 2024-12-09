import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestUtils } from './test-utils';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../src/users/entities/user.entity';
import { AuthModule } from '../src/auth/auth.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await TestUtils.createTestingApp();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('POST /auth/register', () => {
    it('should register new user successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          username: 'testuser',
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toHaveProperty('id');
          expect(body.email).toBe('test@example.com');
        });
    });

    it('should fail with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          username: 'testuser'
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'test123',
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toHaveProperty('access_token');
        });
    });

    it('should fail with wrong credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });
});
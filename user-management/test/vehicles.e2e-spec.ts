import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestUtils } from './test-utils';

describe('VehiclesController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let vehicleId: number;

  beforeAll(async () => {
    app = await TestUtils.createTestingApp();
    
    // Register and login a test user
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'test123',
        username: 'testuser'
      });
    
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'testuser',
        password: 'test123'
      });
    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /vehicles', () => {
    it('should create new vehicle', () => {
      return request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'Electric Car',
          batteryCapacity: 75.0,
          range: 400,
          specifications: 'Long range version'
        })
        .expect(201)
        .expect(({ body }) => {
          vehicleId = body.id;
          expect(body.type).toBe('Electric Car');
          expect(body.batteryCapacity).toBe(75.0);
        });
    });
  });

  describe('GET /vehicles', () => {
    it('should get all vehicles with pagination', () => {
      return request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200)
        .expect(({ body }) => {
          expect(Array.isArray(body.items)).toBe(true);
          expect(body).toHaveProperty('meta');
          expect(body.meta).toHaveProperty('totalItems');
        });
    });
  });

  describe('GET /vehicles/:id', () => {
    it('should get vehicle by id', () => {
      return request(app.getHttpServer())
        .get(`/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect(({ body }) => {
          expect(body.id).toBe(vehicleId);
          expect(body.type).toBe('Electric Car');
          expect(body.batteryCapacity).toBe(75.0);
        });
    });
  });

  describe('PATCH /vehicles/:id', () => {
    it('should update vehicle', () => {
      return request(app.getHttpServer())
        .patch(`/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          range: 450,
          specifications: 'Updated specifications'
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.range).toBe(450);
          expect(body.specifications).toBe('Updated specifications');
        });
    });
  });

  describe('DELETE /vehicles/:id', () => {
    it('should delete vehicle', () => {
      return request(app.getHttpServer())
        .delete(`/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
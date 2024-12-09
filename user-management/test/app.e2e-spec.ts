import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../src/users/entities/user.entity';
import { Vehicle } from '../src/vehicles/entities/vehicle.entity';
import { Role } from '../src/users/entities/role.enum';
import { TestUtils } from './test-utils';
import { DataSource } from 'typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: number;
  let vehicleId: number;

  beforeAll(async () => {
    app = await TestUtils.createTestingApp();
  });

  afterAll(async () => {
    if (app) {
      const dataSource = app.get(DataSource);
      await dataSource.dropDatabase();
      await app.close();
    }
  });

  // Auth Tests
  describe('Authentication', () => {
    const testUser = {
    email: 'test@example.com',
    password: 'test123',
    username: 'testuser'
    };

    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201)
        .expect(({ body }) => {
          expect(body.email).toBe(testUser.email);
          expect(body.password).toBeUndefined();
          userId = body.id;
        });
    });

    it('should login user and return JWT token', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password,
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.access_token).toBeDefined();
          authToken = body.access_token;
        });
    });
  });

  // Users Tests
  describe('Users', () => {
    it('should get user profile', () => {
      return request(app.getHttpServer())
        .get(`/users/profile`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect(({ body }) => {
          expect(body.email).toBeDefined();
        });
    });

    it('should update user profile', () => {
      return request(app.getHttpServer())
        .patch(`/users/${userId}`)
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

  // Vehicles Tests
  describe('Vehicles', () => {
    const testVehicle = {
      make: 'Tesla',
      model: 'Model 3',
      year: 2022,
      licensePlate: 'TEST123',
    };

    it('should create a new vehicle', () => {
      return request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testVehicle)
        .expect(201)
        .expect(({ body }) => {
          expect(body.make).toBe(testVehicle.make);
          vehicleId = body.id;
        });
    });

    it('should get all vehicles', () => {
      return request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect(({ body }) => {
          expect(Array.isArray(body)).toBe(true);
          expect(body.length).toBeGreaterThan(0);
        });
    });

    it('should get vehicle by id', () => {
      return request(app.getHttpServer())
        .get(`/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect(({ body }) => {
          expect(body.id).toBe(vehicleId);
        });
    });

    it('should update vehicle', () => {
      return request(app.getHttpServer())
        .patch(`/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          model: 'Model Y',
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.model).toBe('Model Y');
        });
    });

    it('should delete vehicle', () => {
      return request(app.getHttpServer())
        .delete(`/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});

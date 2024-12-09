import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from '../src/app.module';
import { User } from '../src/users/entities/user.entity';
import { Vehicle } from '../src/vehicles/entities/vehicle.entity';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { ConfigModule } from '@nestjs/config';

export class TestUtils {
  static async createTestingApp(): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'test_user',
          password: 'test_password',
          database: 'test_db',
          entities: [User, Vehicle],
          synchronize: true,
          dropSchema: true,
          logging: false
        }),
      ],
    }).compile();

    const app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true
    }));
    
    await app.init();
    return app;
  }

  static async getAuthToken(app: INestApplication, user: any): Promise<string> {
    // First register the user
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(user);
      
    // Then login to get token
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: user.email,
        password: user.password
      });
      
    return response.body.access_token;
  }
}
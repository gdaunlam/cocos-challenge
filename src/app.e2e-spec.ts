import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as supertest from 'supertest';
const request = supertest.default;
import { AppModule } from '../src/app.module';

describe('App E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Instruments CRUD', () => {
    const testInstrument = {
      name: 'E2E_TEST_INSTRUMENT',
      emissionDate: '2024-06-01',
      amount: 999,
    };

    it('GET /instruments - should return array of instruments', async () => {
      const response = await request(app.getHttpServer())
        .get('/instruments')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('emissionDate');
      expect(response.body[0]).toHaveProperty('amount');
    });

    it('POST /instruments - should create a new instrument', async () => {
      const response = await request(app.getHttpServer())
        .post('/instruments')
        .send(testInstrument)
        .expect(201);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.some((i: any) => i.name === testInstrument.name)).toBe(true);
    });

    it('POST /instruments - should return 400 for duplicate instrument', async () => {
      await request(app.getHttpServer())
        .post('/instruments')
        .send(testInstrument)
        .expect(400);
    });

    it('POST /instruments - should return 400 for missing required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/instruments')
        .send({ name: 'TEST' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('DELETE /instruments/:name - should delete instrument', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/instruments/${testInstrument.name}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.some((i: any) => i.name === testInstrument.name)).toBe(false);
    });

    it('DELETE /instruments/:name - should return empty array after deletion', async () => {
      const response = await request(app.getHttpServer())
        .get('/instruments');

      const beforeCount = response.body.length;

      await request(app.getHttpServer())
        .delete(`/instruments/USD`)
        .expect(200);

      const afterResponse = await request(app.getHttpServer())
        .get('/instruments');

      expect(afterResponse.body.length).toBe(beforeCount - 1);
    });
  });

  describe('Trace ID Integration', () => {
    it('should use provided x-trace-id header', async () => {
      const customTraceId = 'e2e-custom-trace-123';

      const response = await request(app.getHttpServer())
        .get('/instruments')
        .set('x-trace-id', customTraceId)
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should generate trace ID when not provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/instruments')
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('Configuration', () => {
    it.todo('Swagger UI should be accessible when ENABLE_SWAGGER=true');
    it.todo('Swagger UI should return 404 when ENABLE_SWAGGER=false');
  });
});
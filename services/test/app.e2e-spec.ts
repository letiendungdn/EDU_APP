import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../apps/api-gateway/src/app.module';
import { AllExceptionsFilter, ResponseInterceptor } from '@app/common';

describe('API Gateway E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health', () => {
    it('GET /health returns status object', () =>
      request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('status');
          expect(res.body.data).toHaveProperty('services');
        }));
  });

  describe('Auth', () => {
    const testEmail = `test-${Date.now()}@nihongo.test`;
    const testPassword = 'TestPass123!';
    let token: string;

    it('POST /api/auth/register creates user and returns token', () =>
      request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: testEmail, password: testPassword })
        .expect(201)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('access_token');
          token = res.body.data.access_token;
        }));

    it('POST /api/auth/login with correct credentials returns token', () =>
      request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: testEmail, password: testPassword })
        .expect(201)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('access_token');
        }));

    it('POST /api/auth/login with wrong password returns 401', () =>
      request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: testEmail, password: 'wrong12' })
        .expect(401)
        .expect((res) => {
          expect(res.body.success).toBe(false);
        }));

    it('GET /api/auth/me with valid token returns user', () => {
      if (!token) return;
      return request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.email).toBe(testEmail);
        });
    });
  });

  describe('MockExam', () => {
    it('GET /api/mock-exams returns list of templates', () =>
      request(app.getHttpServer())
        .get('/api/mock-exams')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
          expect(res.body.data[0]).toHaveProperty('level');
          expect(res.body.data[0]).toHaveProperty('durationMinutes');
        }));

    it('POST /api/mock-exams/n5/start returns exam structure', () =>
      request(app.getHttpServer())
        .post('/api/mock-exams/n5/start')
        .expect(201)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('examId');
          expect(res.body.data).toHaveProperty('questions');
          expect(Array.isArray(res.body.data.questions)).toBe(true);
        }));

    it('POST /api/mock-exams/:id/submit with bad uuid returns 404', () =>
      request(app.getHttpServer())
        .post('/api/mock-exams/00000000-0000-0000-0000-000000000000/submit')
        .send({ answers: {} })
        .expect(404)
        .expect((res) => {
          expect(res.body.success).toBe(false);
        }));

    it('full exam flow: start → submit → verify response', async () => {
      const startRes = await request(app.getHttpServer())
        .post('/api/mock-exams/n5/start')
        .expect(201);

      const { examId, questions } = startRes.body.data;
      const submitRes = await request(app.getHttpServer())
        .post(`/api/mock-exams/${examId}/submit`)
        .send({ answers: {} })
        .expect(201);

      expect(submitRes.body.data).toHaveProperty('percent');
      expect(submitRes.body.data).toHaveProperty('passed');
      expect(submitRes.body.data).toHaveProperty('sectionScores');
      expect(submitRes.body.data.total).toBe(questions.length);
    });
  });

  describe('Protected routes', () => {
    it('GET /api/admin/stats without token returns 401', () =>
      request(app.getHttpServer()).get('/api/admin/stats').expect(401));

    it('GET /api/mock-exams/history without token returns 401', () =>
      request(app.getHttpServer()).get('/api/mock-exams/history').expect(401));
  });
});

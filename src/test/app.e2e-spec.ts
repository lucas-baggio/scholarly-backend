import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';

describe('App (e2e) – Caminho feliz e integração', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let adminId: string;
  let schoolId: string;
  let subjectId: string;
  let teacherId: string;
  let allocationId: string;
  let timeSlotId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = app.get(PrismaService);
    if (prisma.isConnected) {
      await prisma.client.schedule.deleteMany();
      await prisma.client.allocation.deleteMany();
      await prisma.client.timeSlot.deleteMany();
      await prisma.client.subject.deleteMany();
      await prisma.client.school.deleteMany();
      await prisma.client.user.deleteMany();
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. Health retorna ok e database status', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.body).toMatchObject({
      status: 'ok',
      timestamp: expect.any(String),
      uptime: expect.any(String),
      version: expect.any(String),
    });
    expect(res.body).toHaveProperty('database');
  });

  it('2. POST /users – cria Admin (mapper toPersistence)', async () => {
    const res = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Admin E2E',
        email: 'admin-e2e@test.com',
        password: 'admin123',
        role: 'ADMIN',
      })
      .expect(201);

    expect(res.body).toMatchObject({
      name: 'Admin E2E',
      email: 'admin-e2e@test.com',
      role: 'ADMIN',
      isActive: true,
    });
    expect(res.body).toHaveProperty('id');
    adminId = res.body.id;
  });

  it('3. POST /auth/login – obtém JWT', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin-e2e@test.com', password: 'admin123' })
      .expect(200);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.user).toMatchObject({
      email: 'admin-e2e@test.com',
      role: 'ADMIN',
    });
    accessToken = res.body.accessToken;
  });

  it('4. POST /schools – cria escola (com JWT no header, mapper toPersistence)', async () => {
    const res = await request(app.getHttpServer())
      .post('/schools')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Escola E2E',
        adminId,
      })
      .expect(201);

    expect(res.body).toMatchObject({
      name: 'Escola E2E',
      adminId,
      isActive: true,
    });
    expect(res.body).toHaveProperty('id');
    schoolId = res.body.id;
  });

  it('5. GET /schools e GET /schools/:id – valida mappers toDomain na leitura', async () => {
    const listRes = await request(app.getHttpServer())
      .get('/schools')
      .expect(200);
    expect(Array.isArray(listRes.body)).toBe(true);
    const school = listRes.body.find((s: { id: string }) => s.id === schoolId);
    expect(school).toMatchObject({
      id: schoolId,
      name: 'Escola E2E',
      adminId,
      isActive: true,
    });

    const getRes = await request(app.getHttpServer())
      .get(`/schools/${schoolId}`)
      .expect(200);
    expect(getRes.body).toMatchObject({
      id: schoolId,
      name: 'Escola E2E',
      adminId,
      isActive: true,
    });
  });

  it('6. POST /subjects – cria matérias (toPersistence + toDomain em GET)', async () => {
    const res = await request(app.getHttpServer())
      .post('/subjects')
      .send({ name: 'Matemática E2E', schoolId })
      .expect(201);

    expect(res.body).toMatchObject({
      name: 'Matemática E2E',
      schoolId,
      isActive: true,
    });
    expect(res.body).toHaveProperty('id');
    subjectId = res.body.id;
  });

  it('7. POST /users – cria Professor', async () => {
    const res = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Professor E2E',
        email: 'prof-e2e@test.com',
        password: 'prof123',
        role: 'TEACHER',
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.role).toBe('TEACHER');
    teacherId = res.body.id;
  });

  it('8. POST /allocations – vincula professor à escola/matéria', async () => {
    const res = await request(app.getHttpServer())
      .post('/allocations')
      .send({
        teacherId,
        schoolId,
        subjectId,
      })
      .expect(201);

    expect(res.body).toMatchObject({
      teacherId,
      schoolId,
      subjectId,
    });
    expect(res.body).toHaveProperty('id');
    allocationId = res.body.id;
  });

  it('9. GET /users – valida toDomain (schoolIds e subjects preenchidos)', async () => {
    const res = await request(app.getHttpServer()).get('/users').expect(200);
    const teacher = res.body.find((u: { id: string }) => u.id === teacherId);
    expect(teacher).toBeDefined();
    expect(teacher.schoolIds).toContain(schoolId);
    expect(teacher.subjects).toContain(subjectId);
  });

  it('10. POST /time-slots – configura slot (adminUserId para autorização)', async () => {
    const res = await request(app.getHttpServer())
      .post('/time-slots')
      .send({
        schoolId,
        name: '1ª aula',
        dayOfWeek: 1,
        startTime: '07:00',
        endTime: '07:50',
        adminUserId: adminId,
      })
      .expect(201);

    expect(res.body).toMatchObject({
      schoolId,
      name: '1ª aula',
      dayOfWeek: 1,
      startTime: '07:00',
      endTime: '07:50',
    });
    expect(res.body).toHaveProperty('id');
    timeSlotId = res.body.id;
  });

  it('11. POST /schedules – agenda aula no slot', async () => {
    const res = await request(app.getHttpServer())
      .post('/schedules')
      .send({ allocationId, timeSlotId })
      .expect(201);

    expect(res.body).toMatchObject({
      allocationId,
      timeSlotId,
    });
    expect(res.body).toHaveProperty('id');
  });

  it('12. GET /school-grid/:schoolId – valida mapeamento da grade (toDomain em cadeia)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/school-grid/${schoolId}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);

    const slot = res.body.find(
      (s: { timeSlot: { id: string } }) => s.timeSlot.id === timeSlotId,
    );
    expect(slot).toBeDefined();
    expect(slot.timeSlot).toMatchObject({
      id: timeSlotId,
      name: '1ª aula',
      startTime: '07:00',
      endTime: '07:50',
      dayOfWeek: 1,
    });
    expect(slot.occupied).toBe(true);
    expect(slot.schedule).toMatchObject({
      professorName: 'Professor E2E',
      subjectName: 'Matemática E2E',
    });
  });

  it('13. Caminho infeliz – POST /schedules em slot já ocupado retorna 409', async () => {
    const res = await request(app.getHttpServer())
      .post('/schedules')
      .send({ allocationId, timeSlotId })
      .expect(409);

    expect(res.body).toMatchObject({
      statusCode: 409,
      error: 'Conflict',
    });
    expect(res.body.message).toContain('already occupied');
  });

  it('14. Validação de DTO – POST /users sem email retorna 400', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Invalid',
        password: '123456',
      })
      .expect(400);
  });
});

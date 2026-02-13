import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const connectionString =
  process.env.DATABASE_URL ??
  'postgresql://app:secret@localhost:5432/laboratorio';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 10;
const ADMIN_EMAIL = 'admin@test.com';
const ADMIN_PASSWORD = 'admin123';
const SCHOOL_NAME = 'Escola de Teste';

async function main() {
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      name: 'Admin Inicial',
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  await prisma.school.upsert({
    where: { adminId: admin.id },
    update: {},
    create: {
      name: SCHOOL_NAME,
      adminId: admin.id,
      isActive: true,
    },
  });

  console.log('Seed concluído: Admin e Escola de teste criados.');
  console.log('  Admin:', admin.email, '| Escola:', SCHOOL_NAME);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

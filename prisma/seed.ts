import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@asal.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.admin.create({
    data: {
      email,
      name: 'ASAL Admin',
      passwordHash
    }
  });

  console.log(`Created admin account: ${email}`);
  console.log('No products or lifecycle data were seeded — add real products from the dashboard.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

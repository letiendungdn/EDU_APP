import { PrismaClient } from '@prisma/client';
import { seedMinna } from './seed-minna';
import { seedKll } from './seed-kll';
import { seedReference } from './seed-reference';
import { seedSubscriptionPlans } from './seed-plans';

const prisma = new PrismaClient();

async function main() {
  await seedMinna(prisma);
  await seedKll(prisma);
  console.log('\nSeeding reference content...');
  await seedReference(prisma);
  await seedSubscriptionPlans(prisma);
  console.log('\nSeeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

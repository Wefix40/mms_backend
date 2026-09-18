import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeAllSuperAdmins() {
  try {
    const result = await prisma.users.updateMany({
      data: {
        is_superadmin: true,
        is_admin: true,
      },
    });

    console.log(`Success! Updated ${result.count} users to be superadmins.`);
  } catch (error) {
    console.error('Error updating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeAllSuperAdmins();

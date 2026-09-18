import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeSuperAdmin(emailOrUserId: string) {
  try {
    const user = await prisma.users.findFirst({
      where: {
        OR: [{ email: emailOrUserId }, { user_id: emailOrUserId }],
      },
    });

    if (!user) {
      console.log(`User not found: ${emailOrUserId}`);
      return;
    }

    await prisma.users.update({
      where: { id: user.id },
      data: {
        is_superadmin: true,
        is_admin: true,
      },
    });

    console.log(`Success! User ${emailOrUserId} is now a superadmin.`);
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Pass your email or user_id as the argument here!
makeSuperAdmin('YOUR_EMAIL_OR_USER_ID_HERE');

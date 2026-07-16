import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createDummyUser() {
  try {
    // Password ko hash karna (bilkul waise hi jaise register API karta hai)
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Database mein user create karna
    const user = await prisma.user.create({
      data: {
        email: 'test@prepai.com',
        password: hashedPassword,
        name: 'Test User',
      },
    });

    console.log('✅ Dummy User Created Successfully!');
    console.log('Email:', user.email);
    console.log('Password: password123');
  } catch (error) {
    console.error('❌ Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDummyUser();
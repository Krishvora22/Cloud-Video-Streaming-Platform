import { PrismaClient } from '@prisma/client';

// 1. Create the Prisma Client instance
export const prisma = new PrismaClient();

// 2. Smart Connect Function with Retry Logic
export const connectDb = async (retries = 5) => {
  while (retries > 0) {
    try {
      await prisma.$connect();
      console.log("✅ Database connected successfully");
      return; // Connection worked! Exit the function.
    } catch (error) {
      console.error(`⚠️ Database unreachable. Retrying in 5s... (${retries} attempts left)`);
      
      // Decrease retries and wait 5 seconds (5000ms)
      retries -= 1;
      await new Promise(res => setTimeout(res, 5000));
    }
  }

  // If we run out of retries, then we fail.
  console.error("❌ Database connection failed after multiple attempts.");
  process.exit(1);
};
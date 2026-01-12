import { PrismaClient } from '@prisma/client';

// 1. Create the Prisma Client instance
export const prisma = new PrismaClient();

// 2. Create a function to connect (so index.js can call it)
export const connectDb = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};
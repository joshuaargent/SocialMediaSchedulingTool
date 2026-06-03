import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient | null {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    return null;
  }
  
  try {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    
    return new PrismaClient({ adapter });
  } catch (error) {
    console.error('Failed to create Prisma client:', error);
    return null;
  }
}

const prismaInstance = createPrismaClient();

export const prisma = globalForPrisma.prisma ?? prismaInstance;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

// Helper to check if database is configured
export function isDatabaseConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}

// Helper to get prisma client or throw
export function requirePrisma(): PrismaClient {
  if (!prisma) {
    throw new Error('Database not configured. Please set DATABASE_URL environment variable.');
  }
  return prisma;
}
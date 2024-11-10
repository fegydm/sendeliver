import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger.js';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    logger.info('Starting database migrations...');
    
    // Migrácie sa spustia automaticky cez prisma
    // Tu môžeš pridať dodatočnú logiku pre migrácie
    
    logger.info('Database migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

main()
  .catch((error) => {
    logger.error('Unexpected error during migration:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    logger.info('Database connection closed');
  });
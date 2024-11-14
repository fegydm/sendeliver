// ./back/scripts/migrate.ts
import { PrismaClient } from "@prisma/client";
import { logger } from "../configs/logger";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info("Starting database migrations...");

    // Migrations will be triggered automatically via prisma
    // Add any additional logic for migrations if necessary

    logger.info("Database migrations completed successfully");
  } catch (error: any) {
    logger.error("Migration failed:", error);
    process.exit(1);
  }
}

main()
  .catch((error: any) => {
    logger.error("Unexpected error during migration:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    logger.info("Database connection closed");
  });

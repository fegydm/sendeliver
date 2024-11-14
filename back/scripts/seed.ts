import { PrismaClient } from "@prisma/client";
import { logger } from "../configs/logger.js";

const prisma = new PrismaClient();

const seedData = {
  users: [
    {
      email: "admin@sendeliver.com",
      name: "Admin User",
      role: "ADMIN",
    },
    {
      email: "dispatcher@sendeliver.com",
      name: "Dispatcher User",
      role: "DISPATCHER",
    },
  ],
  // Ďalšie seed dáta podľa potreby
};

async function main() {
  try {
    await prisma.$connect();
    logger.info("Starting database seed...");

    // Seed users
    for (const user of seedData.users) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: user,
        create: user,
      });
    }

    // Tu pridaj ďalšie seed operácie

    logger.info("Database seed completed successfully");
  } catch (error) {
    logger.error("Seed failed:", error);
    process.exit(1);
  }
}

main()
  .catch((error) => {
    logger.error("Unexpected error during seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    logger.info("Database connection closed");
  });

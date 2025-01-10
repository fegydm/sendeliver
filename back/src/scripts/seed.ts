// File: back/scripts/seed.ts
// Last change: Removed Prisma and migrated to direct PostgreSQL seeding with 'pg'

import pool from '../db/db.js';
import { logger } from '../configs/logger.js';

const seedData = {
    users: [
        {
            email: 'admin@sendeliver.com',
            name: 'Admin User',
            role: 'ADMIN'
        },
        {
            email: 'dispatcher@sendeliver.com',
            name: 'Dispatcher User',
            role: 'DISPATCHER'
        }
    ]
};

async function main() {
    try {
        logger.info('Starting database seed...');

        for (const user of seedData.users) {
            await pool.query(
                `INSERT INTO users (email, name, role)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (email)
                 DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role;`,
                [user.email, user.name, user.role]
            );
        }

        logger.info('Database seed completed successfully');
    } catch (error) {
        logger.error('Seed failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
        logger.info('Database connection closed');
    }
}

main().catch((error) => {
    logger.error('Unexpected error during seed:', error);
    process.exit(1);
});

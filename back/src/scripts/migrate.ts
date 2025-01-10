// File: back/scripts/migrate.ts
// Last change: Removed Prisma references and migrated to direct PostgreSQL queries using 'pg'

import pool from '../db/db.js';
import { logger } from '../configs/logger.js';

async function main(): Promise<void> {
  try {
    logger.info('Starting database migrations...');

    await pool.query(`CREATE TABLE IF NOT EXISTS user_styles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      primary_color VARCHAR(7) NOT NULL DEFAULT '#000000',
      background_color VARCHAR(7) NOT NULL DEFAULT '#ffffff',
      font_size VARCHAR(10) NOT NULL DEFAULT '16px',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`);

    logger.info('Database migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
    logger.info('Database connection closed');
  }
}

main().catch((error) => {
  logger.error('Unexpected error during migration:', error);
  process.exit(1);
});

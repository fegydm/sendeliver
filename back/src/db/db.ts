// File: back/src/db/db.ts
// Last change: Added PostgreSQL connection pool using 'pg' without Prisma

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

export default pool;

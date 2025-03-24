// File: ./back/configs/db.ts
// Last change: Simplified logging system using console-based methods

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('render.com')
    ? { rejectUnauthorized: false }
    : false
});

pool.query('SELECT NOW()', (err: Error | null) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    const sanitizedUrl = process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@');
    console.error('Using connection:', sanitizedUrl);
  } else {
    console.log('✅ Database connected successfully');
  }
});

export default pool;

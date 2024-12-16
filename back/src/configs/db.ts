// .back/src/configs/db.ts
import pkg from 'pg';
const { Pool } = pkg;

import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// Configure PostgreSQL connection
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.POSTGRES_SSL === "true" ? { rejectUnauthorized: false } : false, // Handle SSL for Render or local
});

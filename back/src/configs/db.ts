// File: back/src/configs/db.ts
// Last change: Added error logging and connection testing

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

// Configure PostgreSQL connection
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('render.com') 
        ? { rejectUnauthorized: false }
        : false
});

// Test connection
pool.query('SELECT NOW()', (err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        // Log connection string without sensitive data
        const sanitizedUrl = process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@');
        console.error('Using connection:', sanitizedUrl);
    } else {
        console.log('✅ Database connected successfully');
    }
});

export default pool;
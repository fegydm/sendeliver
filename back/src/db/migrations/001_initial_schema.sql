-- File: back/src/db/migrations/001_initial_schema.sql
-- Last change: Added initial schema with UNIQUE constraint and protection against duplicates

CREATE TABLE IF NOT EXISTS user_styles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    primary_color VARCHAR(7) NOT NULL DEFAULT '#000000',
    background_color VARCHAR(7) NOT NULL DEFAULT '#ffffff',
    font_size VARCHAR(10) NOT NULL DEFAULT '16px',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Rollback script (in case of errors)
DROP TABLE IF EXISTS user_styles;

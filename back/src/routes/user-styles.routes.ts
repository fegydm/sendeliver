// File: back/src/routes/user-styles.routes.ts
// Last change: Switched from Prisma to 'pg' for direct PostgreSQL management

import express from 'express';
import pool from '../db/db.js';

const router = express.Router();

// Fetch user styles
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await pool.query('SELECT * FROM user_styles WHERE user_id = $1', [userId]);
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Database query failed.' });
    }
});

// Update user styles
router.post('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { primary_color, background_color, font_size } = req.body;
        await pool.query(
            `INSERT INTO user_styles (user_id, primary_color, background_color, font_size, updated_at)
             VALUES ($1, $2, $3, $4, NOW())
             ON CONFLICT (user_id) 
             DO UPDATE SET 
             primary_color = EXCLUDED.primary_color,
             background_color = EXCLUDED.background_color,
             font_size = EXCLUDED.font_size,
             updated_at = NOW()`,
            [userId, primary_color, background_color, font_size]
        );
        res.status(200).send('User styles updated successfully');
    } catch (error) {
        res.status(500).json({ error: 'Database update failed.' });
    }
});

export default router;

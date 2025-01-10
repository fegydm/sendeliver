// File: back/src/routes/delivery.routes.ts
// Last change: Fixed TypeScript overload error by ensuring proper async handler typing

import pkg from 'pg';
const { Pool } = pkg;
import { Router, Request, Response, NextFunction } from "express";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const router = Router();

router.post("/import-delivery", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id, delivery_date, delivery_time, delivery_type, delivery_country, delivery_zip, delivery_city, weight, id_pp, id_carrier, name_carrier, vehicle_type } = req.body;

        if (!id_pp || !delivery_date) {
            res.status(400).json({
                status: "NOT_OK",
                error: "Missing required fields: 'id_pp' and 'delivery_date' are mandatory."
            });
            return;
        }

        const existing = await pool.query(`SELECT 1 FROM deliveries WHERE id_pp = $1 LIMIT 1`, [id_pp]);
        if (existing.rowCount && existing.rowCount > 0) {
            res.status(200).json({
                status: "NOT_OK",
                message: `Delivery with ID_PP ${id_pp} already exists. No action taken.`
            });
            return;
        }

        const result = await pool.query(
            `INSERT INTO deliveries 
            (delivery_id, delivery_date, delivery_time, delivery_type, 
            delivery_country, delivery_zip, delivery_city, weight, 
            id_pp, id_carrier, name_carrier, vehicle_type)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
            [id, delivery_date, delivery_time, delivery_type, delivery_country, delivery_zip, delivery_city, weight, id_pp, id_carrier, name_carrier, vehicle_type]
        );

        res.status(201).json({
            status: "OK",
            message: `✅ Delivery with ID_PP ${id_pp} was successfully recorded.`,
            data: result.rows[0]
        });
    } catch (error) {
        next(error); // Forwarding error to error-handling middleware
    }
});

export default router;

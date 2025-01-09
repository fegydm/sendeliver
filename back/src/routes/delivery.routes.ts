import pkg from 'pg';
const { Pool } = pkg;
import { Router, Request, Response } from "express";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

const router = Router();
const deliveryApiUrl = process.env.DELIVERY_API_URL;

router.post("/import-delivery", async (req: Request, res: Response) => {
    const {
        id,
        delivery_date,
        delivery_time,
        delivery_type,
        delivery_country,
        delivery_zip,
        delivery_city,
        weight,
        id_pp,
        id_carrier,
        name_carrier,
        vehicle_type
    } = req.body;

    if (!id || !delivery_date) {
        return res.status(400).json({ error: "Missing required fields: 'id' and 'delivery_date' are mandatory." });
    }

    try {
        const existing = await pool.query(`SELECT * FROM deliveries WHERE delivery_id = $1`, [id]);
        if (existing.rows.length > 0) {
            return res.status(200).json({
                message: `Delivery with ID ${id} already exists. No action taken.`
            });
        }

        const result = await pool.query(
            `INSERT INTO deliveries 
            (delivery_id, delivery_date, delivery_time, delivery_type, 
            delivery_country, delivery_zip, delivery_city, weight, 
            id_pp, id_carrier, name_carrier, vehicle_type)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [id, delivery_date, delivery_time, delivery_type, delivery_country, 
             delivery_zip, delivery_city, weight, id_pp, id_carrier, name_carrier, vehicle_type]
        );

        res.status(201).json({
            message: `Delivery with ID ${id} was successfully recorded.`
        });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Database error occurred." });
    }
});

export default router;

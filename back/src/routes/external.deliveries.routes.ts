// File: ./back/src/routes/external.deliveries.routes.ts
// Last change: Fixed Request types

import { Router, Request, Response, NextFunction } from 'express';
import pkg from 'pg';

console.log("[external.deliveries] Route loaded");

const { Pool } = pkg;
const router = Router();

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Type definition for incoming delivery data
interface DeliveryData {
  id?: string;
  delivery_date: string;
  delivery_time?: string;
  delivery_type?: string;
  delivery_country?: string;
  delivery_zip?: string;
  delivery_city?: string;
  weight?: number;
  id_pp: string;
  id_carrier?: string;
  name_carrier?: string;
  vehicle_type?: string;
}

// Create a properly typed Request interface
interface TypedRequest<T> extends Request {
  body: T;
}

// Middleware to verify API key from request header
const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'];
  console.log("[external.deliveries] Incoming request");
  console.log("[external.deliveries] Provided API key:", apiKey);
  console.log("[external.deliveries] Expected API key:", process.env.DELIVERY_API_KEY);

  if (!apiKey || apiKey !== process.env.DELIVERY_API_KEY) {
    console.warn("[external.deliveries] 🔒 Unauthorized access attempt");
    res.status(401).json({ status: 'NOT_OK', error: 'Unauthorized: Invalid or missing API key' });
    return;
  }

  console.log("[external.deliveries] ✅ API key is valid");
  next();
};

// Log route load
console.log("[external.deliveries] Route loaded");

// Protect all routes under /api/external/deliveries
router.use(authMiddleware);

// POST /api/external/deliveries
router.post(
  '/',
  async (
    req: TypedRequest<DeliveryData>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
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

      if (!id_pp || !delivery_date) {
        res.status(400).json({
          status: 'NOT_OK',
          error: "Missing required fields: 'id_pp' and 'delivery_date' are mandatory."
        });
        return;
      }

      // Check for existing delivery by id_pp
      const existing = await pool.query(
        'SELECT 1 FROM external.deliveries WHERE id_pp = $1 LIMIT 1',
        [id_pp]
      );

      if (existing.rowCount && existing.rowCount > 0) {
        res.status(200).json({
          status: 'OK',
          message: `Delivery with ID_PP ${id_pp} already exists. No action taken.`
        });
        return;
      }

      // Insert new delivery
      const result = await pool.query(
        `INSERT INTO external.deliveries 
         (delivery_id, delivery_date, delivery_time, delivery_type, 
          delivery_country, delivery_zip, delivery_city, weight, 
          id_pp, id_carrier, name_carrier, vehicle_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
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
        ]
      );

      console.log(`[external.deliveries] ✅ Delivery inserted: ${id_pp}`);

      res.status(201).json({
        status: 'OK',
        message: `✅ External delivery with ID_PP ${id_pp} was successfully recorded.`,
        data: result.rows[0]
      });
    } catch (error) {
      console.error("[external.deliveries] ❌ Error:", error);
      next(error);
    }
  }
);

export default router;
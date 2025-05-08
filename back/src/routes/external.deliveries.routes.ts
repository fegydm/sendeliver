import { Router, Request as ExpressRequest, Response, NextFunction } from 'express';
import pkg from 'pg';

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
interface TypedRequest<T> extends ExpressRequest {
  body: T;
}

// Middleware to verify API key from request header
const authMiddleware = (req: ExpressRequest, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== process.env.DELIVERY_API_KEY) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
};

// Route handler for inserting external deliveries
router.post(
  '/import-delivery',
  authMiddleware,
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

      res.status(201).json({
        status: 'OK',
        message: `✅ External delivery with ID_PP ${id_pp} was successfully recorded.`,
        data: result.rows[0]
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
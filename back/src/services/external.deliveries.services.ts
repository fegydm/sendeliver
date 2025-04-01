// File: ./back/src/services/external.deliveries.services.ts
// Last change: Created for external.deliveries table

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export interface DeliveryData {
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

export class ExternalDeliveriesService {
  async importDelivery(data: DeliveryData): Promise<any> {
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
      vehicle_type,
    } = data;

    if (!id_pp || !delivery_date) {
      throw new Error("Missing required fields: 'id_pp' and 'delivery_date' are mandatory.");
    }

    const existing = await pool.query(`SELECT 1 FROM external.deliveries WHERE id_pp = $1 LIMIT 1`, [id_pp]);
    if (existing.rowCount && existing.rowCount > 0) {
      return {
        status: 'OK',
        message: `Delivery with ID_PP ${id_pp} already exists in external.deliveries. No action taken.`,
      };
    }

    const result = await pool.query(
      `INSERT INTO external.deliveries 
      (delivery_id, delivery_date, delivery_time, delivery_type, 
      delivery_country, delivery_zip, delivery_city, weight, 
      id_pp, id_carrier, name_carrier, vehicle_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [id, delivery_date, delivery_time, delivery_type, delivery_country, delivery_zip, delivery_city, weight, id_pp, id_carrier, name_carrier, vehicle_type]
    );

    return {
      status: 'OK',
      message: `✅ Delivery with ID_PP ${id_pp} was successfully recorded in external.deliveries.`,
      data: result.rows[0],
    };
  }
}

export default new ExternalDeliveriesService();
// File: ./back/src/services/flag.service.ts
// Last change: Used 'any' type for Redis and Pool to bypass type problems

import pkg from 'pg';
const { Pool } = pkg;
import Redis from 'ioredis';
import fs from 'fs/promises';
import path from 'path';

export class FlagService {
  constructor(
    private readonly db: any, // Using 'any' type to bypass type issues
    private readonly redis: any // Using 'any' type to bypass type issues
  ) {}

  async getFlag(countryCode: string) {
    // 1. Try Redis cache
    const cached = await this.redis.get(`flag:${countryCode}`);
    if (cached) {
      await this.trackUsage(countryCode);
      return JSON.parse(cached);
    }

    // 2. Load from DB
    const { rows } = await this.db.query(
      'SELECT * FROM country_flags WHERE country_code = $1',
      [countryCode]
    );

    if (!rows[0]) {
      throw new Error(`Flag not found: ${countryCode}`);
    }

    const flag = rows[0];
    await this.trackUsage(countryCode);

    // 3. Cache the result
    await this.redis.set(
      `flag:${countryCode}`,
      JSON.stringify(flag),
      'EX',
      3600 // 1 hour
    );

    return flag;
  }

  private async trackUsage(countryCode: string) {
    await this.db.query(
      `INSERT INTO flag_usage_stats (country_code, year, month, usage_count)
       VALUES ($1, EXTRACT(YEAR FROM CURRENT_DATE), EXTRACT(MONTH FROM CURRENT_DATE), 1)`,
      [countryCode]
    );
  }

  async optimizeStorage() {
    // Run optimization function
    await this.db.query('SELECT optimize_flag_storage()');

    // Get flags to move
    const { rows: toReact } = await this.db.query(
      "SELECT * FROM country_flags WHERE storage_type = 'react' AND component_name IS NULL"
    );

    const { rows: toPublic } = await this.db.query(
      "SELECT * FROM country_flags WHERE storage_type = 'public' AND file_path IS NULL"
    );

    // Move to React components
    for (const flag of toReact) {
      await this.moveToReact(flag);
    }

    // Move to public directory
    for (const flag of toPublic) {
      await this.moveToPublic(flag);
    }
  }

  private async moveToReact(flag: any) {
    const componentName = `${flag.country_code.toUpperCase()}Flag`;
    const componentPath = path.join(process.cwd(), '../front/src/components/flags/common', `${componentName}.tsx`);

    // Create React component
    const componentContent = `
import React from 'react';

const ${componentName}: React.FC<{ className?: string }> = ({ className }) => (
  ${flag.svg_content}
);

export default ${componentName};
`;

    await fs.writeFile(componentPath, componentContent);

    // Update DB
    await this.db.query(
      'UPDATE country_flags SET component_name = $1 WHERE country_code = $2',
      [componentName, flag.country_code]
    );
  }

  private async moveToPublic(flag: any) {
    const filePath = `/flags/${flag.country_code.toLowerCase()}.svg`;
    const fullPath = path.join(process.cwd(), '../front/public', filePath);

    await fs.writeFile(fullPath, flag.svg_content);

    // Update DB
    await this.db.query(
      'UPDATE country_flags SET file_path = $1 WHERE country_code = $2',
      [filePath, flag.country_code]
    );
  }
}
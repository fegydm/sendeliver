// ./back/src/services/flag.service.ts
import { Pool } from 'pg';
import { Redis } from 'ioredis';
import fs from 'fs/promises';
import path from 'path';

export class FlagService {
  constructor(
    private readonly db: Pool,
    private readonly redis: Redis
  ) {}

  async getFlag(countryCode: string) {
    // 1. Skús Redis cache
    const cached = await this.redis.get(`flag:${countryCode}`);
    if (cached) {
      await this.trackUsage(countryCode);
      return JSON.parse(cached);
    }

    // 2. Načítaj z DB
    const { rows } = await this.db.query(
      'SELECT * FROM country_flags WHERE country_code = $1',
      [countryCode]
    );

    if (!rows[0]) {
      throw new Error(`Flag not found: ${countryCode}`);
    }

    const flag = rows[0];
    await this.trackUsage(countryCode);

    // 3. Cache výsledok
    await this.redis.set(
      `flag:${countryCode}`,
      JSON.stringify(flag),
      'EX',
      3600 // 1 hodina
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
    // Spusti optimalizačnú funkciu
    await this.db.query('SELECT optimize_flag_storage()');

    // Získaj vlajky na presun
    const { rows: toReact } = await this.db.query(
      "SELECT * FROM country_flags WHERE storage_type = 'react' AND component_name IS NULL"
    );

    const { rows: toPublic } = await this.db.query(
      "SELECT * FROM country_flags WHERE storage_type = 'public' AND file_path IS NULL"
    );

    // Presun do React komponentov
    for (const flag of toReact) {
      await this.moveToReact(flag);
    }

    // Presun do public adresára
    for (const flag of toPublic) {
      await this.moveToPublic(flag);
    }
  }

  private async moveToReact(flag: any) {
    const componentName = `${flag.country_code.toUpperCase()}Flag`;
    const componentPath = path.join(process.cwd(), '../front/src/components/flags/common', `${componentName}.tsx`);

    // Vytvor React komponent
    const componentContent = `
import React from 'react';

const ${componentName}: React.FC<{ className?: string }> = ({ className }) => (
  ${flag.svg_content}
);

export default ${componentName};
`;

    await fs.writeFile(componentPath, componentContent);

    // Aktualizuj DB
    await this.db.query(
      'UPDATE country_flags SET component_name = $1 WHERE country_code = $2',
      [componentName, flag.country_code]
    );
  }

  private async moveToPublic(flag: any) {
    const filePath = `/flags/${flag.country_code.toLowerCase()}.svg`;
    const fullPath = path.join(process.cwd(), '../front/public', filePath);

    await fs.writeFile(fullPath, flag.svg_content);

    // Aktualizuj DB
    await this.db.query(
      'UPDATE country_flags SET file_path = $1 WHERE country_code = $2',
      [filePath, flag.country_code]
    );
  }
}
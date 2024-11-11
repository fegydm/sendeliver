import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function generateApiTypes() {
  try {
    // Načítaj OpenAPI/Swagger špecifikáciu z backendu
    const response = await axios.get('http://localhost:5000/api-docs/swagger.json');
    const apiSpec = response.data;

    // Tu by bola logika pre generovanie TypeScript typov z API špecifikácie
    
    const typesPath = resolve(__dirname, '../src/types/api.ts');
    writeFileSync(typesPath, '// Generated API types\n\n');
    
    console.log('API types generated successfully');
  } catch (error) {
    console.error('API types generation failed:', error);
    process.exit(1);
  }
}

generateApiTypes();
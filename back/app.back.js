// ./back/app.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';

// Inicializácia environmentálnych premenných
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Základné nastavenia
app.use(express.json());

// Konfigurácia CORS s povolenými doménami
const corsOptions = {
    origin: process.env.ALLOWED_ORIGIN || 'https://tvoja-domena.com', // povolená doména, nastaviteľná cez .env
    methods: 'GET,POST,PUT,DELETE', // Definuj len potrebné HTTP metódy
};
app.use(cors(corsOptions));

// API endpointy
app.use('/api', apiRoutes); // Využitie nového súboru s cestami

// Serve React aplikáciu
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../front/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../front/build/index.html'));
    });
}

export default app;

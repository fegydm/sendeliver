// File: back/src/configs/prisma.config.ts

import { PrismaClient } from '@prisma/client';

// Vytvorí jednu, zdieľanú inštanciu Prisma klienta
export const prisma = new PrismaClient();
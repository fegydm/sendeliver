// File: back/src/utils/password.utils.ts
import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

// Prevedieme callback verziu scrypt na Promise verziu pre jednoduchšie použitie s async/await
const scryptAsync = promisify(scrypt);

/**
 * Hashuje heslo pomocou scrypt algoritmu.
 * @param password Heslo na zahashovanie.
 * @returns Reťazec obsahujúci soľ a hash, oddelené dvojbodkou.
 */
export async function hashPassword(password: string): Promise<string> {
  // 1. Vygenerujeme náhodnú soľ
  const salt = randomBytes(16).toString('hex');

  // 2. Zahashujeme heslo pomocou soli (64 je dĺžka výsledného hashu v bajtoch)
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;

  // 3. Spojíme soľ a hash dokopy a uložíme do databázy ako jeden reťazec
  return `${salt}:${hash.toString('hex')}`;
}

/**
 * Overuje, či sa dodané heslo zhoduje s uloženým hashom.
 * @param storedPasswordHash Uložený hash zo databázy (formát: 'soľ:hash').
 * @param suppliedPassword Heslo dodané používateľom.
 * @returns True, ak sa heslá zhodujú, inak false.
 */
export async function verifyPassword(storedPasswordHash: string, suppliedPassword: string): Promise<boolean> {
  // 1. Rozdelíme uložený reťazec na soľ a pôvodný hash
  const [salt, key] = storedPasswordHash.split(':');
  if (!salt || !key) {
    return false; // Neplatný formát hashu
  }
  const keyBuffer = Buffer.from(key, 'hex');

  // 2. Zahashujeme dodané heslo s použitím pôvodnej soli
  const hashToCompare = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;

  // 3. Bezpečne porovnáme oba hashe, aby sme predišli "timing attacks"
  // Najprv skontrolujeme dĺžku, potom obsah
  if (keyBuffer.length !== hashToCompare.length) {
    return false;
  }

  return timingSafeEqual(keyBuffer, hashToCompare);
}
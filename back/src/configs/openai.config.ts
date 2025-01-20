// File: ./back/src/configs/openai.config.ts
// Last change: Improved type safety and clarified AI configuration

import OpenAI from "openai";
import dotenv from "dotenv";

// Načítanie premenných z .env súboru
dotenv.config();

// Rozšírenie typu pre ProcessEnv, aby bolo explicitné, že potrebujeme OPENAI_API_KEY
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OPENAI_API_KEY: string;
    }
  }
}

// Validácia existencie API kľúča v prostredí
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Environment variable OPENAI_API_KEY is not defined");
}

// Inštancia OpenAI API klienta s načítaným kľúčom
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Konfigurácia OpenAI API
export const AI_CONFIG = {
  // Model používaný na komunikáciu
  model: "gpt-4",
  
  // Parametre ovplyvňujúce odpoveď modelu
  temperature: 0.7,
  max_tokens: 500,

  // Formát odpovede (výhradne JSON)
  response_format: { type: "json_object" } as const,

  /**
   * Dynamický systémový prompt na základe typu používateľa a jazyka.
   * 
   * @param type - Typ požiadavky: "sender" alebo "hauler"
   * @param language - Jazyk, v ktorom má AI odpovedať (predvolený: "sk")
   * @returns Dynamicky generovaný prompt pre OpenAI
   */
  getSystemPrompt: (
    type: "sender" | "hauler",
    language: string = "sk"
  ): string => {
    const basePrompt =
      language === "sk"
        ? `Si logistický AI asistent.`
        : `You are a logistics AI assistant.`;

    // Generovanie promptu podľa typu
    return type === "sender"
      ? `${basePrompt} Pomáhaš odosielateľom analyzovať ich požiadavky na prepravu.`
      : `${basePrompt} Pomáhaš prepravcom nájsť vhodné zákazky.`;
  },
};

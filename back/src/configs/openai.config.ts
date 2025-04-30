// File: ./back/src/configs/openai.config.ts

import { config as loadEnv } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

// Determine __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the .env file from the monorepo root (3 levels up)
loadEnv({ path: resolve(__dirname, "../../../.env") });

// Extend ProcessEnv interface to include our key
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OPENAI_API_KEY: string;
    }
  }
}

// Debug: skrátený výpis pre overenie načítania
console.log("Loaded API key:", process.env.OPENAI_API_KEY?.substring(0, 5) + "…");

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Environment variable OPENAI_API_KEY is not defined");
}

// Instantiate the OpenAI client with the loaded key
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Common AI configuration settings
export const AI_CONFIG = {
  model: "gpt-4",
  temperature: 0.7,
  max_tokens: 500,
  response_format: { type: "json_object" } as const,
  /**
   * Returns a system prompt tailored for either senders or haulers
   * @param type  "sender" or "hauler"
   * @param language  "sk" (Slovak) or other (English)
   */
  getSystemPrompt: (
    type: "sender" | "hauler",
    language: string = "sk"
  ): string => {
    const basePrompt =
      language === "sk"
        ? `Si logistický AI asistent.`
        : `You are a logistics AI assistant.`;

    if (type === "sender") {
      return `${basePrompt} Pomáhaš odosielateľom analyzovať ich požiadavky na prepravu.`;
    } else {
      return `${basePrompt} Pomáhaš prepravcom nájsť vhodné zákazky.`;
    }
  },
};

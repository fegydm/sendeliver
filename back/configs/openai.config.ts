// ./back/configs/openai.config.ts
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// Správna deklarácia pre ProcessEnv
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OPENAI_API_KEY: string;
    }
  }
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not defined in environment variables");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const AI_CONFIG = {
  model: "gpt-4-turbo-preview",
  temperature: 0.7,
  max_tokens: 500,
  response_format: { type: "json_object" } as const,

  // Typ pre 'type' parameter (sender alebo carrier)
  getSystemPrompt: (
    type: "sender" | "carrier",
    language: string = "sk"
  ): string => {
    const basePrompt =
      language === "sk"
        ? `Si logistický AI asistent.`
        : `You are a logistics AI assistant.`;

    return type === "sender"
      ? `${basePrompt} Pomáhaš odosielateľom analyzovať ich požiadavky na prepravu.`
      : `${basePrompt} Pomáhaš prepravcom nájsť vhodné zákazky.`;
  },
};

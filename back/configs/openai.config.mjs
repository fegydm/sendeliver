// ./back/configs/openai.config.mjs
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

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
  response_format: { type: "json_object" },

  getSystemPrompt: (type, language = "sk") => {
    const basePrompt =
      language === "sk"
        ? `Si logistický AI asistent.`
        : `You are a logistics AI assistant.`;

    return type === "sender"
      ? `${basePrompt} Pomáhaš odosielateľom analyzovať ich požiadavky na prepravu.`
      : `${basePrompt} Pomáhaš prepravcom nájsť vhodné zákazky.`;
  },
};

// ./back/configs/openai.config.ts
import OpenAI from 'openai';
import { config } from 'dotenv';

config();

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not defined in environment variables');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Konfigurácia pre AI asistenta
export const AI_CONFIG = {
  model: 'gpt-4-turbo-preview',
  temperature: 0.7,
  max_tokens: 500,
  // Systémový prompt pre špecifické použitie v preprave
  systemPrompt: `You are a logistics AI assistant. Your task is to:
  1. Extract shipping details from user messages
  2. Identify: pickup location, delivery location, weight, number of pallets, and times
  3. Return data in a structured format
  4. Respond in the same language as the user's message
  Keep responses focused on transportation logistics.`
};
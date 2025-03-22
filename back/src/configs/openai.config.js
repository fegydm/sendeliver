"use strict";
// File: ./back/src/configs/openai.config.ts
// Last change: Improved type safety and clarified AI configuration
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI_CONFIG = exports.openai = void 0;
var openai_1 = require("openai");
var dotenv_1 = require("dotenv");
// Načítanie premenných z .env súboru
dotenv_1.default.config();
// Validácia existencie API kľúča v prostredí
if (!process.env.OPENAI_API_KEY) {
    throw new Error("Environment variable OPENAI_API_KEY is not defined");
}
// Inštancia OpenAI API klienta s načítaným kľúčom
exports.openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
// Konfigurácia OpenAI API
exports.AI_CONFIG = {
    // Model používaný na komunikáciu
    model: "gpt-4",
    // Parametre ovplyvňujúce odpoveď modelu
    temperature: 0.7,
    max_tokens: 500,
    // Formát odpovede (výhradne JSON)
    response_format: { type: "json_object" },
    /**
     * Dynamický systémový prompt na základe typu používateľa a jazyka.
     *
     * @param type - Typ požiadavky: "sender" alebo "hauler"
     * @param language - Jazyk, v ktorom má AI odpovedať (predvolený: "sk")
     * @returns Dynamicky generovaný prompt pre OpenAI
     */
    getSystemPrompt: function (type, language) {
        if (language === void 0) { language = "sk"; }
        var basePrompt = language === "sk"
            ? "Si logistick\u00FD AI asistent."
            : "You are a logistics AI assistant.";
        // Generovanie promptu podľa typu
        return type === "sender"
            ? "".concat(basePrompt, " Pom\u00E1ha\u0161 odosielate\u013Eom analyzova\u0165 ich po\u017Eiadavky na prepravu.")
            : "".concat(basePrompt, " Pom\u00E1ha\u0161 prepravcom n\u00E1js\u0165 vhodn\u00E9 z\u00E1kazky.");
    },
};

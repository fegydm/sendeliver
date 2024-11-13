// ./back/routes/ai.route.mjs
import express from "express";
import { openai, AI_CONFIG } from "../configs/openai.config.mjs";

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { message, type, language = "sk" } = req.body;

    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      messages: [
        {
          role: "system",
          content: AI_CONFIG.getSystemPrompt(type, language),
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: AI_CONFIG.temperature,
      max_tokens: AI_CONFIG.max_tokens,
      response_format: AI_CONFIG.response_format,
      tools: [
        {
          type: "function",
          function: {
            name: "extractTransportData",
            description: "Extract transport data from the message",
            parameters: {
              type: "object",
              properties: {
                pickupLocation: {
                  type: "string",
                  description: "Location where the cargo needs to be picked up",
                },
                deliveryLocation: {
                  type: "string",
                  description: "Location where the cargo needs to be delivered",
                },
                pickupTime: {
                  type: "string",
                  description: "Time when the cargo needs to be picked up",
                },
                deliveryTime: {
                  type: "string",
                  description: "Time when the cargo needs to be delivered",
                },
                weight: {
                  type: "number",
                  description: "Weight of the cargo in kilograms",
                },
                palletCount: {
                  type: "number",
                  description: "Number of pallets",
                },
                additionalInfo: {
                  type: "object",
                  properties: {
                    vehicleType: { type: "string" },
                    requirements: {
                      type: "array",
                      items: { type: "string" },
                    },
                    price: { type: "number" },
                    distance: { type: "number" },
                    adr: { type: "boolean" },
                    loadingType: { type: "string" },
                    temperature: {
                      type: "object",
                      properties: {
                        min: { type: "number" },
                        max: { type: "number" },
                        required: { type: "boolean" },
                      },
                    },
                  },
                },
              },
              required: ["pickupLocation", "deliveryLocation"],
            },
          },
        },
      ],
      tool_choice: {
        type: "function",
        function: { name: "extractTransportData" },
      },
    });

    const toolCall = completion.choices[0].message.tool_calls?.[0];

    let structuredData = {};
    if (
      toolCall?.type === "function" &&
      toolCall.function.name === "extractTransportData"
    ) {
      structuredData = JSON.parse(toolCall.function.arguments);
    }

    const userMessage =
      language === "sk"
        ? `Na základe vášho popisu som identifikoval tieto detaily:

Miesto nakládky: ${structuredData.pickupLocation}
Miesto vykládky: ${structuredData.deliveryLocation}
${structuredData.pickupTime ? `Čas nakládky: ${structuredData.pickupTime}` : ""}
${structuredData.deliveryTime ? `Čas vykládky: ${structuredData.deliveryTime}` : ""}
${structuredData.weight ? `Hmotnosť: ${structuredData.weight} kg` : ""}
${structuredData.palletCount ? `Počet paliet: ${structuredData.palletCount}` : ""}

${
  structuredData.additionalInfo?.requirements?.length
    ? `Špeciálne požiadavky: ${structuredData.additionalInfo.requirements.join(", ")}`
    : ""
}
${structuredData.additionalInfo?.adr ? "ADR preprava: Áno" : ""}
${
  structuredData.additionalInfo?.temperature?.required
    ? `Teplotný režim: ${structuredData.additionalInfo.temperature.min}°C až ${structuredData.additionalInfo.temperature.max}°C`
    : ""
}

Údaje som automaticky vyplnil do formulára. Môžete ich upraviť podľa potreby. Potrebujete pomôcť s niečím ďalším?`
        : `Based on your description, I've identified these details:...`; // English version

    res.json({
      content: userMessage,
      data: structuredData,
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({
      message:
        language === "sk"
          ? "Prepáčte, vyskytla sa chyba pri spracovaní vašej požiadavky."
          : "Sorry, an error occurred while processing your request.",
    });
  }
});

export default router;

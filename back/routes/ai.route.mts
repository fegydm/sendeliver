// ./back/src/routes/ai.route.mts
import express from 'express';
import { Configuration, OpenAIApi } from 'openai';

const router = express.Router();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

router.post('/chat', async (req, res) => {
  try {
    const { message, type, language = 'sk' } = req.body;

    const systemMessage = type === 'sender'
      ? `Si asistent pre prepravu, ktorý pomáha odosielateľom zadať detaily zásielky. 
         Extrahuj všetky relevantné údaje o preprave. Komunikuj v jazyku: ${language}
         Zameraj sa na presné adresy a časy.`
      : `Si asistent pre prepravu, ktorý pomáha prepravcom nájsť vhodné zásielky. 
         Extrahuj všetky relevantné údaje o dostupnosti. Komunikuj v jazyku: ${language}`;

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: message }
      ],
      functions: [
        {
          name: "extractTransportData",
          description: "Extract transport data from the message",
          parameters: {
            type: "object",
            properties: {
              pickupLocation: {
                type: "string",
                description: "Location where the cargo needs to be picked up"
              },
              deliveryLocation: {
                type: "string",
                description: "Location where the cargo needs to be delivered"
              },
              pickupTime: {
                type: "string",
                description: "Time when the cargo needs to be picked up"
              },
              deliveryTime: {
                type: "string",
                description: "Time when the cargo needs to be delivered"
              },
              weight: {
                type: "number",
                description: "Weight of the cargo in kilograms"
              },
              palletCount: {
                type: "number",
                description: "Number of pallets"
              },
              additionalInfo: {
                type: "object",
                properties: {
                  vehicleType: { type: "string" },
                  requirements: {
                    type: "array",
                    items: { type: "string" }
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
                      required: { type: "boolean" }
                    }
                  }
                }
              }
            },
            required: ["pickupLocation", "deliveryLocation"]
          }
        }
      ],
      function_call: { name: "extractTransportData" }
    });

    const aiMessage = completion.data.choices[0].message;
    const functionCall = aiMessage?.function_call;

    let structuredData = {};
    if (functionCall && functionCall.arguments) {
      structuredData = JSON.parse(functionCall.arguments);
    }

    const userMessage = `Na základe vášho popisu som identifikoval tieto detaily:

Miesto nakládky: ${structuredData.pickupLocation}
Miesto vykládky: ${structuredData.deliveryLocation}
${structuredData.pickupTime ? `Čas nakládky: ${structuredData.pickupTime}` : ''}
${structuredData.deliveryTime ? `Čas vykládky: ${structuredData.deliveryTime}` : ''}
${structuredData.weight ? `Hmotnosť: ${structuredData.weight} kg` : ''}
${structuredData.palletCount ? `Počet paliet: ${structuredData.palletCount}` : ''}

${structuredData.additionalInfo?.requirements?.length ? 
  `Špeciálne požiadavky: ${structuredData.additionalInfo.requirements.join(', ')}` : ''}
${structuredData.additionalInfo?.adr ? 'ADR preprava: Áno' : ''}
${structuredData.additionalInfo?.temperature?.required ? 
  `Teplotný režim: ${structuredData.additionalInfo.temperature.min}°C až ${structuredData.additionalInfo.temperature.max}°C` : ''}

Údaje som automaticky vyplnil do formulára. Môžete ich upraviť podľa potreby. Potrebujete pomôcť s niečím ďalším?`;

    res.json({
      content: userMessage,
      data: structuredData
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ 
      message: 'Prepáčte, vyskytla sa chyba pri spracovaní vašej požiadavky.' 
    });
  }
});

export default router;
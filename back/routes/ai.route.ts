// ./back/routes/ai.route.ts
import express from 'express';
import { aiService } from '../services/ai.service';

const router = express.Router();

router.post('/process', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ 
        error: 'Message is required' 
      });
    }

    const result = await aiService.processUserMessage(message);

    res.json(result);
  } catch (error) {
    console.error('Error in AI route:', error);
    res.status(500).json({ 
      error: 'Failed to process message' 
    });
  }
});

export default router;
// ./back/app.back.js
import express from 'express';

const router = express.Router();

// Define your API routes here
router.get('/test', (req, res) => {
    res.json({ message: 'API is working' });
});

export default router;
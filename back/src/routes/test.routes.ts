import express from 'express';

const router = express.Router();

// Simple async handler without type annotations
const asyncHandler = (fn: any) => {
  return async (req: any, res: any) => {
    try {
      await fn(req, res);
    } catch (error: any) {
      res.status(500).json({ error: 'fail', message: error.message });
    }
  };
};

router.get(
  '/test',
  asyncHandler(async (req: any, res: { json: (arg0: { success: boolean; }) => void; }) => {
    res.json({ success: true });
  })
);

export default router;
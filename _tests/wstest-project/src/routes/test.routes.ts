import express from 'express';
import type { Request, Response } from 'express';

const router = express.Router();

const asyncHandler = <TRequest extends Request, TResponse extends Response>(
  fn: (req: TRequest, res: TResponse) => Promise<any>
) => {
  return async (req: TRequest, res: TResponse) => {
    try {
      await fn(req, res);
    } catch (error: any) {
      res.status(500).json({ error: 'fail', message: error.message });
    }
  };
};

router.get(
  '/test',
  asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true });
  })
);

export default router;

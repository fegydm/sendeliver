import { Request, Response, NextFunction } from "express";

// Ak req, res a next nie sú využité, môžeme ich jednoducho nahradiť podčiarkovníkom
export const errorHandler = (
  err: Error,
  _req: Request, // predpokladám, že 'req' nevyužívate
  res: Response,
  next: NextFunction
) => {
  console.error("API Error:", err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
};

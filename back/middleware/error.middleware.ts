import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("API Error:", err);
  
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {})
  });
};
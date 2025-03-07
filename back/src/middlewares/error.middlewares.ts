// File: src/middlewares/error.middlewares.ts
// Last change: Added explicit type annotations to all parameters to satisfy noImplicitAny

/**
 * Express error handler middleware with explicit type annotations
 */
export const errorHandler = (
  err: Error,
  _req: any,
  res: any,
  next: any
): void => {
  console.error("API Error:", err);

  // If headers were already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Send error response with stack trace in development
  res.status(500).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
};
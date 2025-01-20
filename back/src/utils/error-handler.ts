// File: src/utils/error-handler.ts
// Last change: Added custom error handling for AI service

export class AIServiceError extends Error {
    constructor(message: string, public readonly details?: unknown) {
      super(message);
      this.name = 'AIServiceError';
    }
  }
  
  interface ErrorResponse {
    status: number;
    body: {
      message: string;
      error: string;
      details?: unknown;
    };
  }
  
  export const handleAIError = (error: unknown): ErrorResponse => {
    if (error instanceof AIServiceError) {
      return {
        status: 500,
        body: {
          message: "AI Service Error",
          error: error.message,
          details: error.details
        }
      };
    }
    
    return {
      status: 500,
      body: {
        message: "Unknown Error",
        error: String(error)
      }
    };
  };
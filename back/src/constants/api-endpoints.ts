// back/src/constants/api-endpoints.ts
export const API_ENDPOINTS = {
  AI: {
    CHAT: "/api/ai/chat",
  },
  TRANSPORT: {
    CREATE: "/api/transport",
    LIST: "/api/transport/list",
    DETAIL: (id: string) => `/api/transport/${id}`,
    UPDATE: (id: string) => `/api/transport/${id}`,
    DELETE: (id: string) => `/api/transport/${id}`,
  },
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
  },
} as const;

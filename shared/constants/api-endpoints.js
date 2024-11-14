// shared/constants/api-endpoints.ts
export const API_ENDPOINTS = {
    AI: {
        CHAT: "/api/ai/chat",
    },
    TRANSPORT: {
        CREATE: "/api/transport",
        LIST: "/api/transport/list",
        DETAIL: (id) => `/api/transport/${id}`,
        UPDATE: (id) => `/api/transport/${id}`,
        DELETE: (id) => `/api/transport/${id}`,
    },
    AUTH: {
        LOGIN: "/api/auth/login",
        REGISTER: "/api/auth/register",
        LOGOUT: "/api/auth/logout",
        REFRESH: "/api/auth/refresh",
    },
};

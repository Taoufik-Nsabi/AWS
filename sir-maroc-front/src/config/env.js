const gatewayBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_GATEWAY_URL ||
  "http://localhost:8080";

export const API_BASE_URL = gatewayBaseUrl.replace(/\/+$/, "");
export const AUTH_API_URL =
  import.meta.env.VITE_AUTH_API_URL || `${API_BASE_URL}/api/auth`;
export const COMMUNITY_CHAT_API_URL =
  import.meta.env.VITE_COMMUNITY_CHAT_API_URL ||
  `${API_BASE_URL}/api/community/api/v1/chat`;

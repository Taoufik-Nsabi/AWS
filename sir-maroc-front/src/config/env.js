const trimTrailingSlash = (value) => (value || "").replace(/\/+$/, "");

const joinUrl = (baseUrl, path = "") => {
  if (!path) {
    return baseUrl;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};

const gatewayBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_GATEWAY_URL ||
  "http://localhost:8080";

const tourismAssetBaseUrl =
  import.meta.env.VITE_TOURISM_ASSET_BASE_URL ||
  import.meta.env.VITE_SYMFONY_PUBLIC_BASE_URL ||
  "http://localhost:8081";

export const API_BASE_URL = trimTrailingSlash(gatewayBaseUrl);
export const TOURISM_ASSET_BASE_URL = trimTrailingSlash(tourismAssetBaseUrl);
export const AUTH_API_URL =
  import.meta.env.VITE_AUTH_API_URL || `${API_BASE_URL}/api/auth`;
export const COMMUNITY_CHAT_API_URL =
  import.meta.env.VITE_COMMUNITY_CHAT_API_URL ||
  `${API_BASE_URL}/api/community/api/v1/chat`;

export const buildApiUrl = (path = "") => joinUrl(API_BASE_URL, path);
export const buildTourismAssetUrl = (path = "") =>
  joinUrl(TOURISM_ASSET_BASE_URL, path);

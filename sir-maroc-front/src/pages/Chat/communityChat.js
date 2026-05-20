import { API_BASE_URL, COMMUNITY_CHAT_API_URL } from "../../config/env";
import { getToken } from "../../utils/auth";

async function readErrorMessage(response) {
  try {
    const payload = await response.json();
    if (payload?.message) {
      return payload.message;
    }
  } catch {
    return null;
  }

  return null;
}

function buildHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function buildAuthHeaders(extraHeaders = {}) {
  const token = getToken();

  if (!token) {
    throw buildHttpError(401, "Vous devez etre connecte pour acceder au chat.");
  }

  return {
    ...extraHeaders,
    Authorization: `Bearer ${token}`,
  };
}

export function resolveCommunityAssetUrl(assetPath) {
  if (!assetPath) {
    return "";
  }

  if (/^https?:\/\//i.test(assetPath)) {
    return assetPath;
  }

  return `${API_BASE_URL}${assetPath.startsWith("/") ? assetPath : `/${assetPath}`}`;
}

export async function fetchCommunityAssetBlobUrl(assetPath) {
  const response = await fetch(resolveCommunityAssetUrl(assetPath), {
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await readErrorMessage(response);
    throw buildHttpError(
      response.status,
      errorMessage || "Impossible de charger l'image partagee."
    );
  }

  const imageBlob = await response.blob();
  return URL.createObjectURL(imageBlob);
}

export async function fetchChatMessages(room, limit = 60) {
  const params = new URLSearchParams({
    room,
    limit: String(limit),
  });

  const response = await fetch(
    `${COMMUNITY_CHAT_API_URL}/messages?${params.toString()}`,
    {
      headers: buildAuthHeaders(),
    }
  );

  if (!response.ok) {
    const errorMessage = await readErrorMessage(response);
    throw buildHttpError(
      response.status,
      errorMessage || "Impossible de charger les messages."
    );
  }

  return response.json();
}

export async function fetchChatRoomsOverview() {
  const response = await fetch(`${COMMUNITY_CHAT_API_URL}/rooms`, {
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await readErrorMessage(response);
    throw buildHttpError(
      response.status,
      errorMessage || "Impossible de charger les salons."
    );
  }

  return response.json();
}

export function connectToChatRoom(room, handlers = {}) {
  const token = getToken();
  if (!token) {
    throw buildHttpError(401, "Vous devez etre connecte pour acceder au chat.");
  }

  const socketUrl = buildSocketUrl(room, token);
  const socket = new WebSocket(socketUrl);

  socket.addEventListener("open", () => {
    handlers.onOpen?.();
  });

  socket.addEventListener("message", (event) => {
    try {
      const payload = JSON.parse(event.data);
      if (payload?.type === "message" && payload.payload) {
        handlers.onMessage?.(payload.payload);
        return;
      }

      if (payload?.type === "error" && payload.message) {
        handlers.onError?.(payload.message);
      }
    } catch {
      handlers.onError?.("Le flux temps reel a retourne une reponse invalide.");
    }
  });

  socket.addEventListener("error", () => {
    handlers.onError?.("La connexion temps reel du salon a rencontre un probleme.");
  });

  socket.addEventListener("close", () => {
    handlers.onClose?.();
  });

  return socket;
}

export function sendSocketChatMessage(socket, content) {
  const trimmedContent = content.trim();
  if (!trimmedContent) {
    return;
  }

  if (!socket || socket.readyState !== WebSocket.OPEN) {
    throw buildHttpError(503, "Le salon n'est pas encore connecte en temps reel.");
  }

  socket.send(JSON.stringify({ content: trimmedContent }));
}

export async function sendChatMessage(room, content, imageFile) {
  const trimmedContent = content.trim();
  const hasImage = Boolean(imageFile);

  const response = hasImage
    ? await fetch(`${COMMUNITY_CHAT_API_URL}/messages`, {
        method: "POST",
        headers: buildAuthHeaders(),
        body: buildMultipartPayload(room, trimmedContent, imageFile),
      })
    : await fetch(`${COMMUNITY_CHAT_API_URL}/messages`, {
        method: "POST",
        headers: buildAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ room, content: trimmedContent }),
      });

  if (!response.ok) {
    const errorMessage = await readErrorMessage(response);
    throw buildHttpError(
      response.status,
      errorMessage || "Impossible d'envoyer le message."
    );
  }

  return response.json();
}

function buildSocketUrl(room, token) {
  const normalizedBaseUrl = API_BASE_URL.replace(/\/+$/, "");
  const baseUrl = normalizedBaseUrl.startsWith("https://")
    ? normalizedBaseUrl.replace("https://", "wss://")
    : normalizedBaseUrl.replace("http://", "ws://");

  const params = new URLSearchParams({
    room,
    token,
  });

  return `${baseUrl}/api/community/ws/?${params.toString()}`;
}

function buildMultipartPayload(room, content, imageFile) {
  const formData = new FormData();
  formData.append("room", room);

  if (content) {
    formData.append("content", content);
  }

  if (imageFile) {
    formData.append("image", imageFile);
  }

  return formData;
}

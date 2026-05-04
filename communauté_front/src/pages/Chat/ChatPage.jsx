import React, { startTransition, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  connectToChatRoom,
  fetchCommunityAssetBlobUrl,
  fetchChatMessages,
  fetchChatRoomsOverview,
  sendSocketChatMessage,
  sendChatMessage,
} from "../../lib/communityChat";
import { getCurrentUser, logout } from "../../utils/auth";
import "../../styles/Chat/ChatPage.css";

const MESSAGE_LIMIT = 80;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const SOCKET_RECONNECT_DELAY_MS = 3000;
const IMAGE_URL_PATTERN = /https?:\/\/[^\s)]+/gi;
const MARKDOWN_IMAGE_PATTERN = /!\[[^\]]*]\((https?:\/\/[^)]+)\)/i;

const ROOM_CONFIG = [
  {
    id: "debates",
    badge: "01",
    tone: "green",
    tabLabel: "Debats",
    shortDescription: "Partagez vos opinions et experiences de voyage.",
    roomLabel: "Salon Debats & opinions",
    roomHeadline: "Debats & opinions",
    roomSubline: "Un espace pour partager vos idees et vos experiences.",
    emptyTitle: "Aucun debat n'est encore ouvert.",
    emptyText: "Lancez le premier sujet et laissez la communaute reagir.",
    placeholder: "Ecrivez votre point de vue,",
  },
  {
    id: "questions",
    badge: "02",
    tone: "gold",
    tabLabel: "Questions",
    shortDescription: "Posez vos questions et obtenez des reponses utiles.",
    roomLabel: "Salon Questions & reponses",
    roomHeadline: "Questions & reponses",
    roomSubline: "Demandez simplement ce dont vous avez besoin pour avancer.",
    emptyTitle: "Aucune question n'attend de reponse ici.",
    emptyText: "Posez la premiere question pour lancer l'entraide.",
    placeholder: "Posez votre question,",
  },
  {
    id: "fun",
    badge: "03",
    tone: "sand",
    tabLabel: "Fun",
    shortDescription: "Discutez librement et partagez de bons moments.",
    roomLabel: "Salon Fun & detente",
    roomHeadline: "Fun & detente",
    roomSubline: "Le salon le plus leger pour poster des souvenirs et des photos.",
    emptyTitle: "Le salon fun attend encore son premier message.",
    emptyText: "Partagez une image ou un message pour lancer l'ambiance.",
    placeholder: "Partagez un message ou une photo,",
  },
];

function formatTime(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatCount(value) {
  return new Intl.NumberFormat("fr-FR").format(value || 0);
}

function formatFileSize(bytes) {
  if (!bytes) {
    return "0 KB";
  }

  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function countUniqueParticipants(messages) {
  return new Set(
    messages
      .map((message) => (message.sender || "").toLowerCase())
      .filter(Boolean)
  ).size;
}

function buildLiveStatusLabel(status) {
  if (status === "connected") {
    return "Temps reel actif";
  }

  if (status === "connecting") {
    return "Connexion du salon...";
  }

  return "Temps reel indisponible";
}

function buildInitials(name) {
  return (name || "Voyageur")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function looksLikeImageUrl(url) {
  if (!url) {
    return false;
  }

  return (
    /\.(png|jpe?g|webp|avif|gif)(\?.*)?$/i.test(url) ||
    url.includes("images.unsplash.com") ||
    url.includes("images.pexels.com") ||
    url.includes("cloudinary.com")
  );
}

function parseMessageContent(content) {
  const rawContent = (content || "").trim();
  if (!rawContent) {
    return { text: "", imageUrl: "" };
  }

  const markdownImageMatch = rawContent.match(MARKDOWN_IMAGE_PATTERN);
  if (markdownImageMatch?.[1]) {
    return {
      text: rawContent.replace(markdownImageMatch[0], "").replace(/\s+/g, " ").trim(),
      imageUrl: markdownImageMatch[1],
    };
  }

  const urls = rawContent.match(IMAGE_URL_PATTERN) || [];
  const imageUrl = urls.find(looksLikeImageUrl) || "";

  if (!imageUrl) {
    return { text: rawContent, imageUrl: "" };
  }

  return {
    text: rawContent.replace(imageUrl, "").replace(/\s+/g, " ").trim(),
    imageUrl,
  };
}

function RoomIcon({ roomId }) {
  if (roomId === "questions") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 17.2a1.2 1.2 0 1 1 1.2-1.2a1.18 1.18 0 0 1-1.2 1.2Zm1.3-5.3v.4h-2.4v-.8c0-1.4.7-2.2 1.7-2.9c.9-.6 1.5-1.1 1.5-2.1a2 2 0 0 0-4 0H7.7a4.3 4.3 0 0 1 8.6 0c0 2-1.2 3-2.2 3.7c-.6.5-.8.8-.8 1.7Z" />
      </svg>
    );
  }

  if (roomId === "fun") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm-3 6.8a1.3 1.3 0 1 1-1.3 1.3A1.31 1.31 0 0 1 9 8.8Zm3 8.4a5.92 5.92 0 0 1-4.8-2.3l1.8-1.3A3.84 3.84 0 0 0 12 15a3.84 3.84 0 0 0 3-1.4l1.8 1.3A5.92 5.92 0 0 1 12 17.2Zm3-5.8a1.3 1.3 0 1 1 1.3-1.3a1.31 1.31 0 0 1-1.3 1.3Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3.5c5.2 0 9.5 3.5 9.5 7.9s-4.3 7.9-9.5 7.9a11.2 11.2 0 0 1-3-.4L4 21l1.7-4.1a7.2 7.2 0 0 1-3.2-5.5c0-4.4 4.3-7.9 9.5-7.9Zm0 2C8 5.5 4.5 8 4.5 11.4c0 1.7.9 3.2 2.6 4.4l.7.5l-.9 2l2.5-1.1l.5.1a9 9 0 0 0 2.1.3c4.1 0 7.5-2.5 7.5-5.9S16.1 5.5 12 5.5Zm-3.3 4.3h6.6v1.8H8.7Zm0 3.2H14v1.8H8.7Z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm6.9 9h-3.1a15.49 15.49 0 0 0-1.1-5A8 8 0 0 1 18.9 11ZM12 4.1c.9 1 1.9 3.3 2.2 6.9H9.8c.3-3.6 1.3-5.9 2.2-6.9ZM4.2 13h3.1a15.49 15.49 0 0 0 1.1 5A8 8 0 0 1 4.2 13Zm3.1-2H4.2a8 8 0 0 1 4.2-5a15.49 15.49 0 0 0-1.1 5Zm4.7 8.9c-.9-1-1.9-3.3-2.2-6.9h4.4c-.3 3.6-1.3 5.9-2.2 6.9Zm2.7-1.9a15.49 15.49 0 0 0 1.1-5h3.1a8 8 0 0 1-4.2 5Z" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 11a3.5 3.5 0 1 1 3.5-3.5A3.5 3.5 0 0 1 9 11Zm0-5a1.5 1.5 0 1 0 1.5 1.5A1.5 1.5 0 0 0 9 6Zm8 6a3 3 0 1 1 3-3a3 3 0 0 1-3 3Zm0-4a1 1 0 1 0 1 1a1 1 0 0 0-1-1ZM2 18.7C2 16.2 4.6 14 8.1 14h1.8c3.5 0 6.1 2.2 6.1 4.7V20H2Zm12 0c-.3-1.4-2-2.7-4.1-2.7H8.1c-2.1 0-3.8 1.3-4.1 2.7Zm3.5-4.6c2.6 0 4.5 1.6 4.5 3.8V20h-4v-1.2h2v-.9c0-.9-.9-1.8-2.5-1.8h-1.2a4.87 4.87 0 0 0-.8-2Z" />
    </svg>
  );
}

function AttachmentIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.5 18.5a4 4 0 0 1 0-5.7l6.2-6.2a3.1 3.1 0 1 1 4.4 4.4l-7.1 7.1a2.2 2.2 0 1 1-3.1-3.1l6.2-6.2l1.4 1.4l-6.2 6.2a.2.2 0 1 0 .3.3l7.1-7.1a1.1 1.1 0 0 0-1.6-1.6l-6.2 6.2a2 2 0 0 0 2.8 2.8l6.2-6.2l1.4 1.4l-6.2 6.2a4 4 0 0 1-5.7 0Z" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.5 13.5a1.5 1.5 0 1 1 1.5-1.5a1.5 1.5 0 0 1-1.5 1.5Zm5.5 0a1.5 1.5 0 1 1 1.5-1.5a1.5 1.5 0 0 1-1.5 1.5Zm5.5 0A1.5 1.5 0 1 1 19 12a1.5 1.5 0 0 1-1.5 1.5Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m13.4 12l4.3-4.3l-1.4-1.4L12 10.6L7.7 6.3L6.3 7.7l4.3 4.3l-4.3 4.3l1.4 1.4l4.3-4.3l4.3 4.3l1.4-1.4Z" />
    </svg>
  );
}

function getRoomSummary(roomOverview, roomId) {
  return (
    roomOverview.rooms?.find((room) => room.room === roomId) || {
      room: roomId,
      messageCount: 0,
      participantCount: 0,
    }
  );
}

function ChatMessageImage({ assetPath }) {
  const [imageSource, setImageSource] = useState("");

  useEffect(() => {
    let active = true;
    let localObjectUrl = "";

    async function loadImage() {
      if (!assetPath) {
        setImageSource("");
        return;
      }

      if (/^https?:\/\//i.test(assetPath)) {
        setImageSource(assetPath);
        return;
      }

      try {
        localObjectUrl = await fetchCommunityAssetBlobUrl(assetPath);
        if (active) {
          setImageSource(localObjectUrl);
        }
      } catch {
        if (active) {
          setImageSource("");
        }
      }
    }

    loadImage();

    return () => {
      active = false;
      if (localObjectUrl) {
        URL.revokeObjectURL(localObjectUrl);
      }
    };
  }, [assetPath]);

  if (!assetPath) {
    return null;
  }

  return (
    <figure className="community-message__figure">
      {imageSource ? (
        <img src={imageSource} alt="Photo partagee dans la conversation" />
      ) : (
        <div className="community-message__figure-placeholder">
          Chargement de l'image...
        </div>
      )}
    </figure>
  );
}

export default function ChatPage() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [selectedRoomId, setSelectedRoomId] = useState("debates");
  const [messages, setMessages] = useState([]);
  const [roomOverview, setRoomOverview] = useState({
    rooms: [],
    totalParticipantCount: 0,
  });
  const [currentRoomStats, setCurrentRoomStats] = useState({
    participantCount: 0,
    messageCount: 0,
  });
  const [draft, setDraft] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [liveStatus, setLiveStatus] = useState("connecting");

  const reconnectTimerRef = useRef(null);
  const socketRef = useRef(null);
  const messagesRef = useRef([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const selectedRoom =
    ROOM_CONFIG.find((room) => room.id === selectedRoomId) || ROOM_CONFIG[0];
  const selectedRoomSummary = getRoomSummary(roomOverview, selectedRoomId);
  const lastMessageKey =
    messages.length === 0
      ? `empty-${selectedRoomId}`
      : `${messages[messages.length - 1].id}-${messages[messages.length - 1].sentAt}`;
  const trimmedDraftLength = draft.trim().length;

  function handleUnauthorized() {
    logout();
    navigate("/login", {
      replace: true,
      state: {
        from: "/chat",
        message: "Votre session a expire. Reconnectez-vous pour acceder au chat.",
      },
    });
  }

  function clearSelectedImage() {
    setSelectedImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function refreshRoomOverview() {
    try {
      const overview = await fetchChatRoomsOverview();
      startTransition(() => {
        setRoomOverview(overview || { rooms: [], totalParticipantCount: 0 });
      });
    } catch (requestError) {
      if (requestError?.status === 401) {
        handleUnauthorized();
      }
    }
  }

  async function loadChatData(showLoadingState) {
    try {
      if (showLoadingState) {
        setStatus("loading");
      }

      const [snapshot, overview] = await Promise.all([
        fetchChatMessages(selectedRoomId, MESSAGE_LIMIT),
        fetchChatRoomsOverview(),
      ]);

      startTransition(() => {
        setMessages(snapshot.messages || []);
        messagesRef.current = snapshot.messages || [];
        setCurrentRoomStats({
          participantCount: snapshot.participantCount || 0,
          messageCount: snapshot.messageCount || snapshot.messages?.length || 0,
        });
        setRoomOverview(overview || { rooms: [], totalParticipantCount: 0 });
      });
      setStatus("ready");
      setError("");
      return true;
    } catch (requestError) {
      if (requestError?.status === 401) {
        handleUnauthorized();
        return false;
      }

      setStatus("error");
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Le salon est temporairement indisponible."
      );
      return false;
    }
  }

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    let active = true;
    let intentionallyClosed = false;

    function clearReconnectTimer() {
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    }

    function scheduleReconnect() {
      if (!active || reconnectTimerRef.current) {
        return;
      }

      setLiveStatus("connecting");
      reconnectTimerRef.current = window.setTimeout(() => {
        reconnectTimerRef.current = null;
        void openSocket();
      }, SOCKET_RECONNECT_DELAY_MS);
    }

    async function openSocket() {
      if (!active) {
        return;
      }

      setLiveStatus("connecting");

      const socket = connectToChatRoom(selectedRoomId, {
        onOpen: () => {
          clearReconnectTimer();
          if (active) {
            setLiveStatus("connected");
            setError("");
          }
        },
        onMessage: (message) => {
          if (!active) {
            return;
          }

          if (messagesRef.current.some((item) => item.id === message.id)) {
            return;
          }

          const nextMessages = [...messagesRef.current, message];
          messagesRef.current = nextMessages;

          startTransition(() => {
            setMessages(nextMessages);
            setCurrentRoomStats({
              messageCount: nextMessages.length,
              participantCount: countUniqueParticipants(nextMessages),
            });
          });

          void refreshRoomOverview();
        },
        onError: (message) => {
          if (active) {
            setLiveStatus("error");
            setError(message);
          }
        },
        onClose: () => {
          if (active && !intentionallyClosed) {
            setLiveStatus("disconnected");
            scheduleReconnect();
          }
        },
      });
      socketRef.current = socket;
    }

    async function bootstrap() {
      const loaded = await loadChatData(true);
      if (!active || !loaded) {
        return;
      }

      await openSocket();
    }

    bootstrap();

    return () => {
      active = false;
      intentionallyClosed = true;
      clearReconnectTimer();
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [selectedRoomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lastMessageKey]);

  useEffect(() => {
    if (!selectedImageFile) {
      setPreviewUrl("");
      return undefined;
    }

    const localPreviewUrl = URL.createObjectURL(selectedImageFile);
    setPreviewUrl(localPreviewUrl);

    return () => {
      URL.revokeObjectURL(localPreviewUrl);
    };
  }, [selectedImageFile]);

  useEffect(() => {
    setDraft("");
    setError("");
    clearSelectedImage();
  }, [selectedRoomId]);

  function handleFileSelection(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Choisissez une image valide au format JPEG, PNG, WEBP, AVIF ou GIF.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setError("L'image depasse 8 MB. Choisissez un fichier plus leger.");
      event.target.value = "";
      return;
    }

    setSelectedImageFile(file);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!draft.trim() && !selectedImageFile) {
      return;
    }

    setSending(true);
    setError("");

    try {
      if (selectedImageFile) {
        await sendChatMessage(selectedRoomId, draft, selectedImageFile);
        setDraft("");
        clearSelectedImage();
        if (liveStatus !== "connected") {
          await loadChatData(false);
        }
        await refreshRoomOverview();
      } else {
        sendSocketChatMessage(socketRef.current, draft);
        setDraft("");
      }
    } catch (requestError) {
      if (requestError?.status === 401) {
        handleUnauthorized();
        return;
      }

      setStatus("error");
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Le message n'a pas pu etre envoye."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="chat-page">
      <section className="container community-layout">
        <aside className="community-sidebar">
          <div className="community-sidebar__header">
            <span className="community-sidebar__eyebrow">Salons</span>
          </div>

          <div className="community-sidebar__rooms" role="tablist" aria-label="Salons de la communaute">
            {ROOM_CONFIG.map((room) => {
              const summary = getRoomSummary(roomOverview, room.id);

              return (
                <button
                  type="button"
                  key={room.id}
                  className={`community-sidebar__room ${
                    room.id === selectedRoomId ? "community-sidebar__room--active" : ""
                  }`}
                  onClick={() => setSelectedRoomId(room.id)}
                >
                  <span className={`community-sidebar__icon community-sidebar__icon--${room.tone}`}>
                    <RoomIcon roomId={room.id} />
                  </span>

                  <span className="community-sidebar__copy">
                    <strong>{room.tabLabel}</strong>
                    <small>{room.shortDescription}</small>
                  </span>

                  <span className="community-sidebar__count">{formatCount(summary.messageCount)}</span>
                </button>
              );
            })}
          </div>

          <div className="community-sidebar__community">
            <span className="community-sidebar__community-icon">
              <GlobeIcon />
            </span>

            <div>
              <strong>Communaute</strong>
              <p>{formatCount(roomOverview.totalParticipantCount)} voyageurs en ligne</p>
            </div>
          </div>

          <div className="community-sidebar__welcome">
            <span className="community-sidebar__welcome-badge">Guide</span>
            <strong>Bienvenue dans la communaute</strong>
            <p>
              Soyez respectueux, bienveillant et ouverts aux nouvelles
              decouvertes.
            </p>
          </div>

          <div className="community-sidebar__silhouette" aria-hidden="true" />
        </aside>

        <section className="community-room">
          <header className="community-room__header">
            <div className="community-room__title">
              <span className="community-room__eyebrow">{selectedRoom.roomLabel}</span>
              <h1>{selectedRoom.roomHeadline}</h1>
              <p>{selectedRoom.roomSubline}</p>
            </div>

            <div className="community-room__header-actions">
              <span className={`community-room__live community-room__live--${liveStatus}`}>
                {buildLiveStatusLabel(liveStatus)}
              </span>

              <span className="community-room__participants">
                <PeopleIcon />
                {formatCount(
                  selectedRoomSummary.participantCount || currentRoomStats.participantCount
                )}{" "}
                participants
              </span>

              <button
                type="button"
                className="community-room__menu"
                aria-label="Options du salon"
              >
                <DotsIcon />
              </button>
            </div>
          </header>

          {error ? <div className="community-room__alert">{error}</div> : null}

          <div className="community-room__thread">
            {messages.length === 0 ? (
              <div className="community-room__empty">
                <h2>{selectedRoom.emptyTitle}</h2>
                <p>{selectedRoom.emptyText}</p>
              </div>
            ) : (
              messages.map((message) => {
                const senderName =
                  message.displayName ||
                  (message.sender ? message.sender.split("@")[0] : "Voyageur");
                const parsedMessage = parseMessageContent(message.content);
                const imageUrl = message.imageUrl || parsedMessage.imageUrl;
                const isMine =
                  currentUser.email &&
                  message.sender &&
                  message.sender.toLowerCase() === currentUser.email.toLowerCase();

                return (
                  <article
                    key={`${message.id}-${message.sentAt}`}
                    className={`community-message ${
                      imageUrl ? "community-message--media" : ""
                    } ${isMine ? "community-message--mine" : ""}`}
                  >
                    <div className={`community-message__avatar community-message__avatar--${selectedRoom.tone}`}>
                      {buildInitials(senderName)}
                    </div>

                    <div className="community-message__card">
                      <div className="community-message__meta">
                        <div className="community-message__identity">
                          <strong>{senderName}</strong>
                          {isMine ? <span className="community-message__self">Vous</span> : null}
                        </div>
                        <span>{formatTime(message.sentAt)}</span>
                      </div>

                      {parsedMessage.text ? <p>{parsedMessage.text}</p> : null}

                      {imageUrl ? (
                        <span className="community-message__media-badge">
                          {isMine ? "Votre photo partagee" : "Photo partagee"}
                        </span>
                      ) : null}

                      <ChatMessageImage assetPath={imageUrl} />
                    </div>
                  </article>
                );
              })
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className="community-composer" onSubmit={handleSubmit}>
            {selectedImageFile ? (
              <div className="community-composer__preview">
                {previewUrl ? (
                  <img src={previewUrl} alt="Apercu avant envoi" />
                ) : null}

                <div className="community-composer__preview-copy">
                  <strong>Image prete a etre partagee</strong>
                  <span>
                    {selectedImageFile.name} - {formatFileSize(selectedImageFile.size)}
                  </span>
                </div>

                <button
                  type="button"
                  className="community-composer__remove"
                  onClick={clearSelectedImage}
                  aria-label="Retirer l'image"
                >
                  <CloseIcon />
                </button>
              </div>
            ) : null}

            <div className="community-composer__row">
              <button
                type="button"
                className="community-composer__attach"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Partager une image"
              >
                <AttachmentIcon />
              </button>

              <input
                ref={fileInputRef}
                className="community-composer__file-input"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                onChange={handleFileSelection}
              />

              <label className="community-composer__field" htmlFor="chat-message">
                <input
                  id="chat-message"
                  maxLength={500}
                  placeholder={`${selectedRoom.placeholder} ${currentUser.displayName}...`}
                  type="text"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                />
                <span>{trimmedDraftLength}/500</span>
              </label>

              <button
                type="submit"
                className="community-composer__submit"
                disabled={
                  sending ||
                  (!draft.trim() && !selectedImageFile) ||
                  (!selectedImageFile && liveStatus !== "connected")
                }
              >
                {sending ? "Envoi..." : "Envoyer"}
              </button>
            </div>
          </form>
        </section>
      </section>
    </div>
  );
}

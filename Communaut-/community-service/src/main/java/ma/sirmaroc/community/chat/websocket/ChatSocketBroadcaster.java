package ma.sirmaroc.community.chat.websocket;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import ma.sirmaroc.community.chat.dto.ChatMessageResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
public class ChatSocketBroadcaster {

    private final ObjectMapper objectMapper;
    private final ConcurrentHashMap<String, Set<WebSocketSession>> roomSessions = new ConcurrentHashMap<>();

    public void register(String room, WebSocketSession session) {
        roomSessions.computeIfAbsent(room, ignored -> ConcurrentHashMap.newKeySet()).add(session);
    }

    public void unregister(String room, WebSocketSession session) {
        Set<WebSocketSession> sessions = roomSessions.get(room);
        if (sessions == null) {
            return;
        }

        sessions.remove(session);
        if (sessions.isEmpty()) {
            roomSessions.remove(room);
        }
    }

    public void broadcast(String room, ChatMessageResponse messageResponse) {
        broadcast(room, ChatSocketEvent.message(messageResponse));
    }

    public void sendError(WebSocketSession session, String message) {
        send(session, ChatSocketEvent.error(message));
    }

    private void broadcast(String room, ChatSocketEvent event) {
        Set<WebSocketSession> sessions = roomSessions.get(room);
        if (sessions == null || sessions.isEmpty()) {
            return;
        }

        sessions.forEach(session -> send(session, event));
    }

    private void send(WebSocketSession session, ChatSocketEvent event) {
        if (!session.isOpen()) {
            return;
        }

        try {
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(event)));
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Impossible de serialiser l'evenement du chat.", exception);
        } catch (IOException exception) {
            try {
                session.close(CloseStatus.SERVER_ERROR);
            } catch (IOException ignored) {
                // Ignore close failures after an IO error.
            }
        }
    }
}

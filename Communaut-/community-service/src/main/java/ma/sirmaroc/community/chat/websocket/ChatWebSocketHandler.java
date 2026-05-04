package ma.sirmaroc.community.chat.websocket;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import ma.sirmaroc.community.chat.dto.ChatMessageRequest;
import ma.sirmaroc.community.chat.dto.ChatMessageResponse;
import ma.sirmaroc.community.chat.service.ChatMessageService;
import ma.sirmaroc.community.chat.service.ChatUser;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
@RequiredArgsConstructor
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private static final String ROOM_ATTRIBUTE = "chatRoom";
    private static final String USER_ATTRIBUTE = "chatUser";

    private final ObjectMapper objectMapper;
    private final ChatMessageService chatMessageService;
    private final ChatSocketBroadcaster chatSocketBroadcaster;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String room = getRoom(session);
        chatSocketBroadcaster.register(room, session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        String room = getRoom(session);
        ChatUser chatUser = getChatUser(session);

        try {
            ChatSocketMessageRequest payload = objectMapper.readValue(
                    message.getPayload(),
                    ChatSocketMessageRequest.class
            );

            ChatMessageResponse response = chatMessageService.postMessage(
                    chatUser,
                    new ChatMessageRequest(room, payload.content())
            );
            chatSocketBroadcaster.broadcast(room, response);
        } catch (JsonProcessingException exception) {
            chatSocketBroadcaster.sendError(session, "Le message du socket est invalide.");
        } catch (IllegalArgumentException exception) {
            chatSocketBroadcaster.sendError(session, exception.getMessage());
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        chatSocketBroadcaster.unregister(getRoom(session), session);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        chatSocketBroadcaster.unregister(getRoom(session), session);
        if (session.isOpen()) {
            session.close(CloseStatus.SERVER_ERROR);
        }
    }

    private String getRoom(WebSocketSession session) {
        return (String) session.getAttributes().getOrDefault(ROOM_ATTRIBUTE, "debates");
    }

    private ChatUser getChatUser(WebSocketSession session) {
        return (ChatUser) session.getAttributes().get(USER_ATTRIBUTE);
    }
}

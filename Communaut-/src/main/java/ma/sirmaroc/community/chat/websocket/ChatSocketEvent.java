package ma.sirmaroc.community.chat.websocket;

import ma.sirmaroc.community.chat.dto.ChatMessageResponse;

public record ChatSocketEvent(
        String type,
        ChatMessageResponse payload,
        String message) {

    public static ChatSocketEvent message(ChatMessageResponse payload) {
        return new ChatSocketEvent("message", payload, null);
    }

    public static ChatSocketEvent error(String message) {
        return new ChatSocketEvent("error", null, message);
    }
}

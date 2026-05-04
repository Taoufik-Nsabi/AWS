package ma.sirmaroc.community.chat.support;

import ma.sirmaroc.community.chat.dto.ChatMessageResponse;
import ma.sirmaroc.community.chat.model.ChatMessage;
import org.springframework.stereotype.Component;

@Component
public class ChatMessageMapper {

    public ChatMessageResponse toResponse(ChatMessage message) {
        return new ChatMessageResponse(
                message.getId(),
                message.getSender(),
                message.getDisplayName(),
                message.getRoom().value(),
                message.getContent(),
                message.getImageUrl(),
                message.getSentAt()
        );
    }
}

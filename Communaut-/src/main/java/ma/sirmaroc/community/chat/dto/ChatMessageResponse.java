package ma.sirmaroc.community.chat.dto;

import java.time.Instant;

public record ChatMessageResponse(
        Long id,
        String sender,
        String displayName,
        String room,
        String content,
        String imageUrl,
        Instant sentAt) {
}

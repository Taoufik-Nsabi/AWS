package ma.sirmaroc.community.chat.dto;

import java.util.List;

public record ChatRoomSnapshotResponse(
        String room,
        List<ChatMessageResponse> messages,
        int messageCount,
        long participantCount) {
}

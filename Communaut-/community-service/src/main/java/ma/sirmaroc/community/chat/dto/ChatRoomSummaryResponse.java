package ma.sirmaroc.community.chat.dto;

public record ChatRoomSummaryResponse(
        String room,
        long messageCount,
        long participantCount) {
}

package ma.sirmaroc.community.chat.dto;

import java.util.List;

public record ChatRoomsOverviewResponse(
        List<ChatRoomSummaryResponse> rooms,
        long totalParticipantCount) {
}

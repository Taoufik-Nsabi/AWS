package ma.sirmaroc.community.chat.controller;

import lombok.RequiredArgsConstructor;
import ma.sirmaroc.community.chat.dto.ChatRoomsOverviewResponse;
import ma.sirmaroc.community.chat.service.ChatMessageService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/chat/rooms")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatMessageService chatMessageService;

    @GetMapping
    public ChatRoomsOverviewResponse getRoomsOverview() {
        return chatMessageService.getRoomOverview();
    }
}

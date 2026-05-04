package ma.sirmaroc.community.chat.service;

import ma.sirmaroc.community.chat.dto.ChatMessageRequest;
import ma.sirmaroc.community.chat.dto.ChatMessageResponse;
import ma.sirmaroc.community.chat.dto.ChatRoomSnapshotResponse;
import ma.sirmaroc.community.chat.dto.ChatRoomsOverviewResponse;
import org.springframework.web.multipart.MultipartFile;

public interface ChatMessageService {

    ChatRoomSnapshotResponse getRecentMessages(String room, int requestedLimit);

    ChatRoomsOverviewResponse getRoomOverview();

    ChatMessageResponse postMessage(ChatMessageRequest request);

    ChatMessageResponse postMessage(ChatUser chatUser, ChatMessageRequest request);

    ChatMessageResponse postMessageWithImage(String room, String content, MultipartFile image);
}

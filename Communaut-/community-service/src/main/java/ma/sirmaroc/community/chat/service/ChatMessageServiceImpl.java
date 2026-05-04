package ma.sirmaroc.community.chat.service;

import lombok.RequiredArgsConstructor;
import ma.sirmaroc.community.chat.config.ChatProperties;
import ma.sirmaroc.community.chat.dto.ChatMessageRequest;
import ma.sirmaroc.community.chat.dto.ChatMessageResponse;
import ma.sirmaroc.community.chat.dto.ChatRoomSnapshotResponse;
import ma.sirmaroc.community.chat.dto.ChatRoomSummaryResponse;
import ma.sirmaroc.community.chat.dto.ChatRoomsOverviewResponse;
import ma.sirmaroc.community.chat.model.ChatMessage;
import ma.sirmaroc.community.chat.model.ChatRoomType;
import ma.sirmaroc.community.chat.repository.ChatMessageRepository;
import ma.sirmaroc.community.chat.support.ChatMessageMapper;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatMessageServiceImpl implements ChatMessageService {

    private static final Sort SORT_BY_SENT_AT_DESC = Sort.by(Sort.Direction.DESC, "sentAt");

    private final ChatMessageRepository chatMessageRepository;
    private final ChatMessageMapper chatMessageMapper;
    private final ChatUserProvider chatUserProvider;
    private final ChatProperties chatProperties;
    private final ChatImageStorageService chatImageStorageService;

    @Override
    @Transactional(readOnly = true)
    public ChatRoomSnapshotResponse getRecentMessages(String requestedRoom, int requestedLimit) {
        ChatRoomType room = ChatRoomType.fromValueOrDefault(requestedRoom);
        int limit = sanitizeLimit(requestedLimit);
        List<ChatMessage> persistedMessages = chatMessageRepository
                .findByRoom(room, PageRequest.of(0, limit, SORT_BY_SENT_AT_DESC))
                .getContent();

        List<ChatMessage> orderedMessages = new ArrayList<>(persistedMessages);
        Collections.reverse(orderedMessages);

        List<ChatMessageResponse> responses = orderedMessages.stream()
                .map(chatMessageMapper::toResponse)
                .toList();

        Instant threshold = Instant.now()
                .minus(chatProperties.getActiveParticipantWindowMinutes(), ChronoUnit.MINUTES);
        long participantCount = chatMessageRepository.countDistinctParticipantsSince(room, threshold);

        return new ChatRoomSnapshotResponse(room.value(), responses, responses.size(), participantCount);
    }

    @Override
    @Transactional(readOnly = true)
    public ChatRoomsOverviewResponse getRoomOverview() {
        Instant threshold = Instant.now()
                .minus(chatProperties.getActiveParticipantWindowMinutes(), ChronoUnit.MINUTES);

        List<ChatRoomSummaryResponse> rooms = Arrays.stream(ChatRoomType.values())
                .map(room -> new ChatRoomSummaryResponse(
                        room.value(),
                        chatMessageRepository.countByRoom(room),
                        chatMessageRepository.countDistinctParticipantsSince(room, threshold)
                ))
                .toList();

        long totalParticipantCount = chatMessageRepository.countDistinctParticipantsSince(threshold);
        return new ChatRoomsOverviewResponse(rooms, totalParticipantCount);
    }

    @Override
    @Transactional
    public ChatMessageResponse postMessage(ChatMessageRequest request) {
        return saveMessage(chatUserProvider.getCurrentUser(), request.room(), request.content(), null);
    }

    @Override
    @Transactional
    public ChatMessageResponse postMessage(ChatUser chatUser, ChatMessageRequest request) {
        return saveMessage(chatUser, request.room(), request.content(), null);
    }

    @Override
    @Transactional
    public ChatMessageResponse postMessageWithImage(String room, String content, MultipartFile image) {
        return saveMessage(chatUserProvider.getCurrentUser(), room, content, image);
    }

    private int sanitizeLimit(int requestedLimit) {
        if (requestedLimit <= 0) {
            return chatProperties.getDefaultFetchLimit();
        }

        return Math.min(requestedLimit, chatProperties.getMaxFetchLimit());
    }

    private ChatMessageResponse saveMessage(
            ChatUser chatUser,
            String requestedRoom,
            String rawContent,
            MultipartFile image) {
        ChatRoomType room = ChatRoomType.fromValueOrDefault(requestedRoom);
        String content = rawContent == null ? "" : rawContent.trim();
        String imageUrl = chatImageStorageService.store(image);

        if (content.isBlank() && imageUrl == null) {
            throw new IllegalArgumentException("Ajoutez un message ou une image avant d'envoyer.");
        }

        ChatMessage message = new ChatMessage(
                room,
                chatUser.username(),
                chatUser.displayName(),
                content,
                imageUrl
        );

        ChatMessage savedMessage = chatMessageRepository.save(message);
        return chatMessageMapper.toResponse(savedMessage);
    }
}

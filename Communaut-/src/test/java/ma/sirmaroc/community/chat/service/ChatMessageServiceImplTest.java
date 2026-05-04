package ma.sirmaroc.community.chat.service;

import ma.sirmaroc.community.chat.config.ChatProperties;
import ma.sirmaroc.community.chat.dto.ChatMessageRequest;
import ma.sirmaroc.community.chat.dto.ChatRoomSnapshotResponse;
import ma.sirmaroc.community.chat.dto.ChatRoomsOverviewResponse;
import ma.sirmaroc.community.chat.model.ChatMessage;
import ma.sirmaroc.community.chat.model.ChatRoomType;
import ma.sirmaroc.community.chat.repository.ChatMessageRepository;
import ma.sirmaroc.community.chat.support.ChatMessageMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.mock.web.MockMultipartFile;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatMessageServiceImplTest {

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @Mock
    private ChatUserProvider chatUserProvider;

    @Mock
    private ChatImageStorageService chatImageStorageService;

    private ChatProperties chatProperties;

    @InjectMocks
    private ChatMessageServiceImpl chatMessageService;

    @BeforeEach
    void setUp() {
        chatProperties = new ChatProperties();
        chatProperties.setDefaultFetchLimit(60);
        chatProperties.setMaxFetchLimit(100);
        chatProperties.setActiveParticipantWindowMinutes(30);

        chatMessageService = new ChatMessageServiceImpl(
                chatMessageRepository,
                new ChatMessageMapper(),
                chatUserProvider,
                chatProperties,
                chatImageStorageService
        );
    }

    @Test
    void getRecentMessagesReturnsAscendingTimeline() {
        ChatMessage newest = new ChatMessage(ChatRoomType.DEBATES, "youssef@sir.com", "Youssef", "Bienvenue");
        newest.setId(2L);
        newest.setSentAt(Instant.parse("2026-04-30T10:34:00Z"));

        ChatMessage oldest = new ChatMessage(ChatRoomType.DEBATES, "lina@sir.com", "Lina", "Bonjour");
        oldest.setId(1L);
        oldest.setSentAt(Instant.parse("2026-04-30T10:32:00Z"));

        when(chatMessageRepository.findByRoom(any(ChatRoomType.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(newest, oldest)));
        when(chatMessageRepository.countDistinctParticipantsSince(any(ChatRoomType.class), any()))
                .thenReturn(2L);

        ChatRoomSnapshotResponse response = chatMessageService.getRecentMessages("debates", 2);

        assertThat(response.messages()).hasSize(2);
        assertThat(response.room()).isEqualTo("debates");
        assertThat(response.messages().get(0).displayName()).isEqualTo("Lina");
        assertThat(response.messages().get(1).displayName()).isEqualTo("Youssef");
        assertThat(response.participantCount()).isEqualTo(2L);
    }

    @Test
    void postMessageUsesAuthenticatedUserData() {
        when(chatUserProvider.getCurrentUser()).thenReturn(new ChatUser("karim@sir.com", "Karim"));
        when(chatImageStorageService.store(any())).thenReturn(null);
        when(chatMessageRepository.save(any(ChatMessage.class))).thenAnswer(invocation -> {
            ChatMessage message = invocation.getArgument(0);
            message.setId(42L);
            message.setSentAt(Instant.parse("2026-04-30T10:39:00Z"));
            return message;
        });

        chatMessageService.postMessage(new ChatMessageRequest("questions", "Salut la communaute"));

        ArgumentCaptor<ChatMessage> captor = ArgumentCaptor.forClass(ChatMessage.class);
        verify(chatMessageRepository).save(captor.capture());

        ChatMessage saved = captor.getValue();
        assertThat(saved.getRoom()).isEqualTo(ChatRoomType.QUESTIONS);
        assertThat(saved.getSender()).isEqualTo("karim@sir.com");
        assertThat(saved.getDisplayName()).isEqualTo("Karim");
        assertThat(saved.getContent()).isEqualTo("Salut la communaute");
    }

    @Test
    void postMessageUsesProvidedSocketUserData() {
        when(chatImageStorageService.store(any())).thenReturn(null);
        when(chatMessageRepository.save(any(ChatMessage.class))).thenAnswer(invocation -> {
            ChatMessage message = invocation.getArgument(0);
            message.setId(58L);
            message.setSentAt(Instant.parse("2026-05-03T10:12:00Z"));
            return message;
        });

        chatMessageService.postMessage(
                new ChatUser("wissal@sir.com", "Wissal"),
                new ChatMessageRequest("fun", "Message en direct")
        );

        ArgumentCaptor<ChatMessage> captor = ArgumentCaptor.forClass(ChatMessage.class);
        verify(chatMessageRepository).save(captor.capture());

        ChatMessage saved = captor.getValue();
        assertThat(saved.getRoom()).isEqualTo(ChatRoomType.FUN);
        assertThat(saved.getSender()).isEqualTo("wissal@sir.com");
        assertThat(saved.getDisplayName()).isEqualTo("Wissal");
        assertThat(saved.getContent()).isEqualTo("Message en direct");
    }

    @Test
    void postMessageWithImageStoresReturnedImageUrl() {
        when(chatUserProvider.getCurrentUser()).thenReturn(new ChatUser("lina@sir.com", "Lina"));
        when(chatImageStorageService.store(any())).thenReturn("/api/community/api/v1/chat/uploads/atlas.jpg");
        when(chatMessageRepository.save(any(ChatMessage.class))).thenAnswer(invocation -> {
            ChatMessage message = invocation.getArgument(0);
            message.setId(77L);
            message.setSentAt(Instant.parse("2026-05-02T21:00:00Z"));
            return message;
        });

        MockMultipartFile image = new MockMultipartFile(
                "image",
                "atlas.jpg",
                "image/jpeg",
                new byte[]{1, 2, 3}
        );

        chatMessageService.postMessageWithImage("fun", "Vue incroyable", image);

        ArgumentCaptor<ChatMessage> captor = ArgumentCaptor.forClass(ChatMessage.class);
        verify(chatMessageRepository).save(captor.capture());

        ChatMessage saved = captor.getValue();
        assertThat(saved.getRoom()).isEqualTo(ChatRoomType.FUN);
        assertThat(saved.getContent()).isEqualTo("Vue incroyable");
        assertThat(saved.getImageUrl()).isEqualTo("/api/community/api/v1/chat/uploads/atlas.jpg");
    }

    @Test
    void getRoomOverviewReturnsCountsForEveryRoom() {
        when(chatMessageRepository.countByRoom(ChatRoomType.DEBATES)).thenReturn(3L);
        when(chatMessageRepository.countByRoom(ChatRoomType.QUESTIONS)).thenReturn(1L);
        when(chatMessageRepository.countByRoom(ChatRoomType.FUN)).thenReturn(5L);
        when(chatMessageRepository.countDistinctParticipantsSince(any(ChatRoomType.class), any()))
                .thenReturn(2L);
        when(chatMessageRepository.countDistinctParticipantsSince(any()))
                .thenReturn(4L);

        ChatRoomsOverviewResponse response = chatMessageService.getRoomOverview();

        assertThat(response.rooms()).hasSize(3);
        assertThat(response.totalParticipantCount()).isEqualTo(4L);
        assertThat(response.rooms().get(0).room()).isEqualTo("debates");
        assertThat(response.rooms().get(2).messageCount()).isEqualTo(5L);
    }
}

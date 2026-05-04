package ma.sirmaroc.community.chat.repository;

import ma.sirmaroc.community.chat.model.ChatMessage;
import ma.sirmaroc.community.chat.model.ChatRoomType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    Page<ChatMessage> findByRoom(ChatRoomType room, Pageable pageable);

    long countByRoom(ChatRoomType room);

    @Query("""
            select count(distinct m.sender)
            from ChatMessage m
            where m.room = :room
              and m.sentAt >= :threshold
            """)
    long countDistinctParticipantsSince(@Param("room") ChatRoomType room,
                                        @Param("threshold") Instant threshold);

    @Query("""
            select count(distinct m.sender)
            from ChatMessage m
            where m.sentAt >= :threshold
            """)
    long countDistinctParticipantsSince(@Param("threshold") Instant threshold);
}

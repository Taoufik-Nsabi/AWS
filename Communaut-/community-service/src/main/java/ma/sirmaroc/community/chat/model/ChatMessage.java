package ma.sirmaroc.community.chat.model;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 320)
    private String sender;

    @Column(name = "display_name", nullable = false, length = 120)
    private String displayName;

    @Convert(converter = ChatRoomTypeConverter.class)
    @Column(nullable = false, length = 40)
    private ChatRoomType room;

    @Column(nullable = false, length = 500)
    private String content;

    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @Column(name = "sent_at", nullable = false)
    private Instant sentAt;

    public ChatMessage(ChatRoomType room, String sender, String displayName, String content) {
        this(room, sender, displayName, content, null);
    }

    public ChatMessage(ChatRoomType room, String sender, String displayName, String content, String imageUrl) {
        this.room = room;
        this.sender = sender;
        this.displayName = displayName;
        this.content = content;
        this.imageUrl = imageUrl;
    }

    @PrePersist
    void onCreate() {
        if (sentAt == null) {
            sentAt = Instant.now();
        }
    }
}

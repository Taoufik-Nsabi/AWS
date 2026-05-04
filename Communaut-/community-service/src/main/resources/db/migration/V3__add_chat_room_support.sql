ALTER TABLE chat_messages
ADD room NVARCHAR(40) NOT NULL
    CONSTRAINT df_chat_messages_room DEFAULT 'debates';

CREATE INDEX idx_chat_messages_room_sent_at ON chat_messages (room, sent_at DESC);

CREATE TABLE chat_messages (
    id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    sender NVARCHAR(320) NOT NULL,
    display_name NVARCHAR(120) NOT NULL,
    content NVARCHAR(500) NOT NULL,
    sent_at DATETIME2 NOT NULL CONSTRAINT df_chat_messages_sent_at DEFAULT SYSUTCDATETIME()
);

CREATE INDEX idx_chat_messages_sent_at ON chat_messages (sent_at DESC);
CREATE INDEX idx_chat_messages_sender ON chat_messages (sender);

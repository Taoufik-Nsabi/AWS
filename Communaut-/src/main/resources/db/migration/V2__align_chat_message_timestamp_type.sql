DROP INDEX idx_chat_messages_sent_at ON chat_messages;

ALTER TABLE chat_messages DROP CONSTRAINT df_chat_messages_sent_at;

ALTER TABLE chat_messages
ALTER COLUMN sent_at DATETIMEOFFSET(6) NOT NULL;

ALTER TABLE chat_messages
ADD CONSTRAINT df_chat_messages_sent_at
DEFAULT (SYSUTCDATETIME() AT TIME ZONE 'UTC') FOR sent_at;

CREATE INDEX idx_chat_messages_sent_at ON chat_messages (sent_at DESC);

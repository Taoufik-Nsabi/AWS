package ma.sirmaroc.community.chat.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class ChatRoomTypeConverter implements AttributeConverter<ChatRoomType, String> {

    @Override
    public String convertToDatabaseColumn(ChatRoomType attribute) {
        if (attribute == null) {
            return null;
        }

        return attribute.value();
    }

    @Override
    public ChatRoomType convertToEntityAttribute(String dbData) {
        return ChatRoomType.fromValueOrDefault(dbData);
    }
}

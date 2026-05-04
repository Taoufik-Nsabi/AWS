package ma.sirmaroc.community.chat.model;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ChatRoomTypeConverterTest {

    private final ChatRoomTypeConverter converter = new ChatRoomTypeConverter();

    @Test
    void convertsEnumToLowercaseDatabaseValue() {
        assertThat(converter.convertToDatabaseColumn(ChatRoomType.DEBATES)).isEqualTo("debates");
        assertThat(converter.convertToDatabaseColumn(ChatRoomType.QUESTIONS)).isEqualTo("questions");
        assertThat(converter.convertToDatabaseColumn(ChatRoomType.FUN)).isEqualTo("fun");
    }

    @Test
    void convertsLowercaseDatabaseValueBackToEnum() {
        assertThat(converter.convertToEntityAttribute("debates")).isEqualTo(ChatRoomType.DEBATES);
        assertThat(converter.convertToEntityAttribute("questions")).isEqualTo(ChatRoomType.QUESTIONS);
        assertThat(converter.convertToEntityAttribute("fun")).isEqualTo(ChatRoomType.FUN);
    }
}

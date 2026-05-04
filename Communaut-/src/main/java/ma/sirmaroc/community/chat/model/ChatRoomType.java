package ma.sirmaroc.community.chat.model;

import java.util.Arrays;

public enum ChatRoomType {
    DEBATES("debates"),
    QUESTIONS("questions"),
    FUN("fun");

    private final String value;

    ChatRoomType(String value) {
        this.value = value;
    }

    public String value() {
        return value;
    }

    public static ChatRoomType fromValueOrDefault(String rawValue) {
        if (rawValue == null || rawValue.isBlank()) {
            return DEBATES;
        }

        return Arrays.stream(values())
                .filter(room -> room.value.equalsIgnoreCase(rawValue.trim()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Le salon demande est inconnu."));
    }
}

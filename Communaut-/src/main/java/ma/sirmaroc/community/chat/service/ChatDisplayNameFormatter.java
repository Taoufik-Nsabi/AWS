package ma.sirmaroc.community.chat.service;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.Locale;

@Component
public class ChatDisplayNameFormatter {

    public String format(String username) {
        String baseValue = username != null && username.contains("@")
                ? username.substring(0, username.indexOf('@'))
                : username;

        return Arrays.stream((baseValue == null ? "" : baseValue).split("[._-]+"))
                .filter(StringUtils::hasText)
                .map(this::capitalize)
                .reduce((left, right) -> left + " " + right)
                .orElse("Voyageur");
    }

    private String capitalize(String value) {
        String normalized = value.trim();
        if (normalized.isEmpty()) {
            return normalized;
        }

        return normalized.substring(0, 1).toUpperCase(Locale.ROOT)
                + normalized.substring(1).toLowerCase(Locale.ROOT);
    }
}

package ma.sirmaroc.community.chat.service;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@lombok.RequiredArgsConstructor
public class SecurityContextChatUserProvider implements ChatUserProvider {

    private final ChatDisplayNameFormatter chatDisplayNameFormatter;

    @Override
    public ChatUser getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Vous devez etre authentifie pour acceder au chat.");
        }

        String username = authentication.getName();
        if (!StringUtils.hasText(username) || "anonymousUser".equalsIgnoreCase(username)) {
            throw new AccessDeniedException("Utilisateur de chat introuvable.");
        }

        return new ChatUser(username, chatDisplayNameFormatter.format(username));
    }
}

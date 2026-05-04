package ma.sirmaroc.community.chat.websocket;

import lombok.RequiredArgsConstructor;
import ma.sirmaroc.community.chat.model.ChatRoomType;
import ma.sirmaroc.community.chat.service.ChatDisplayNameFormatter;
import ma.sirmaroc.community.chat.service.ChatUser;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class ChatWebSocketHandshakeInterceptor implements HandshakeInterceptor {

    private static final String ROOM_ATTRIBUTE = "chatRoom";
    private static final String USER_ATTRIBUTE = "chatUser";

    private final JwtDecoder jwtDecoder;
    private final ChatDisplayNameFormatter chatDisplayNameFormatter;

    @Override
    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes) {
        if (!(request instanceof ServletServerHttpRequest servletRequest)) {
            response.setStatusCode(HttpStatus.BAD_REQUEST);
            return false;
        }

        String requestedRoom = servletRequest.getServletRequest().getParameter("room");
        String room = ChatRoomType.fromValueOrDefault(requestedRoom).value();
        String rawToken = servletRequest.getServletRequest().getParameter("token");

        if (rawToken == null || rawToken.isBlank()) {
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return false;
        }

        try {
            Jwt jwt = jwtDecoder.decode(rawToken);
            String username = extractUsername(jwt);
            if (username == null || username.isBlank()) {
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return false;
            }

            attributes.put(ROOM_ATTRIBUTE, room);
            attributes.put(USER_ATTRIBUTE, new ChatUser(username, chatDisplayNameFormatter.format(username)));
            return true;
        } catch (JwtException exception) {
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return false;
        }
    }

    @Override
    public void afterHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Exception exception) {
        // No-op.
    }

    private String extractUsername(Jwt jwt) {
        String email = getStringClaim(jwt, "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress");
        if (email != null) {
            return email;
        }

        String standardEmail = getStringClaim(jwt, "email");
        if (standardEmail != null) {
            return standardEmail;
        }

        String name = getStringClaim(jwt, "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name");
        if (name != null) {
            return name;
        }

        String preferredUsername = getStringClaim(jwt, "preferred_username");
        if (preferredUsername != null) {
            return preferredUsername;
        }

        String subject = jwt.getSubject();
        if (subject != null && !subject.isBlank()) {
            return subject;
        }

        return null;
    }

    private String getStringClaim(Jwt jwt, String claimName) {
        Object claimValue = jwt.getClaims().get(claimName);
        if (claimValue instanceof String text && !text.isBlank()) {
            return text;
        }

        return null;
    }
}

package ma.sirmaroc.community.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.sirmaroc.community.web.ApiErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class GatewayAuthenticationFilter extends OncePerRequestFilter {

    private final GatewaySecurityProperties properties;
    private final ObjectMapper objectMapper;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/v1/")
                || "OPTIONS".equalsIgnoreCase(request.getMethod());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        if (!properties.isEnabled()) {
            filterChain.doFilter(request, response);
            return;
        }

        String providedSecret = request.getHeader(properties.getGatewayHeaderName());
        if (!StringUtils.hasText(providedSecret) || !providedSecret.equals(properties.getSharedSecret())) {
            log.warn("Rejected request outside trusted gateway flow: {} {}", request.getMethod(), request.getRequestURI());
            SecurityContextHolder.clearContext();
            writeGatewayOnlyResponse(response, request.getRequestURI());
            return;
        }

        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            String username = request.getHeader(properties.getUsernameHeaderName());
            List<SimpleGrantedAuthority> authorities = parseAuthorities(request.getHeader(properties.getRolesHeaderName()));

            if (StringUtils.hasText(username) || !authorities.isEmpty()) {
                String principal = StringUtils.hasText(username) ? username : "gateway-user";
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(principal, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }

    private List<SimpleGrantedAuthority> parseAuthorities(String rawRoles) {
        if (!StringUtils.hasText(rawRoles)) {
            return List.of();
        }

        return Arrays.stream(rawRoles.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role)
                .distinct()
                .map(SimpleGrantedAuthority::new)
                .toList();
    }

    private void writeGatewayOnlyResponse(HttpServletResponse response, String path) throws IOException {
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(), new ApiErrorResponse(
                Instant.now(),
                HttpStatus.FORBIDDEN.value(),
                HttpStatus.FORBIDDEN.getReasonPhrase(),
                "Acces refuse. Cette ressource doit etre appelee via l'API Gateway.",
                path
        ));
    }
}

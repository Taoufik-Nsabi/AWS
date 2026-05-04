package ma.sirmaroc.community.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.security.jwt")
public class CommunityJwtProperties {

    private String issuer = "UserService.Api";
    private String audience = "UserService.Client";
    private String secretKey = "CHANGE_ME_USE_A_STRONG_256_BIT_SECRET_KEY_123456789";
}

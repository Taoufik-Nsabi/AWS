package ma.sirmaroc.community.chat.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.chat")
@Getter
@Setter
public class ChatProperties {

    private int defaultFetchLimit = 60;
    private int maxFetchLimit = 100;
    private int activeParticipantWindowMinutes = 30;
}

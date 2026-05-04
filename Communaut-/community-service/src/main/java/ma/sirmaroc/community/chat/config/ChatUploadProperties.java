package ma.sirmaroc.community.chat.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.unit.DataSize;

import java.util.List;

@ConfigurationProperties(prefix = "app.chat.upload")
@Getter
@Setter
public class ChatUploadProperties {

    private String directory = "uploads/chat";
    private String publicBasePath = "/api/v1/chat/uploads";
    private DataSize maxFileSize = DataSize.ofMegabytes(8);
    private List<String> allowedContentTypes = List.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/avif",
            "image/gif"
    );
}

package ma.sirmaroc.community.chat.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import ma.sirmaroc.community.chat.config.ChatUploadProperties;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileSystemChatImageStorageService implements ChatImageStorageService {

    private static final Map<String, String> CONTENT_TYPE_EXTENSIONS = Map.of(
            "image/jpeg", "jpg",
            "image/png", "png",
            "image/webp", "webp",
            "image/avif", "avif",
            "image/gif", "gif"
    );

    private final ChatUploadProperties chatUploadProperties;

    private Path uploadDirectory;

    @PostConstruct
    void initialize() {
        try {
            uploadDirectory = Path.of(chatUploadProperties.getDirectory()).toAbsolutePath().normalize();
            Files.createDirectories(uploadDirectory);
        } catch (IOException exception) {
            throw new IllegalStateException("Impossible de preparer le dossier d'upload du chat.", exception);
        }
    }

    @Override
    public String store(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            return null;
        }

        validate(image);

        String storedFileName = UUID.randomUUID() + "." + resolveExtension(image);
        try {
            Files.copy(image.getInputStream(), uploadDirectory.resolve(storedFileName), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException exception) {
            throw new IllegalStateException("Impossible d'enregistrer l'image du message.", exception);
        }

        return chatUploadProperties.getPublicBasePath().replaceAll("/+$", "") + "/" + storedFileName;
    }

    @Override
    public Resource load(String fileName) {
        Path resolvedPath = uploadDirectory.resolve(fileName).normalize();
        if (!resolvedPath.startsWith(uploadDirectory)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nom de fichier invalide.");
        }

        try {
            Resource resource = new UrlResource(resolvedPath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Image introuvable.");
            }

            return resource;
        } catch (MalformedURLException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nom de fichier invalide.", exception);
        }
    }

    private void validate(MultipartFile image) {
        if (image.getSize() > chatUploadProperties.getMaxFileSize().toBytes()) {
            throw new IllegalArgumentException("L'image depasse la taille maximale autorisee.");
        }

        String contentType = image.getContentType();
        if (contentType == null || !chatUploadProperties.getAllowedContentTypes().contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new IllegalArgumentException("Le format d'image n'est pas autorise.");
        }
    }

    private String resolveExtension(MultipartFile image) {
        String contentType = image.getContentType();
        if (contentType != null) {
            String fromContentType = CONTENT_TYPE_EXTENSIONS.get(contentType.toLowerCase(Locale.ROOT));
            if (fromContentType != null) {
                return fromContentType;
            }
        }

        String originalFileName = StringUtils.cleanPath(image.getOriginalFilename() == null ? "" : image.getOriginalFilename());
        String extension = StringUtils.getFilenameExtension(originalFileName);
        if (extension != null && !extension.isBlank()) {
            return extension.toLowerCase(Locale.ROOT);
        }

        return "jpg";
    }
}

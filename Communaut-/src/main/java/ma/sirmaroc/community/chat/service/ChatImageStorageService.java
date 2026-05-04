package ma.sirmaroc.community.chat.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface ChatImageStorageService {

    String store(MultipartFile image);

    Resource load(String fileName);
}

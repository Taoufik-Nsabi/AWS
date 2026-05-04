package ma.sirmaroc.community.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChatMessageRequest(
        String room,

        @NotBlank(message = "Le message ne peut pas etre vide.")
        @Size(max = 500, message = "Le message ne doit pas depasser 500 caracteres.")
        String content) {
}

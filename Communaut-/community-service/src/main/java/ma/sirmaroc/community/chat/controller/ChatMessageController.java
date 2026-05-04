package ma.sirmaroc.community.chat.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import ma.sirmaroc.community.chat.dto.ChatMessageRequest;
import ma.sirmaroc.community.chat.dto.ChatMessageResponse;
import ma.sirmaroc.community.chat.dto.ChatRoomSnapshotResponse;
import ma.sirmaroc.community.chat.service.ChatMessageService;
import ma.sirmaroc.community.chat.websocket.ChatSocketBroadcaster;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/chat/messages")
@RequiredArgsConstructor
@Validated
public class ChatMessageController {

    private final ChatMessageService chatMessageService;
    private final ChatSocketBroadcaster chatSocketBroadcaster;

    @GetMapping
    public ChatRoomSnapshotResponse getMessages(
            @RequestParam(defaultValue = "debates")
            String room,

            @RequestParam(defaultValue = "60")
            @Min(1)
            @Max(100)
            int limit) {
        return chatMessageService.getRecentMessages(room, limit);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ChatMessageResponse postMessage(@Valid @RequestBody ChatMessageRequest request) {
        ChatMessageResponse response = chatMessageService.postMessage(request);
        chatSocketBroadcaster.broadcast(response.room(), response);
        return response;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ChatMessageResponse postMessageWithImage(
            @RequestParam String room,
            @RequestParam(required = false) String content,
            @RequestPart(required = false) MultipartFile image) {
        ChatMessageResponse response = chatMessageService.postMessageWithImage(room, content, image);
        chatSocketBroadcaster.broadcast(response.room(), response);
        return response;
    }
}

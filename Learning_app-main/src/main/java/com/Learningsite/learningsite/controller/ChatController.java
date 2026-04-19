package com.Learningsite.learningsite.controller;

import com.Learningsite.learningsite.dto.ChatMessageDto;
import com.Learningsite.learningsite.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {
    RequestMethod.GET, RequestMethod.POST, RequestMethod.DELETE,
    RequestMethod.PUT, RequestMethod.OPTIONS
})
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    // REST endpoint to fetch chat history for a given room (user email)
    @GetMapping("/api/chat/history")
    public ResponseEntity<List<ChatMessageDto>> getChatHistory(@RequestParam("room") String room) {
        return ResponseEntity.ok(chatService.getChatHistory(room));
    }

    // Delete all messages for a given room (Admin only)
    @DeleteMapping("/api/chat/history")
    public ResponseEntity<Void> deleteChat(@RequestParam("room") String room) {
        chatService.deleteChat(room);
        return ResponseEntity.noContent().build();
    }

    // WebSocket endpoint to receive a message and broadcast it
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessageDto chatMessageDto) {
        // Save to DB
        ChatMessageDto savedMessage = chatService.saveMessage(chatMessageDto);

        // Broadcast to specific room (e.g. /topic/chat/user@email.com)
        messagingTemplate.convertAndSend("/topic/chat/" + savedMessage.getRoom(), savedMessage);

        // Notify Admin (on a separate topic)
        messagingTemplate.convertAndSend("/topic/admin/notifications", savedMessage);
        System.out.println("Message broadcasted to admin: " + savedMessage.getSenderEmail() + " -> " + savedMessage.getRoom());
    }
}

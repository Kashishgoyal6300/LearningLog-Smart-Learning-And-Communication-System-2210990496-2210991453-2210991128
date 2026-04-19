package com.Learningsite.learningsite.service.impl;

import com.Learningsite.learningsite.dto.ChatMessageDto;
import com.Learningsite.learningsite.entity.ChatMessageEntity;
import com.Learningsite.learningsite.repository.ChatMessageRepository;
import com.Learningsite.learningsite.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ChatMessageRepository chatMessageRepository;

    @Override
    public ChatMessageDto saveMessage(ChatMessageDto dto) {
        ChatMessageEntity entity = ChatMessageEntity.builder()
                .room(dto.getRoom())
                .senderEmail(dto.getSenderEmail())
                .senderRole(dto.getSenderRole())
                .content(dto.getContent())
                // timestamp will be set automatically by @PrePersist if null, but we can set it to return immediately
                .timestamp(LocalDateTime.now())
                .build();

        ChatMessageEntity saved = chatMessageRepository.save(entity);

        return mapToDto(saved);
    }

    @Override
    public List<ChatMessageDto> getChatHistory(String room) {
        return chatMessageRepository.findByRoomOrderByTimestampAsc(room)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteChat(String room) {
        List<ChatMessageEntity> messages = chatMessageRepository.findByRoomOrderByTimestampAsc(room);
        chatMessageRepository.deleteAll(messages);
    }

    private ChatMessageDto mapToDto(ChatMessageEntity entity) {
        return ChatMessageDto.builder()
                .id(entity.getId())
                .room(entity.getRoom())
                .senderEmail(entity.getSenderEmail())
                .senderRole(entity.getSenderRole())
                .content(entity.getContent())
                .timestamp(entity.getTimestamp())
                .build();
    }
}

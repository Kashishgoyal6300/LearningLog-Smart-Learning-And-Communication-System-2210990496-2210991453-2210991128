package com.Learningsite.learningsite.service;

import com.Learningsite.learningsite.dto.ChatMessageDto;

import java.util.List;

public interface ChatService {
    ChatMessageDto saveMessage(ChatMessageDto messageDto);
    List<ChatMessageDto> getChatHistory(String room);
    void deleteChat(String room);
}

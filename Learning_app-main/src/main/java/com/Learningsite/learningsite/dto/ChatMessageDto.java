package com.Learningsite.learningsite.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {
    private Long id;
    private String room;
    private String senderEmail;
    private String senderRole;
    private String content;
    private LocalDateTime timestamp;
}

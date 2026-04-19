package com.Learningsite.learningsite.dto;

import lombok.Data;

@Data
public class SendMessageRequest {
    private Long chatRoomId;
    private String content; // Text content or description
    private String fileUrl;
    private String fileName;
    private String type; // "TEXT", "FILE", "IMAGE"
}
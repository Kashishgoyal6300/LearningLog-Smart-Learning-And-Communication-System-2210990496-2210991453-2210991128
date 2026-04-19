package com.Learningsite.learningsite.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LogEditHistoryResponseDto {

    private String editedBy;
    private LocalDateTime editedAt;

    private String oldTitle;
    private String newTitle;

    private String oldDescription;
    private String newDescription;

    private String oldTag;
    private String newTag;
}
package com.Learningsite.learningsite.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LogResponseDto {
    private Long id;
    private String date;
    private String title;
    private String description;
    private String tag;
}

package com.Learningsite.learningsite.dto;

import lombok.Data;

@Data
public class CreateLogDto {
    private String date;        // 2025-01-04
    private String title;
    private String description;
    private String tag;        // optional
}

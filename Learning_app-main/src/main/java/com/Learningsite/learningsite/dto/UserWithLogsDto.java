package com.Learningsite.learningsite.dto;

import java.util.List;

import lombok.Getter;
@Getter
public class UserWithLogsDto {
    private Long id;
    private String name;
    private String email;
    private List<LogResponseDto> logs;

    public UserWithLogsDto(Long id, String name, String email, List<LogResponseDto> logs) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.logs = logs;
    }

 
}

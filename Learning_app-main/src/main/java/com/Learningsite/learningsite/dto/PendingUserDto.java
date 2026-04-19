package com.Learningsite.learningsite.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PendingUserDto {
    private Long id;
    private String name;
    private String email;
}

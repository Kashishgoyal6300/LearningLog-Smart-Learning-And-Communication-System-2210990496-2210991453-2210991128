package com.Learningsite.learningsite.dto;

import lombok.Getter;
import lombok.Setter;

@Getter

public class UserSummaryDto {
    private Long id;
    private String name;
    private String email;

    public UserSummaryDto(Long id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    // getters
}


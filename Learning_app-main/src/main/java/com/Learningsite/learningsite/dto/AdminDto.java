package com.Learningsite.learningsite.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminDto {
    private long totalUsers;
    private long usersLoggedToday;
    private long usersNotLoggedToday;
}

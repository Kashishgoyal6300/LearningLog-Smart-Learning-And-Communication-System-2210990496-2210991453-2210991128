package com.Learningsite.learningsite.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MonthlyAnalyticsDto {
    private String month;
    private Long count;
}

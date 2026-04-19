package com.Learningsite.learningsite.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AnalyticsSummaryDto {
    private long totalLogs;
    private long logsThisWeek;
    private long logsThisMonth;
    private int currentStreak;
    private double attendancePercentage;
}
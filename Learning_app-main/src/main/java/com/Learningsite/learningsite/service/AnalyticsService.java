package com.Learningsite.learningsite.service;

import com.Learningsite.learningsite.dto.AnalyticsSummaryDto;

public interface AnalyticsService {
    AnalyticsSummaryDto getUserAnalytics(String email);
}
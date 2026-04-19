package com.Learningsite.learningsite.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Learningsite.learningsite.dto.AnalyticsSummaryDto;
import com.Learningsite.learningsite.repository.UserRepository;
import com.Learningsite.learningsite.service.AnalyticsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    
    @GetMapping
    public AnalyticsSummaryDto getAnalytics(Authentication auth) {

        if (auth == null) {
            throw new RuntimeException("Authentication is null");
        }

        System.out.println("AUTH NAME = " + auth.getName());

        return analyticsService.getUserAnalytics(auth.getName());
    }

}


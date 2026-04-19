package com.Learningsite.learningsite.service;

import com.Learningsite.learningsite.dto.AdminDto;
import com.Learningsite.learningsite.dto.PendingUserDto;
import com.Learningsite.learningsite.dto.UserSummaryDto;
import com.Learningsite.learningsite.entity.UserEntity;

import com.Learningsite.learningsite.dto.MonthlyAnalyticsDto;

import java.util.List;

public interface AdminService {
    AdminDto getDashboardStats();
    List<PendingUserDto> getUsersNotLoggedToday();
    void sendReminderToUser(Long userId, String subject, String body);
    void sendReminderToAllPending(String subject, String body);
    List<MonthlyAnalyticsDto> getMonthlyReminderAnalytics(int year);
    
    String changeUserRole(String email);

    
    List<UserEntity> getAllNormalUsers();

    void deleteUserByAdmin(Long userId, String adminEmail);

}
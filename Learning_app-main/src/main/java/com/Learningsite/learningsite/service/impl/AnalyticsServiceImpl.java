package com.Learningsite.learningsite.service.impl;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.List;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Learningsite.learningsite.dto.AnalyticsSummaryDto;
import com.Learningsite.learningsite.entity.UserEntity;
import com.Learningsite.learningsite.repository.LearningLogRepository;

import com.Learningsite.learningsite.repository.UserRepository;
import com.Learningsite.learningsite.service.AnalyticsService;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LearningLogRepository logRepository;

    @Override
    public AnalyticsSummaryDto getUserAnalytics(String email) {

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long userId = user.getId();

        // -------- TOTAL LOGS --------
        long totalLogs = logRepository.countByUserId(userId);

        // -------- WEEK & MONTH --------
        LocalDate today = LocalDate.now();
        WeekFields weekFields = WeekFields.of(Locale.getDefault());

        long logsThisWeek = logRepository.countByUserIdAndDateBetween(
                userId,
                today.with(weekFields.dayOfWeek(), 1),
                today.with(weekFields.dayOfWeek(), 5)
        );

        long logsThisMonth = logRepository.countByUserIdAndDateBetween(
                userId,
                today.withDayOfMonth(1),
                today
        );

        // -------- STREAK (MON–FRI ONLY) --------
        List<LocalDate> loggedDates = logRepository.findDistinctLogDates(userId);

        int streak = 0;
        LocalDate current = today;

        while (true) {
            DayOfWeek day = current.getDayOfWeek();

            if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) {
                current = current.minusDays(1);
                continue;
            }

            if (!loggedDates.contains(current)) {
                break;
            }

            streak++;
            current = current.minusDays(1);
        }

        // -------- ATTENDANCE (MON–FRI ONLY) --------
        LocalDate startDate = user.getCreatedAt() != null
                ? user.getCreatedAt().toLocalDate()
                : LocalDate.now();

        LocalDate endDate = today;

        int workingDays = 0;
        LocalDate temp = startDate;

        while (!temp.isAfter(endDate)) {
            DayOfWeek day = temp.getDayOfWeek();
            if (day != DayOfWeek.SATURDAY && day != DayOfWeek.SUNDAY) {
                workingDays++;
            }
            temp = temp.plusDays(1);
        }

        long loggedWorkingDays =
                logRepository.countDistinctByUserIdAndDateBetween(
                        userId, startDate, endDate);

        double attendancePercentage =
                workingDays == 0 ? 0 :
                Math.round(((double) loggedWorkingDays / workingDays) * 10000.0) / 100.0;

        return new AnalyticsSummaryDto(
                totalLogs,
                logsThisWeek,
                logsThisMonth,
                streak,
                attendancePercentage
        );
    }
}

package com.Learningsite.learningsite.service;

import com.Learningsite.learningsite.dto.CreateLogDto;
import com.Learningsite.learningsite.dto.UpdateLogDto;
import com.Learningsite.learningsite.dto.LogResponseDto;

import java.util.List;

public interface LearningLogService {

    LogResponseDto createLog(CreateLogDto dto, String userEmail);

    List<LogResponseDto> getLogsForDate(String date, String userEmail);

    List<LogResponseDto> getAllLogsForUser(String userEmail);

    LogResponseDto updateLog(Long id, UpdateLogDto dto, String userEmail);

    void deleteLog(Long id, String userEmail);

    // Admin
    List<LogResponseDto> getAllLogsAdmin();
    List<String> getCalendarDates(String month, String userEmail);

}

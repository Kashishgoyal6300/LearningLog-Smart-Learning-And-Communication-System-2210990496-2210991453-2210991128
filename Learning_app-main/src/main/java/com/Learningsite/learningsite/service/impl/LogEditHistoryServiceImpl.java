package com.Learningsite.learningsite.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.Learningsite.learningsite.dto.LogEditHistoryResponseDto;
import com.Learningsite.learningsite.entity.LogEditHistoryEntity;
import com.Learningsite.learningsite.repository.LogEditHistoryRepository;
import com.Learningsite.learningsite.service.LogEditHistoryService;

@Service
public class LogEditHistoryServiceImpl implements LogEditHistoryService {

    private final LogEditHistoryRepository historyRepo;

    public LogEditHistoryServiceImpl(LogEditHistoryRepository historyRepo) {
        this.historyRepo = historyRepo;
    }

    @Override
    public List<LogEditHistoryResponseDto> getHistoryByLogId(Long logId) {

        return historyRepo.findByLogIdOrderByEditedAtDesc(logId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    private LogEditHistoryResponseDto toDto(LogEditHistoryEntity entity) {

        return LogEditHistoryResponseDto.builder()
                .editedBy(entity.getEditedBy())
                .editedAt(entity.getEditedAt())
                .oldTitle(entity.getOldTitle())
                .newTitle(entity.getNewTitle())
                .oldDescription(entity.getOldDescription())
                .newDescription(entity.getNewDescription())
                .oldTag(entity.getOldTag())
                .newTag(entity.getNewTag())
                .build();
    }
}
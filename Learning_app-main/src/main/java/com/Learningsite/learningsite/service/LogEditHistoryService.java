package com.Learningsite.learningsite.service;

import java.util.List;

import com.Learningsite.learningsite.dto.LogEditHistoryResponseDto;

public interface LogEditHistoryService {
	 List<LogEditHistoryResponseDto> getHistoryByLogId(Long logId);
}

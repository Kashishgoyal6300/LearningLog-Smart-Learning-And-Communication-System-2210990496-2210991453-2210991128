package com.Learningsite.learningsite.service;

import java.util.List;
import com.Learningsite.learningsite.dto.UserSummaryDto;
import com.Learningsite.learningsite.dto.UserWithLogsDto;

public interface UserService {
    List<UserSummaryDto> getAllUsersExceptLoggedInUser(String loggedInEmail);

    UserWithLogsDto getUserAndLogs(Long userId);
}

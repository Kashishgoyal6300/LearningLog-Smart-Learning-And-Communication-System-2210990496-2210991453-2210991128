package com.Learningsite.learningsite.service.impl;

import com.Learningsite.learningsite.dto.*;
import com.Learningsite.learningsite.entity.UserEntity;
import com.Learningsite.learningsite.repository.LearningLogRepository;
import com.Learningsite.learningsite.repository.UserRepository;
import com.Learningsite.learningsite.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private LearningLogRepository logRepo;

    @Override
    public List<UserSummaryDto> getAllUsersExceptLoggedInUser(String loggedInEmail) {

        return userRepo.findAll()
                .stream()
                .filter(user -> !user.getEmail().equals(loggedInEmail))
                .filter(user -> user.getRole() != null && user.getRole().equalsIgnoreCase("USER"))
                .map(user -> new UserSummaryDto(
                        user.getId(),
                        user.getName(),
                        user.getEmail()
                )).collect(Collectors.toList());
    }

    @Override
    public UserWithLogsDto getUserAndLogs(Long userId) {

        UserEntity user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        var logs = logRepo.findByUser(user)
                .stream()
                .map(log -> new LogResponseDto(
                        log.getId(),
                        log.getDate().toString(),
                        log.getTitle(),
                        log.getDescription(),
                        log.getTag()
                ))
                .collect(Collectors.toList());

        return new UserWithLogsDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                logs
        );
    }
}

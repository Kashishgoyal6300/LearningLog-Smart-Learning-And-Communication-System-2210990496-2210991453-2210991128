package com.Learningsite.learningsite.controller;

import com.Learningsite.learningsite.dto.UserSummaryDto;
import com.Learningsite.learningsite.dto.UserWithLogsDto;
import com.Learningsite.learningsite.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // Fetch all users except the logged-in one
    @GetMapping
    public List<UserSummaryDto> getAllUsers(@AuthenticationPrincipal UserDetails userDetails) {

        String loggedInEmail = userDetails.getUsername();  // cleaner + safer

        return userService.getAllUsersExceptLoggedInUser(loggedInEmail);
    }

    // Get logs of a selected user
    @GetMapping("/{id}")
    public UserWithLogsDto getUserLogs(@PathVariable Long id) {
        return userService.getUserAndLogs(id);
    }
}

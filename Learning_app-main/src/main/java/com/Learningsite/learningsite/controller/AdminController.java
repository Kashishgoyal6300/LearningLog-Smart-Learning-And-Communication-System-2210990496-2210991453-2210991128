package com.Learningsite.learningsite.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Learningsite.learningsite.dto.AdminDto;
import com.Learningsite.learningsite.dto.LogEditHistoryResponseDto;
import com.Learningsite.learningsite.dto.PendingUserDto;
import com.Learningsite.learningsite.entity.UserEntity;
import com.Learningsite.learningsite.repository.LearningLogRepository;
import com.Learningsite.learningsite.repository.UserRepository;
import com.Learningsite.learningsite.service.AdminService;
import com.Learningsite.learningsite.service.LogEditHistoryService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;
@Autowired
private UserRepository userRepository;

private final LogEditHistoryService historyService;

@Autowired
public AdminController(LogEditHistoryService historyService) {
    this.historyService = historyService;
}

@Autowired
private LearningLogRepository logRepository;
    
    // Dashboard stats
    @GetMapping("/dashboard")
    public AdminDto dashboard() {
        return adminService.getDashboardStats();
    }

    // Pending users (didn't log today)
    @GetMapping("/pending")
    public List<PendingUserDto> pendingUsers() {
        return adminService.getUsersNotLoggedToday();
    }

    // Send reminder to one user
    @PostMapping("/pending/{id}/send")
    public String sendReminderToUser(@PathVariable Long id, @RequestBody(required = false) String body) {
        String subject = "Reminder: add your learning log for today";
        String message = (body == null || body.isBlank()) ? "Please add what you learned today." : body;
        adminService.sendReminderToUser(id, subject, message);
        return "Sent";
    }

    // Analytics: Reminders sent per month
    @GetMapping("/analytics/reminders")
    public List<com.Learningsite.learningsite.dto.MonthlyAnalyticsDto> getReminderAnalytics(@RequestParam(defaultValue = "2026") int year) {
        return adminService.getMonthlyReminderAnalytics(year);
    }
    
    // Send reminder to all pending users
    @PostMapping("/pending/send-all")
    public String sendReminderToAll(@RequestBody(required = false) String body) {
        String subject = "Reminder: add your learning log for today";
        String message = (body == null || body.isBlank()) ? "Please add what you learned today." : body;
        adminService.sendReminderToAllPending(subject, message);
        return "Sent to all pending users";
    }
    
    @PostMapping("/change-role")
    public String changeUserRole(@RequestParam String email) {
        return adminService.changeUserRole(email);
        
    }

    @GetMapping("/users")
    public List<UserEntity> getAllUsersForAdmin() {
        return adminService.getAllNormalUsers();
    }

    @GetMapping("/log-history/{logId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<LogEditHistoryResponseDto>> 
        getLogHistory(@PathVariable Long logId) {

        return ResponseEntity.ok(
                historyService.getHistoryByLogId(logId)
        );
    }
}

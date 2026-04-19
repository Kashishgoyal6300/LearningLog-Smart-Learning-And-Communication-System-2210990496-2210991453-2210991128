package com.Learningsite.learningsite.controller;

import com.Learningsite.learningsite.dto.CreateLogDto;
import com.Learningsite.learningsite.dto.LogResponseDto;
import com.Learningsite.learningsite.dto.UpdateLogDto;
import com.Learningsite.learningsite.service.LearningLogService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
public class LearningLogController {

    @Autowired
    private LearningLogService logService;

    // ---------------- CREATE LOG --------------------
    @PostMapping
    public LogResponseDto createLog(
            @RequestBody CreateLogDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails.getUsername();
        return logService.createLog(dto, email);
    }

    // ---------------- GET LOGS FOR A SPECIFIC DATE ---------------
    @GetMapping("/date")
    public List<LogResponseDto> getLogsForDate(
            @RequestParam String date,
            @AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails.getUsername();
        return logService.getLogsForDate(date, email);
    }

    // ---------------- GET ALL LOGS FOR LOGGED-IN USER ------------
    @GetMapping("/my")
    public List<LogResponseDto> getMyLogs(
            @AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails.getUsername();
        return logService.getAllLogsForUser(email);
    }

    // ---------------- UPDATE LOG (ONLY WITHIN 7 DAYS) ------------
    @PutMapping("/{id}")
    public LogResponseDto updateLog(
            @PathVariable Long id,
            @RequestBody UpdateLogDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails.getUsername();
        return logService.updateLog(id, dto, email);
    }

    // ---------------- DELETE LOG (ONLY OWNER) ---------------------
    @DeleteMapping("/{id}")
    public String deleteLog(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails.getUsername();
        logService.deleteLog(id, email);
        return "Log deleted successfully";
    }

    // ---------------- ADMIN: VIEW ALL LOGS ------------------------
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/all")
    public List<LogResponseDto> getAllLogsAdmin() {
        return logService.getAllLogsAdmin();
    }
    
    @GetMapping("/calendar")
    public List<String> getCalendarDates(
            @RequestParam String month,
            @AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails.getUsername();
        return logService.getCalendarDates(month, email);
    }

}

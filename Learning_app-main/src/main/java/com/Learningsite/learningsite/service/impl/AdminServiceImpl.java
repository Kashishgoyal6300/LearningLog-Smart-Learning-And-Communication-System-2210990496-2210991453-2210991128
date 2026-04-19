package com.Learningsite.learningsite.service.impl;

import com.Learningsite.learningsite.dto.*;
import com.Learningsite.learningsite.entity.UserEntity;
import com.Learningsite.learningsite.repository.UserRepository;
import com.Learningsite.learningsite.repository.AdminRepository;
import com.Learningsite.learningsite.repository.LearningLogRepository;
import com.Learningsite.learningsite.repository.ReminderLogRepository;
import com.Learningsite.learningsite.service.AdminService;
import com.Learningsite.learningsite.service.MailService;
import com.Learningsite.learningsite.entity.ReminderLogEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {
    @Autowired
    private UserRepository userRepo;

    @Autowired
    private AdminRepository adminRepository; 
    
    @Autowired
    private LearningLogRepository logRepo;

    @Autowired
    private ReminderLogRepository reminderLogRepo;

    @Autowired
    private MailService mailService;

    @Override
    public AdminDto getDashboardStats() {
        long total = userRepo.count();
        LocalDate today = LocalDate.now();

        // use repository query that returns distinct userIds who logged today
        List<Long> usersWhoLoggedToday = logRepo.findDistinctUserIdsByDate(today);

        long logged = usersWhoLoggedToday.size();
        long notLogged = Math.max(0, total - logged);
        return new AdminDto(total, logged, notLogged);
    }

    @Override
    public List<PendingUserDto> getUsersNotLoggedToday() {
        LocalDate today = LocalDate.now();
        List<Long> loggedUserIds = logRepo.findDistinctUserIdsByDate(today);

        // if none logged today, return all USERS (not admins)
        List<UserEntity> pending = loggedUserIds.isEmpty()
                ? userRepo.findAll().stream()
                    .filter(u -> "USER".equalsIgnoreCase(u.getRole()))
                    .collect(Collectors.toList())
                : userRepo.findUsersWhoDidNotLogToday(loggedUserIds).stream()
                    .filter(u -> "USER".equalsIgnoreCase(u.getRole()))
                    .collect(Collectors.toList());

        return pending.stream()
                .map(u -> new PendingUserDto(u.getId(), u.getName(), u.getEmail()))
                .collect(Collectors.toList());
    }

    @Override
    public void sendReminderToUser(Long userId, String subject, String body) {
        UserEntity user = userRepo.findById(userId).orElseThrow();
        String personalized = "Hi " + user.getName() + ",\n\n" + body;
        
        // Save to DB for analytics
        ReminderLogEntity rLog = new ReminderLogEntity();
        rLog.setUserEmail(user.getEmail());
        reminderLogRepo.save(rLog);

        // Send in background thread so HTTP request returns immediately
        new Thread(() -> mailService.sendReminder(user.getEmail(), subject, personalized)).start();
    }

    @Override
    public void sendReminderToAllPending(String subject, String body) {
        List<PendingUserDto> pending = getUsersNotLoggedToday();
        
        // Save to DB for analytics first
        for (PendingUserDto p : pending) {
            ReminderLogEntity rLog = new ReminderLogEntity();
            rLog.setUserEmail(p.getEmail());
            reminderLogRepo.save(rLog);
        }

        // Send all in background thread so HTTP request returns immediately
        new Thread(() -> {
            for (PendingUserDto p : pending) {
                mailService.sendReminder(p.getEmail(), subject, "Hi " + p.getName() + ",\n\n" + body);
            }
        }).start();
    }
    
    @Override
    public List<MonthlyAnalyticsDto> getMonthlyReminderAnalytics(int year) {
        List<Object[]> results = reminderLogRepo.countRemindersByMonthForYear(year);
        
        // Initialize 12 months with 0 count
        String[] monthNames = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        List<MonthlyAnalyticsDto> analytics = java.util.stream.IntStream.range(0, 12)
                .mapToObj(i -> new MonthlyAnalyticsDto(monthNames[i], 0L))
                .collect(Collectors.toList());
                
        // Populate actual data
        for (Object[] row : results) {
            Integer month = (Integer) row[0]; // 1 to 12
            Long count = ((Number) row[1]).longValue();
            
            analytics.get(month - 1).setCount(count);
        }
        
        return analytics;
    }
    
    @Override
    public String changeUserRole(String email) {

        UserEntity user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if ("ADMIN".equals(user.getRole())) {
            user.setRole("USER");
            userRepo.save(user);
            return "Admin to user successfully";
        }
        else {
        	user.setRole("ADMIN");
        	userRepo.save(user);
        	return "user change to admin successfully";
        }
        
    }

    @Override
    public List<UserEntity> getAllNormalUsers() {

        return  userRepo.findAll();
                
      
    }

    @Override
    public void deleteUserByAdmin(Long userId, String adminEmail) {

        UserEntity admin = userRepo.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        UserEntity user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ❌ Prevent deleting yourself
        if (admin.getId().equals(user.getId())) {
            throw new RuntimeException("You cannot delete your own account");
        }

        // ❌ Prevent deleting another admin
        if ("ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Cannot delete another admin");
        }

        // 🧹 Delete user's logs first
        logRepo.deleteByUserId(userId);

        // ❌ Delete user
        userRepo.delete(user);
    }
}
    
    
    


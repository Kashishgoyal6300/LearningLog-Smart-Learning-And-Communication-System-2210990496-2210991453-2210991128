package com.Learningsite.learningsite.scheduler;

import com.Learningsite.learningsite.entity.UserEntity;
import com.Learningsite.learningsite.repository.LearningLogRepository;
import com.Learningsite.learningsite.repository.UserRepository;
import com.Learningsite.learningsite.service.MailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class DailyReminderScheduler {

    @Autowired
    private MailService mailService;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private LearningLogRepository logRepo;

    // Runs daily at 5:30 PM server time
    @Scheduled(cron = "0 30 17 * * ?")
    public void sendDailyReminder() {
        LocalDate today = LocalDate.now();

        // 1) IDs of users who logged today
        List<Long> loggedUserIds = logRepo.findDistinctUserIdsByDate(today);

        // 2) Users who haven't logged today
        List<UserEntity> pending;
        if (loggedUserIds.isEmpty()) {
            pending = userRepo.findAll();
        } else {
            pending = userRepo.findUsersWhoDidNotLogToday(loggedUserIds);
        }

        // 3) send mail
        for (UserEntity user : pending) {
            String body = "Hi " + user.getName() + ",\n\nPlease update your learning log for today.";
            mailService.sendReminder(user.getEmail(), "Daily Learning Reminder", body);
        }

        System.out.println("Sent reminders to " + pending.size() + " users who did not log today.");
    }
}

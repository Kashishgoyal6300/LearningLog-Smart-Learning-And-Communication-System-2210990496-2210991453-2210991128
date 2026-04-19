package com.Learningsite.learningsite.service.impl;

import com.Learningsite.learningsite.dto.*;
import com.Learningsite.learningsite.entity.LearningLogEntity;
import com.Learningsite.learningsite.entity.LogEditHistoryEntity;
import com.Learningsite.learningsite.entity.UserEntity;
import com.Learningsite.learningsite.repository.LearningLogRepository;
import com.Learningsite.learningsite.repository.LogEditHistoryRepository;
import com.Learningsite.learningsite.repository.UserRepository;
import com.Learningsite.learningsite.service.LearningLogService;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LearningLogServiceImpl implements LearningLogService {

    @Autowired
    private LearningLogRepository logRepo;
    
    @Autowired
    private LogEditHistoryRepository historyRepo;

    @Autowired
    private UserRepository userRepo;

    // ----------------- DTO Helper -----------------
    private LogResponseDto toDto(LearningLogEntity log) {
        return new LogResponseDto(
                log.getId(),
                log.getDate().toString(),
                log.getTitle(),
                log.getDescription(),
                log.getTag()
        );
    }

    // ---------------- CREATE LOG ----------------------
    @Override
    public LogResponseDto createLog(CreateLogDto dto, String userEmail) {

        UserEntity user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDate logDate = LocalDate.parse(dto.getDate());
        LocalDate today = LocalDate.now();

        if (!logDate.equals(today)) {
            throw new RuntimeException("You can only create logs for TODAY");
        }

        LearningLogEntity log = new LearningLogEntity();
        log.setUser(user);
        log.setDate(logDate);
        log.setTitle(dto.getTitle());
        log.setDescription(dto.getDescription());
        log.setTag(dto.getTag());

        logRepo.save(log);

        return toDto(log);
    }

    // ---------------- GET LOGS BY DATE ----------------
    @Override
    public List<LogResponseDto> getLogsForDate(String date, String userEmail) {

        UserEntity user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDate selectedDate = LocalDate.parse(date);

        return logRepo.findByUserAndDate(user, selectedDate)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // ---------------- GET ALL LOGS FOR USER ----------------
    @Override
    public List<LogResponseDto> getAllLogsForUser(String userEmail) {

        UserEntity user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return logRepo.findByUser(user)
                .stream()
                .sorted(Comparator.comparing(LearningLogEntity::getDate).reversed())
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // ---------------- UPDATE LOG ----------------
    @Override
    @Transactional
    public LogResponseDto updateLog(Long id, UpdateLogDto dto, String userEmail) {

        LearningLogEntity log = logRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Log not found"));

        if (!log.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("You cannot edit this log.");
        }

//        long daysPassed = ChronoUnit.DAYS.between(log.getDate(), LocalDate.now());
//        if (daysPassed > 7) {
//            throw new RuntimeException("You cannot edit logs older than 7 days.");
//        }

       
        LogEditHistoryEntity history = new LogEditHistoryEntity();
        history.setLogId(log.getId());
        history.setEditedBy(userEmail);
        history.setEditedAt(LocalDateTime.now());

        history.setOldTitle(log.getTitle());
        history.setOldDescription(log.getDescription());
        history.setOldTag(log.getTag());

        history.setNewTitle(dto.getTitle());
        history.setNewDescription(dto.getDescription());
        history.setNewTag(dto.getTag());

        historyRepo.save(history);

        // 🔥 Now update main log
        log.setTitle(dto.getTitle());
        log.setDescription(dto.getDescription());
        log.setTag(dto.getTag());

        logRepo.save(log);

        return toDto(log);
    }
    // ---------------- DELETE LOG ----------------
    @Override
    public void deleteLog(Long id, String userEmail) {

        LearningLogEntity log = logRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Log not found"));

        if (!log.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("You cannot delete this log.");
        }

        logRepo.delete(log);
    }

    // ---------------- ADMIN: GET ALL LOGS ----------------
    @Override
    public List<LogResponseDto> getAllLogsAdmin() {
        return logRepo.findAll()
                .stream()
                .sorted(Comparator.comparing(LearningLogEntity::getDate).reversed())
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // ---------------- CALENDAR: GET ALL DATES WITH LOGS ----------------
    @Override
    public List<String> getCalendarDates(String month, String userEmail) {

        UserEntity user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String[] parts = month.split("-");
        int year = Integer.parseInt(parts[0]);
        int monthNum = Integer.parseInt(parts[1]);

        return logRepo.findByUser(user)
                .stream()
                .filter(log -> log.getDate().getYear() == year &&
                        log.getDate().getMonthValue() == monthNum)
                .map(log -> log.getDate().toString())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }
}

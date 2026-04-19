package com.Learningsite.learningsite.repository;

import com.Learningsite.learningsite.entity.LearningLogEntity;
import com.Learningsite.learningsite.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface LearningLogRepository extends JpaRepository<LearningLogEntity, Long> {

    // Get logs of a user
    List<LearningLogEntity> findByUser(UserEntity user);

    // Get logs of a user for a specific date (for calendar)
    List<LearningLogEntity> findByUserAndDate(UserEntity user, LocalDate date);

    // new efficient method
    @Query("select distinct l.user.id from LearningLogEntity l where l.date = :date")
    List<Long> findDistinctUserIdsByDate(@Param("date") LocalDate date);

    @Query("SELECT DISTINCT l.user.id FROM LearningLogEntity l WHERE l.date = :today")
    List<Long> findUserIdsWhoLoggedToday(LocalDate today);
    
    long countByUserId(Long userId);

    long countByUserIdAndDateBetween(
            Long userId,
            LocalDate start,
            LocalDate end
    );

    long countDistinctByUserIdAndDateBetween(
            Long userId,
            LocalDate start,
            LocalDate end
    );

    @Query("""
        SELECT DISTINCT l.date
        FROM LearningLogEntity l
        WHERE l.user.id = :userId
        ORDER BY l.date DESC
    """)
    List<LocalDate> findDistinctLogDates(@Param("userId") Long userId);

    void deleteByUserId(Long userId);
    
}

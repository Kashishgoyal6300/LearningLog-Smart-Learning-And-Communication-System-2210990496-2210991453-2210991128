package com.Learningsite.learningsite.repository;

import com.Learningsite.learningsite.entity.ReminderLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReminderLogRepository extends JpaRepository<ReminderLogEntity, Long> {

    // Custom query to aggregate reminder counts grouped by month (1 to 12) for a specific year
    @Query("SELECT MONTH(r.sentAt) as month, COUNT(r) as count " +
           "FROM ReminderLogEntity r " +
           "WHERE YEAR(r.sentAt) = :year " +
           "GROUP BY MONTH(r.sentAt) " +
           "ORDER BY month ASC")
    List<Object[]> countRemindersByMonthForYear(@Param("year") int year);
}

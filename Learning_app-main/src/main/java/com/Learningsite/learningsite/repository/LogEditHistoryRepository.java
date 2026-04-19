package com.Learningsite.learningsite.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Learningsite.learningsite.entity.LogEditHistoryEntity;



@Repository
public interface LogEditHistoryRepository 
        extends JpaRepository<LogEditHistoryEntity, Long> {

    List<LogEditHistoryEntity> 
        findByLogIdOrderByEditedAtDesc(Long logId);
}

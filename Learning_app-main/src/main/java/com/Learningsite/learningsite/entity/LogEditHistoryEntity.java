package com.Learningsite.learningsite.entity;

import java.time.LocalDateTime;

import org.springframework.boot.convert.DataSizeUnit;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;
@Entity
@Data
public class LogEditHistoryEntity {

	
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long logId;

    private String editedBy;

    private LocalDateTime editedAt;

    private String oldTitle;
    private String newTitle;

    @Column(columnDefinition = "TEXT")
    private String oldDescription;

    @Column(columnDefinition = "TEXT")
    private String newDescription;

    private String oldTag;
    private String newTag;
}
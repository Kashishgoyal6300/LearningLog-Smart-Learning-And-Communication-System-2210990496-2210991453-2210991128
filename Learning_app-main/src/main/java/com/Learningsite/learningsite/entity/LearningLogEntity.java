package com.Learningsite.learningsite.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "learning_logs")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class LearningLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The user who created this log
    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity user;

    // Learning date (used for calendar)
    private LocalDate date;

    // What was learned
    private String title;

    // More information
    private String description;

    // Optional tag (e.g. Java, React, Spring)
    private String tag;
}

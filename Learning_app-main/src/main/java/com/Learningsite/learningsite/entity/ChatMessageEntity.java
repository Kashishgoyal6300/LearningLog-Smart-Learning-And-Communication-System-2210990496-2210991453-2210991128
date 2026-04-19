package com.Learningsite.learningsite.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages_v2")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ChatMessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // "room" will be the email of the regular user
    @Column(name = "room", nullable = false)
    private String room;

    @Column(name = "sender_email", nullable = false)
    private String senderEmail;

    // "USER" or "ADMIN"
    @Column(name = "sender_role", nullable = false)
    private String senderRole;

    @Column(name = "content", nullable = false, length = 1000)
    private String content;

    @Column(name = "timestamp", nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
    }
}

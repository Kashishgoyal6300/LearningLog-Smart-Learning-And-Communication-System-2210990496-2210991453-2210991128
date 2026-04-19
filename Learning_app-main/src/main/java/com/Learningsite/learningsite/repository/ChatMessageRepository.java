package com.Learningsite.learningsite.repository;

import com.Learningsite.learningsite.entity.ChatMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, Long> {
    
    // Find all messages for a specific room (userEmail), ordered by timestamp
    List<ChatMessageEntity> findByRoomOrderByTimestampAsc(String room);
}

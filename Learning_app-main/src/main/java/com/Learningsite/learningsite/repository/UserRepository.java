package com.Learningsite.learningsite.repository;

import com.Learningsite.learningsite.entity.UserEntity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByName(String name);

    // Users who did NOT log today
    @Query("""
        SELECT u 
        FROM UserEntity u 
        WHERE (:loggedUserIds IS NULL OR u.id NOT IN :loggedUserIds)
    """)
    List<UserEntity> findUsersWhoDidNotLogToday(@Param("loggedUserIds") List<Long> loggedUserIds);

    Optional<UserEntity> findById(Long id);
    void deleteById(Long id);

}

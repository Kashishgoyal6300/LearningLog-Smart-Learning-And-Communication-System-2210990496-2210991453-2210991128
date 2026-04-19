package com.Learningsite.learningsite.repository;

import com.Learningsite.learningsite.entity.AdminEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRepository extends JpaRepository<AdminEntity, Long> {

    AdminEntity findByEmail(String email);

    boolean existsByEmail(String email);
}

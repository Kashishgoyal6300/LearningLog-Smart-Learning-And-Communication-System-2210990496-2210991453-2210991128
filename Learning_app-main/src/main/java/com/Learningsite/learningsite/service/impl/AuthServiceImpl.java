package com.Learningsite.learningsite.service.impl;

import com.Learningsite.learningsite.dto.LoginDto;
import com.Learningsite.learningsite.dto.SignupDto;
import com.Learningsite.learningsite.entity.UserEntity;
import com.Learningsite.learningsite.repository.UserRepository;
import com.Learningsite.learningsite.security.JwtUtil;
import com.Learningsite.learningsite.service.AuthService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository repo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // ---------------------- SIGNUP -------------------------
    @Override
    public String signup(SignupDto dto) {

        // Check duplicate email
        if (repo.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Check duplicate username
        if (repo.existsByName(dto.getName())) {
            throw new RuntimeException("Username already exists");
        }

        // Create user entity
        UserEntity user = new UserEntity();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword())); // hash password
        user.setRole("USER");

        // Save user
        repo.save(user);

        // Generate JWT
        return jwtUtil.generateToken(user.getEmail());
    }

    // ---------------------- LOGIN -------------------------
    @Override
    public String login(LoginDto dto) {

        // Validate email
        UserEntity user = repo.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email"));

        // Validate password
        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        // Generate JWT
        return jwtUtil.generateToken(user.getEmail());
    }
}

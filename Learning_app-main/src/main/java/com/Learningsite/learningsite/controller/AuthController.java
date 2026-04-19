package com.Learningsite.learningsite.controller;

import com.Learningsite.learningsite.dto.AuthResponse;
import com.Learningsite.learningsite.dto.LoginDto;
import com.Learningsite.learningsite.dto.SignupDto;
import com.Learningsite.learningsite.entity.UserEntity;
import com.Learningsite.learningsite.repository.UserRepository;
import com.Learningsite.learningsite.service.AuthService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository repo;

    // ------------------ SIGNUP ----------------------
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody SignupDto dto) {

        String token = authService.signup(dto);

        UserEntity user = repo.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found after signup"));

        return ResponseEntity.ok(new AuthResponse(token, user.getRole()));
    }

    // ------------------ LOGIN -----------------------
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginDto dto) {

        String token = authService.login(dto);

        UserEntity user = repo.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(new AuthResponse(token, user.getRole()));
    }
}

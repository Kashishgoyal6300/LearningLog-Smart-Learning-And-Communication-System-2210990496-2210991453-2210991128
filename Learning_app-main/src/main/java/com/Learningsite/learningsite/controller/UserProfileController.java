package com.Learningsite.learningsite.controller;

import com.Learningsite.learningsite.dto.ChangePasswordRequest;
import com.Learningsite.learningsite.dto.UpdateProfileRequest;
import com.Learningsite.learningsite.dto.UpdateProfileRequest;
import com.Learningsite.learningsite.entity.UserEntity;
import com.Learningsite.learningsite.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:5173")
public class UserProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ✅ GET PROFILE (NO PASSWORD)
    @GetMapping
    public UserEntity getProfile(Authentication authentication) {
        String email = authentication.getName();

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(null); // IMPORTANT
        return user;
    }

    // ✅ UPDATE NAME / EMAIL
    @PutMapping
    public UserEntity updateProfile(
            Authentication authentication,
            @RequestBody UpdateProfileRequest request
    ) {
        String email = authentication.getName();

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            user.setEmail(request.getEmail());
        }

        userRepository.save(user);

        user.setPassword(null);
        return user;
    }

    // ✅ CHANGE PASSWORD (SET NEW PASSWORD)
    @PutMapping("/password")
    public String changePassword(
            Authentication authentication,
            @RequestBody ChangePasswordRequest request
    ) {
        String email = authentication.getName();

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return "Password updated successfully";
    }
}

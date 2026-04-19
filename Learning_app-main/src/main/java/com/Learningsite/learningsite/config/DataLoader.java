package com.Learningsite.learningsite.config;

import com.Learningsite.learningsite.entity.UserEntity;
import com.Learningsite.learningsite.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {

        // Check if admin already exists
        if (!userRepository.findByEmail("director123@gmail.com").isPresent()) {

            UserEntity admin = new UserEntity();
            admin.setName("Director");
            admin.setEmail("director123@gmail.com");
            admin.setPassword(passwordEncoder.encode("directortest123"));
            admin.setRole("ADMIN");

            userRepository.save(admin);

            System.out.println("✔ Default admin created: director123@gmail.com/directortest123");
        } else {
            System.out.println("✔ Admin already exists. Skipping creation.");
        }
    }
}

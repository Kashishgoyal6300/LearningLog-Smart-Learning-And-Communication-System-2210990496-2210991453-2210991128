package com.Learningsite.learningsite.service;

import com.Learningsite.learningsite.dto.LoginDto;
import com.Learningsite.learningsite.dto.SignupDto;

public interface AuthService {
    String signup(SignupDto dto);
    String login(LoginDto dto);
}

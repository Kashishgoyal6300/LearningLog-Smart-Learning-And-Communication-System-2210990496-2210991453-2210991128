package com.Learningsite.learningsite.service;

public interface MailService {
    void sendReminder(String to, String subject, String body);
}

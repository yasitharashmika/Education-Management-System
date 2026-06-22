package com.example.emsbackend.service;

public interface EmailService {
    void sendAccountCreationEmail(String toEmail, String fullName, String customUserId, String tempPassword, String role);
    void sendPasswordResetEmail(String toEmail, String fullName, String tempPassword);
}
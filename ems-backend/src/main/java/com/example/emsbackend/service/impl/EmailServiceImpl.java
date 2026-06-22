package com.example.emsbackend.service.impl;

import com.example.emsbackend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String systemEmail;

    @Override
    public void sendAccountCreationEmail(String toEmail, String fullName, String customUserId, String tempPassword, String role) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(systemEmail);
        message.setTo(toEmail);
        message.setSubject("Welcome to Nexus Institute of Technology - Account Credentials");

        String body = "Dear " + fullName + ",\n\n"
                + "Welcome to the Nexus Institute of Technology! Your " + role + " account has been successfully created.\n\n"
                + "Here are your login credentials for the Education Management System:\n"
                + "-------------------------------------------------\n"
                + "User ID: " + customUserId + "\n"
                + "Login Email: " + toEmail + "\n"
                + "Temporary Password: " + tempPassword + "\n"
                + "-------------------------------------------------\n\n"
                + "For security purposes, you will be required to change your password upon your first login.\n\n"
                + "Best regards,\n"
                + "System Administrator\n"
                + "Nexus Institute of Technology";

        message.setText(body);
        mailSender.send(message);
    }

    // --- NEW: PASSWORD RESET EMAIL LOGIC ---
    @Override
    public void sendPasswordResetEmail(String toEmail, String fullName, String tempPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(systemEmail);
        message.setTo(toEmail);
        message.setSubject("Security Alert: Your Password Has Been Reset");

        String body = "Dear " + fullName + ",\n\n"
                + "An administrator has reset your password for the Nexus Education Management System.\n\n"
                + "Your new temporary password is: " + tempPassword + "\n\n"
                + "Please log in and change this password immediately.\n\n"
                + "Best regards,\n"
                + "System Administrator\n"
                + "Nexus Institute of Technology";

        message.setText(body);
        mailSender.send(message);
    }
}
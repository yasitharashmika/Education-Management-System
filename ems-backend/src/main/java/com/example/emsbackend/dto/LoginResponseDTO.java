package com.example.emsbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponseDTO {
    private String message;
    private String fullName;
    private String role;
    private Integer userId;
    private String customUserId; // <-- NEW: Added this to the DTO
    private boolean requiresPasswordChange;
}
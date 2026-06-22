package com.example.emsbackend.dto;

import lombok.Data;

@Data
public class UpdateUserDTO {
    private String fullName;
    private String email;
    private String role;
    private String newPassword;
    private String degreeProgram; // <-- NEW
}
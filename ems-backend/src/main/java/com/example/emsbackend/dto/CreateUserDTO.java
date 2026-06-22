package com.example.emsbackend.dto;

import lombok.Data;

@Data
public class CreateUserDTO {
    private String fullName;
    private String email;
    private String password;
    private String role;
    private String department;
    private String degreeProgram; // <-- NEW
}
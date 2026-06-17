package com.example.emsbackend.dto;

import lombok.Data;

@Data
public class FacultyRequestDTO {
    private Integer departmentId;
    private String firstName;
    private String lastName;
    private String email;
    private String designation;
}
package com.example.emsbackend.dto;

import lombok.Data;

@Data
public class StudentRequestDTO {
    private Integer departmentId;
    private String firstName;
    private String lastName;
    private String email;
    private Integer enrollmentYear;
}
package com.example.emsbackend.dto;

import lombok.Data;

@Data
public class StudentProfileDTO {
    private String fullName;
    private String email;
    private String degreeProgram;
    private String currentAcademicYear;
    private String currentSemester;
}
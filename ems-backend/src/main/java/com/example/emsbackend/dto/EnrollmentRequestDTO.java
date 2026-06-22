package com.example.emsbackend.dto;

import lombok.Data;

@Data
public class EnrollmentRequestDTO {
    private Integer studentId;
    private Integer courseId;
    private Integer facultyId;
    private String academicYear;
    private String semester;
}
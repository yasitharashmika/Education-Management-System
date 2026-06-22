package com.example.emsbackend.dto;

import lombok.Data;

@Data
public class CourseDTO {
    private String courseCode;
    private String courseName;
    private Integer credits;
    private String academicYear;
    private String semester;
    private String department;
}
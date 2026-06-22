package com.example.emsbackend.dto;

import lombok.Data;

@Data
public class CourseAllocationViewDTO {
    private Integer courseId;
    private String courseCode;
    private String courseName;
    private String academicYear;
    private String semester;
    private String department;   // NEW FIELD
    private Integer facultyId;
    private String currentLecturer;
}
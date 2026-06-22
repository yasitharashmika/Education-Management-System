package com.example.emsbackend.dto;
import lombok.Data;

@Data
public class FacultyAssignmentDTO {
    private Integer courseId;
    private String courseCode;
    private String courseName;
    private String academicYear;
    private String semester;
}
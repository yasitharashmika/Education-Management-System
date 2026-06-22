package com.example.emsbackend.dto;

import lombok.Data;

@Data
public class GradeReportDTO {
    private String academicYear;
    private String semester;
    private String courseCode;
    private String courseName;
    private Integer credits;
    private Double midtermMarks;
    private Double finalMarks;
    private Double totalMarks;
    private String letterGrade;
    private Double gpaPoints;
}
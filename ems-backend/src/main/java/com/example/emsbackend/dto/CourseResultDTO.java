package com.example.emsbackend.dto;

import lombok.Data;

@Data
public class CourseResultDTO {
    private String courseCode;
    private String courseName;
    private Integer credits;
    private Double midtermMarks;
    private Double finalMarks;
    private String letterGrade;
    private Double gpaPoints;
}
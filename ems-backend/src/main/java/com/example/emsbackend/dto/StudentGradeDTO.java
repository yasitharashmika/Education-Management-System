package com.example.emsbackend.dto;

import lombok.Data;

@Data
public class StudentGradeDTO {
    private Integer studentId;
    private String studentName;
    private Double midMarks;
    private Double finalMarks;
    private String letterGrade;
}
package com.example.emsbackend.dto;
import lombok.Data;

@Data
public class GradeRosterDTO {
    private Integer studentId;
    private String indexNumber;
    private String studentName;
    private Double midtermMarks;
    private Double finalMarks;
}
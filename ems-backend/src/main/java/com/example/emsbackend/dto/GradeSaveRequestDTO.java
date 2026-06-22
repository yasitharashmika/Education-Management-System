package com.example.emsbackend.dto;
import lombok.Data;

@Data
public class GradeSaveRequestDTO {
    private Integer studentId;
    private Integer courseId;

    // --> THESE WERE MISSING! <--
    private String academicYear;
    private String semester;

    private Double midtermMarks;
    private Double finalMarks;
}
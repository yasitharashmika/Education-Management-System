package com.example.emsbackend.dto;

import lombok.Data;

@Data
public class GradeRequestDTO {
    private Integer enrollmentId;
    private Double midtermMarks;
    private Double finalMarks;
}
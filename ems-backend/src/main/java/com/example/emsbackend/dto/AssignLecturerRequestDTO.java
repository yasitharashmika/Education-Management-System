package com.example.emsbackend.dto;

import lombok.Data;

@Data
public class AssignLecturerRequestDTO {
    private Integer courseId;
    private Integer facultyId;
}
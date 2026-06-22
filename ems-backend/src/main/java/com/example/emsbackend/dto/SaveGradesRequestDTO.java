package com.example.emsbackend.dto;

import lombok.Data;
import java.util.List;

@Data
public class SaveGradesRequestDTO {
    private Integer courseId;
    private String academicYear;
    private List<StudentGradeDTO> grades;
}
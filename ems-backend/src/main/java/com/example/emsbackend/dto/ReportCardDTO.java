package com.example.emsbackend.dto;

import lombok.Data;
import java.util.List;

@Data
public class ReportCardDTO {
    private Integer studentId;
    private List<CourseResultDTO> results;
}
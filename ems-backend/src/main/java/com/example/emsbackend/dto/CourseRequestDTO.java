package com.example.emsbackend.dto;

import lombok.Data;

@Data
public class CourseRequestDTO {
    private Integer departmentId;
    private String courseCode;
    private String courseName;
    private Integer credits;
    private String semester;
}
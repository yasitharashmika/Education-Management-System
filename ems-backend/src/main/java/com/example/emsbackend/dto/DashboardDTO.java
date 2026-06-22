package com.example.emsbackend.dto;

import lombok.Data;

@Data
public class DashboardDTO {
    private Long totalStudents;
    private Long totalCourses;
    private Double totalRevenue;
}
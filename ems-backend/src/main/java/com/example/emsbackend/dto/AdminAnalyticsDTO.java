package com.example.emsbackend.dto;

import lombok.Data;
import java.util.List;

@Data
public class AdminAnalyticsDTO {
    // Top-Level KPIs from SQL Server
    private Integer totalStudents;
    private Double avgGPA;
    private Double totalRevenue;

    // Machine Learning Results from Python
    private List<Object> forecastData;
    private Object riskData;
}
package com.example.emsbackend.service.impl;

import com.example.emsbackend.dto.AdminAnalyticsDTO;
import com.example.emsbackend.service.BiAnalyticsService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BiAnalyticsServiceImpl implements BiAnalyticsService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private AdminAnalyticsDTO cachedDashboardData = null;

    @PostConstruct
    public void init() {
        System.out.println("Running initial BI Analytics calculation...");
        refreshAnalyticsCache();
    }

    @Scheduled(fixedRate = 3600000)
    public void refreshAnalyticsCache() {
        try {
            AdminAnalyticsDTO newData = new AdminAnalyticsDTO();

            // Fetch SQL KPIs
            jdbcTemplate.query("EXEC sp_GetAdminKpiMetrics", rs -> {
                newData.setTotalStudents(rs.getInt("TotalStudents"));
                newData.setAvgGPA(rs.getDouble("AvgGPA"));
                newData.setTotalRevenue(rs.getDouble("TotalRevenue"));
            });

            // ==========================================================
            // 🌟 VIVA PROOF: CALLING THE SQL VIEWS HERE! 🌟
            // ==========================================================

            // 1. Calling View 1: Student Academic Dashboard
            List<Map<String, Object>> studentRiskData = jdbcTemplate.queryForList("SELECT * FROM vw_StudentAcademicDashboard");

            // 2. Calling View 2: Course Performance Summary
            List<Map<String, Object>> coursePerformanceData = jdbcTemplate.queryForList("SELECT * FROM vw_CoursePerformanceSummary");

            // Fetch Historical Data for forecasting
            List<Map<String, Object>> enrollmentHistory = jdbcTemplate.queryForList("EXEC sp_GetAnalyticsExport");

            // Prepare the JSON payload to send to Python
            Map<String, Object> pythonPayload = new HashMap<>();
            pythonPayload.put("students", studentRiskData); // Data from View 1
            pythonPayload.put("courses", coursePerformanceData); // Data from View 2
            pythonPayload.put("history", enrollmentHistory);

            ObjectMapper mapper = new ObjectMapper();
            String jsonInput = mapper.writeValueAsString(pythonPayload);

            // Call Python
            ProcessBuilder pb = new ProcessBuilder("python", "src/main/resources/bi/bi_engine.py");
            Process process = pb.start();

            try (OutputStreamWriter writer = new OutputStreamWriter(process.getOutputStream())) {
                writer.write(jsonInput);
                writer.flush();
            }

            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            StringBuilder pythonOutput = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                pythonOutput.append(line).append("\n");
            }

            BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));
            StringBuilder errorOutput = new StringBuilder();
            while ((line = errorReader.readLine()) != null) {
                errorOutput.append(line).append("\n");
            }

            process.waitFor();
            String rawOutput = pythonOutput.toString().trim();

            if (errorOutput.length() > 0 || (!rawOutput.startsWith("{") && !rawOutput.startsWith("["))) {
                throw new RuntimeException("Python execution error.");
            }

            Map<String, Object> biResults = mapper.readValue(rawOutput, Map.class);
            if (biResults.containsKey("error")) {
                throw new RuntimeException("Python ML Error: " + biResults.get("error"));
            }

            newData.setForecastData((List<Object>) biResults.get("forecastData"));
            newData.setRiskData(biResults.get("riskData"));

            this.cachedDashboardData = newData;
            System.out.println("Background BI Analytics refresh completed successfully.");

        } catch (Exception e) {
            System.err.println("Scheduled BI refresh failed. Keeping old cached data. Reason: " + e.getMessage());
        }
    }

    @Override
    public AdminAnalyticsDTO getDashboardAnalytics() {
        if (this.cachedDashboardData == null) {
            refreshAnalyticsCache();
        }
        return this.cachedDashboardData;
    }
}
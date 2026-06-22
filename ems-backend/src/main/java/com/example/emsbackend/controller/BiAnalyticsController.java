package com.example.emsbackend.controller;

import com.example.emsbackend.dto.AdminAnalyticsDTO;
import com.example.emsbackend.service.BiAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class BiAnalyticsController {

    @Autowired
    private BiAnalyticsService biAnalyticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<AdminAnalyticsDTO> getAnalyticsDashboard() {
        return ResponseEntity.ok(biAnalyticsService.getDashboardAnalytics());
    }
}
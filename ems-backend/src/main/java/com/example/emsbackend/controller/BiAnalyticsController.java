package com.example.emsbackend.controller;

import com.example.emsbackend.service.BiAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
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

    // We specify that this returns raw JSON so the browser parses it correctly
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public String getAnalyticsDashboard() {
        return biAnalyticsService.getPythonAnalytics();
    }
}
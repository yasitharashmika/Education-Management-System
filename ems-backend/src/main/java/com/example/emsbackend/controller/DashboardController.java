package com.example.emsbackend.controller;

import com.example.emsbackend.dto.DashboardDTO;
import com.example.emsbackend.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping
    public DashboardDTO getDashboardData() {
        return dashboardService.getDashboardMetrics();
    }
}
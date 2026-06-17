package com.example.emsbackend.controller;

import com.example.emsbackend.dto.ReportCardDTO;
import com.example.emsbackend.service.ReportCardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportCardController {

    @Autowired
    private ReportCardService reportCardService;

    // We use a PathVariable here so the frontend can request /api/reports/student/6
    @GetMapping("/student/{studentId}")
    public ReportCardDTO getStudentReportCard(@PathVariable Integer studentId) {
        return reportCardService.getReportCard(studentId);
    }
}
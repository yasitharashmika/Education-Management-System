package com.example.emsbackend.service;

import com.example.emsbackend.dto.ReportCardDTO;

public interface ReportCardService {
    ReportCardDTO getReportCard(Integer studentId);
}
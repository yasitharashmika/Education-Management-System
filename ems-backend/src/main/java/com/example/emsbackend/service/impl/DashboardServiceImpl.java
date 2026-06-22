package com.example.emsbackend.service.impl;

import com.example.emsbackend.dto.DashboardDTO;
import com.example.emsbackend.repository.FeePaymentRepository;
import com.example.emsbackend.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private FeePaymentRepository feePaymentRepository;

    @Override
    public DashboardDTO getDashboardMetrics() {
        // 1. Execute the T-SQL Stored Procedure
        List<Object[]> result = feePaymentRepository.callDashboardStoredProcedure();

        // 2. Extract the first (and only) row returned by SQL Server
        Object[] row = result.get(0);

        // 3. Map the raw database numbers directly to our DTO
        DashboardDTO dashboardDTO = new DashboardDTO();
        dashboardDTO.setTotalStudents(((Number) row[0]).longValue());
        dashboardDTO.setTotalCourses(((Number) row[1]).longValue());
        dashboardDTO.setTotalRevenue(((Number) row[2]).doubleValue());

        return dashboardDTO;
    }
}
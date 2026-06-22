package com.example.emsbackend.service;

import com.example.emsbackend.dto.FeePaymentRequestDTO;
import com.example.emsbackend.entity.FeePayment;

import java.util.List;
import java.util.Map;

public interface FeePaymentService {
    List<FeePayment> getAllPayments();
    FeePayment savePayment(FeePaymentRequestDTO dto);

    // --- NEW ENDPOINTS FOR FRONTEND DATA ---
    List<FeePayment> getStudentPayments(Integer systemUserId);
    Map<String, Object> getStudentSummary(Integer systemUserId);
}
package com.example.emsbackend.service;

import com.example.emsbackend.dto.FeePaymentRequestDTO;
import com.example.emsbackend.entity.FeePayment;
import java.util.List;

public interface FeePaymentService {
    List<FeePayment> getAllPayments();
    FeePayment savePayment(FeePaymentRequestDTO paymentDTO);
}
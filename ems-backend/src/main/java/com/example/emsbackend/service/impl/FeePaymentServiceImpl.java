package com.example.emsbackend.service.impl;

import com.example.emsbackend.dto.FeePaymentRequestDTO;
import com.example.emsbackend.entity.FeePayment;
import com.example.emsbackend.repository.FeePaymentRepository;
import com.example.emsbackend.service.FeePaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class FeePaymentServiceImpl implements FeePaymentService {

    @Autowired
    private FeePaymentRepository feePaymentRepository;

    @Override
    public List<FeePayment> getAllPayments() {
        return feePaymentRepository.findAll();
    }

    @Override
    public FeePayment savePayment(FeePaymentRequestDTO dto) {
        // 1. Execute the T-SQL Procedure to handle logic and Audit Logging securely
        feePaymentRepository.recordFeePaymentProc(
                dto.getStudentId(),
                dto.getAmount(),
                dto.getPaymentMethod()
        );

        // 2. Return a placeholder entity
        FeePayment payment = new FeePayment();
        payment.setStudentId(dto.getStudentId());
        payment.setAmount(dto.getAmount());
        payment.setPaymentMethod(dto.getPaymentMethod());
        payment.setPaymentDate(new Date());

        return payment;
    }
}
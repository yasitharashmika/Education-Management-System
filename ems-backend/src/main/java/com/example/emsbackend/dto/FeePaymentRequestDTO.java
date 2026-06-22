package com.example.emsbackend.dto;

import lombok.Data;

@Data
public class FeePaymentRequestDTO {
    private Integer studentId;
    private Double amount;
    private String paymentMethod;
}
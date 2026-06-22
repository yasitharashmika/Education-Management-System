package com.example.emsbackend.dto;

import lombok.Data;

@Data
public class PaymentHashResponseDTO {
    private String merchantId;
    private String orderId;
    private String hash;
    private String formattedAmount;
    private String currency;
}
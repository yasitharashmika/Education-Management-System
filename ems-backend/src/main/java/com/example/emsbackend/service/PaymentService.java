package com.example.emsbackend.service;

import com.example.emsbackend.dto.PayHereNotificationDTO;
import com.example.emsbackend.dto.PaymentHashResponseDTO;

public interface PaymentService {
    PaymentHashResponseDTO generatePaymentHash(Double amount, String currency);
    boolean verifyWebhookSignature(PayHereNotificationDTO notification);
}
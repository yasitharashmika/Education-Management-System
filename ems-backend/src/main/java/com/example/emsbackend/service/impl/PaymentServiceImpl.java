package com.example.emsbackend.service.impl;

import com.example.emsbackend.dto.PayHereNotificationDTO;
import com.example.emsbackend.dto.PaymentHashResponseDTO;
import com.example.emsbackend.service.PaymentService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.DecimalFormat;
import java.util.UUID;

@Service
public class PaymentServiceImpl implements PaymentService {

    // Spring Boot will automatically inject these from application.properties
    @Value("${payhere.merchant.id}")
    private String MERCHANT_ID;

    @Value("${payhere.merchant.secret}")
    private String MERCHANT_SECRET;

    @Override
    public PaymentHashResponseDTO generatePaymentHash(Double amount, String currency) {
        DecimalFormat df = new DecimalFormat("0.00");
        String formattedAmount = df.format(amount);

        // Generate a unique Order ID for this transaction
        String orderId = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // Generate the secure MD5 Hash according to PayHere documentation
        String hashedSecret = getMd5(MERCHANT_SECRET).toUpperCase();
        String hashString = MERCHANT_ID + orderId + formattedAmount + currency + hashedSecret;
        String finalHash = getMd5(hashString).toUpperCase();

        // Build the response object for React
        PaymentHashResponseDTO response = new PaymentHashResponseDTO();
        response.setMerchantId(MERCHANT_ID);
        response.setOrderId(orderId);
        response.setHash(finalHash);
        response.setFormattedAmount(formattedAmount);
        response.setCurrency(currency);

        return response;
    }

    @Override
    public boolean verifyWebhookSignature(PayHereNotificationDTO notification) {
        // This verifies that the "Success" message actually came from PayHere and not a hacker
        String hashedSecret = getMd5(MERCHANT_SECRET).toUpperCase();
        String expectedHashString = MERCHANT_ID + notification.getOrder_id() +
                notification.getPayhere_amount() +
                notification.getPayhere_currency() +
                notification.getStatus_code() + hashedSecret;

        String expectedHash = getMd5(expectedHashString).toUpperCase();
        return expectedHash.equals(notification.getMd5sig());
    }

    // Helper method to generate MD5 Hashes
    private String getMd5(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] messageDigest = md.digest(input.getBytes());
            BigInteger no = new BigInteger(1, messageDigest);
            String hashtext = no.toString(16);
            while (hashtext.length() < 32) {
                hashtext = "0" + hashtext;
            }
            return hashtext;
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("MD5 hashing failed", e);
        }
    }
}
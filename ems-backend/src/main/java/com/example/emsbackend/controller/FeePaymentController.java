package com.example.emsbackend.controller;

import com.example.emsbackend.dto.FeePaymentRequestDTO;
import com.example.emsbackend.entity.FeePayment;
import com.example.emsbackend.service.FeePaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fees")
@CrossOrigin(origins = "http://localhost:3000") // Secure CORS for your React app
public class FeePaymentController {

    @Autowired
    private FeePaymentService feePaymentService;

    @GetMapping
    public List<FeePayment> getAllPayments() {
        return feePaymentService.getAllPayments();
    }

    @PostMapping
    public FeePayment makePayment(@RequestBody FeePaymentRequestDTO paymentDTO) {
        return feePaymentService.savePayment(paymentDTO);
    }

    // --- NEW: Expose the History Endpoint ---
    @GetMapping("/student/{systemUserId}")
    public ResponseEntity<?> getStudentPayments(@PathVariable Integer systemUserId) {
        try {
            return ResponseEntity.ok(feePaymentService.getStudentPayments(systemUserId));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    // --- NEW: Expose the Summary Endpoint ---
    @GetMapping("/summary/{systemUserId}")
    public ResponseEntity<?> getStudentSummary(@PathVariable Integer systemUserId) {
        try {
            return ResponseEntity.ok(feePaymentService.getStudentSummary(systemUserId));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }
}
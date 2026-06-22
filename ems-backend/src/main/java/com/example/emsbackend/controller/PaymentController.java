package com.example.emsbackend.controller;

import com.example.emsbackend.dto.PayHereNotificationDTO;
import com.example.emsbackend.dto.PaymentHashResponseDTO;
import com.example.emsbackend.dto.StudentSummaryDTO; // NEW IMPORT
import com.example.emsbackend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // 1. Generate Secure Hash for PayHere
    @GetMapping("/generate-hash")
    public ResponseEntity<PaymentHashResponseDTO> getPaymentHash(
            @RequestParam Double amount,
            @RequestParam(defaultValue = "LKR") String currency) {
        return ResponseEntity.ok(paymentService.generatePaymentHash(amount, currency));
    }

    // 2. PayHere Webhook (Background secure notification)
    @PostMapping("/notify")
    public ResponseEntity<String> handlePayHereWebhook(@ModelAttribute PayHereNotificationDTO notification) {
        boolean isValid = paymentService.verifyWebhookSignature(notification);
        if (!isValid) return ResponseEntity.status(400).body("Invalid Signature");
        return ResponseEntity.ok("Received");
    }

    // 3. Fetch past payment history for the table
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Map<String, Object>>> getStudentPayments(@PathVariable Integer studentId) {
        String sql = "SELECT PaymentID, Amount, PaymentDate, PaymentMethod, Status " +
                "FROM FeePayment WHERE StudentID = ? ORDER BY PaymentDate DESC";

        List<Map<String, Object>> history = jdbcTemplate.queryForList(sql, studentId);
        return ResponseEntity.ok(history);
    }

    // 4. NEW: Fetch dynamic financial summary using the Stored Procedure
    @GetMapping("/summary/{studentId}")
    public ResponseEntity<StudentSummaryDTO> getStudentSummary(@PathVariable Integer studentId) {
        String sql = "EXEC sp_GetStudentFinancialSummary ?";

        StudentSummaryDTO summary = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
            StudentSummaryDTO dto = new StudentSummaryDTO();
            dto.setTotalPaid(rs.getDouble("TotalPaid"));
            dto.setPendingBalance(rs.getDouble("PendingBalance"));
            return dto;
        }, studentId);

        return ResponseEntity.ok(summary);
    }
}
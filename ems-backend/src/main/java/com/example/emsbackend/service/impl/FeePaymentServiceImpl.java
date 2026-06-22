package com.example.emsbackend.service.impl;

import com.example.emsbackend.dto.FeePaymentRequestDTO;
import com.example.emsbackend.entity.FeePayment;
import com.example.emsbackend.repository.FeePaymentRepository;
import com.example.emsbackend.service.FeePaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FeePaymentServiceImpl implements FeePaymentService {

    @Autowired
    private FeePaymentRepository feePaymentRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public List<FeePayment> getAllPayments() {
        return feePaymentRepository.findAll();
    }

    @Override
    public FeePayment savePayment(FeePaymentRequestDTO dto) {
        Integer trueStudentId = resolveStudentId(dto.getStudentId());

        feePaymentRepository.recordFeePaymentProc(
                trueStudentId,
                dto.getAmount(),
                dto.getPaymentMethod()
        );

        FeePayment payment = new FeePayment();
        payment.setStudentId(trueStudentId);
        payment.setAmount(dto.getAmount());
        payment.setPaymentMethod(dto.getPaymentMethod());
        payment.setPaymentDate(new Date());

        return payment;
    }

    // --- NEW: Fetch only the specific student's payments ---
    @Override
    public List<FeePayment> getStudentPayments(Integer systemUserId) {
        Integer trueStudentId = resolveStudentId(systemUserId);

        // We filter the list in memory to guarantee it works without needing to change your Repository file
        return feePaymentRepository.findAll().stream()
                .filter(payment -> trueStudentId.equals(payment.getStudentId()))
                .toList();
    }

    // --- NEW: Calculate the total amount paid directly from SQL Server ---
    @Override
    public Map<String, Object> getStudentSummary(Integer systemUserId) {
        Integer trueStudentId = resolveStudentId(systemUserId);

        String sql = "SELECT ISNULL(SUM(Amount), 0) FROM FeePayment WHERE StudentID = ?";
        Double totalPaid = jdbcTemplate.queryForObject(sql, Double.class, trueStudentId);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalPaid", totalPaid);
        return summary;
    }

    // --- DEBUGGING HELPER METHOD ---
    private Integer resolveStudentId(Integer systemUserId) {
        if (systemUserId == null) {
            throw new RuntimeException("ERROR: React sent a NULL User ID!");
        }

        String email;
        try {
            email = jdbcTemplate.queryForObject("SELECT Email FROM SystemUser WHERE UserId = ?", String.class, systemUserId);
        } catch (EmptyResultDataAccessException e) {
            throw new RuntimeException("Invalid Account ID sent from frontend.");
        }

        try {
            return jdbcTemplate.queryForObject("SELECT StudentID FROM Student WHERE Email = ?", Integer.class, email);
        } catch (EmptyResultDataAccessException e) {
            throw new RuntimeException("Action denied: No Student profile found for email '" + email + "'. Only registered students can perform this action.");
        }
    }
}
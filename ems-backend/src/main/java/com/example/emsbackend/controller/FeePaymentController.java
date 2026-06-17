package com.example.emsbackend.controller;

import com.example.emsbackend.dto.FeePaymentRequestDTO;
import com.example.emsbackend.entity.FeePayment;
import com.example.emsbackend.service.FeePaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fees")
@CrossOrigin(origins = "*")
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
}
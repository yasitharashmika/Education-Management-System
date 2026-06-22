package com.example.emsbackend.dto;

import lombok.Data;

@Data
public class StudentSummaryDTO {
    private Double totalPaid;
    private Double pendingBalance;
}
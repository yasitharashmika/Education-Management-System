package com.example.emsbackend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;

@Entity
@Data
@Table(name = "FeePayment")
public class FeePayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PaymentID")
    private Integer paymentId;

    @Column(name = "StudentID")
    private Integer studentId;

    @Column(name = "Amount")
    private Double amount;

    @Column(name = "PaymentDate")
    @Temporal(TemporalType.DATE)
    private Date paymentDate;

    @Column(name = "PaymentMethod")
    private String paymentMethod;
}
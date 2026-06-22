package com.example.emsbackend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "SystemUser")
public class SystemUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userId;

    @Column(name = "CustomUserId")
    private String customUserId; // ADD THIS LINE

    private String fullName;
    private String email;
    private String password;
    private String role;
}
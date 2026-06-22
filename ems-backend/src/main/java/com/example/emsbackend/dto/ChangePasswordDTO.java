package com.example.emsbackend.dto;

import lombok.Data;

@Data
public class ChangePasswordDTO {
    private Integer userId;
    private String newPassword;
}
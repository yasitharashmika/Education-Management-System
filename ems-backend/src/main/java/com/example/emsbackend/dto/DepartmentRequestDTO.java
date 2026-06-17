package com.example.emsbackend.dto;

import lombok.Data;

@Data
public class DepartmentRequestDTO {
    private String deptName;
    private String hod;
    private String building;
    private Integer establishedYear;
}
package com.example.emsbackend.dto;

import lombok.Data;

@Data
public class LecturerDropdownDTO {
    private Integer facultyId;
    private String lecturerName;
    private String departmentName;
}
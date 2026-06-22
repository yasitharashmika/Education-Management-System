package com.example.emsbackend.dto;
import lombok.Data;

@Data
public class AttendanceSaveRequestDTO {
    private Integer enrollmentId;
    private String attendanceDate; // using String (YYYY-MM-DD) for easier SQL parsing
    private String status;
}
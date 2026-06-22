package com.example.emsbackend.dto;

import lombok.Data;

@Data
public class AttendanceDTO {
    private String attendanceDate;
    private String courseCode;
    private String courseName;
    private String status;
}
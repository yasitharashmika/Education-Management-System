package com.example.emsbackend.dto;
import lombok.Data;

@Data
public class AttendanceRosterDTO {
    private Integer enrollmentId;
    private Integer studentId;
    private String indexNumber;
    private String studentName;
    private String status;
}
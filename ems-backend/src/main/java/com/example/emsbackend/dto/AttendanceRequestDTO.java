package com.example.emsbackend.dto;

import lombok.Data;
import java.util.Date;

@Data
public class AttendanceRequestDTO {
    private Integer enrollmentId;
    private Date attendanceDate;
    private String status;
}
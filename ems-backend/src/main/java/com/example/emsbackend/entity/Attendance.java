package com.example.emsbackend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;

@Entity
@Data
@Table(name = "Attendance")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "AttendanceID")
    private Integer attendanceId;

    @Column(name = "EnrollmentID")
    private Integer enrollmentId;

    @Column(name = "AttendanceDate")
    @Temporal(TemporalType.DATE)
    private Date attendanceDate;

    @Column(name = "Status")
    private String status; // Usually "Present", "Absent", or "Late"
}
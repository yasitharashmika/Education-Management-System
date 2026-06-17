package com.example.emsbackend.service;

import com.example.emsbackend.dto.AttendanceRequestDTO;
import com.example.emsbackend.entity.Attendance;
import java.util.List;

public interface AttendanceService {
    List<Attendance> getAllAttendances();
    Attendance saveAttendance(AttendanceRequestDTO attendanceDTO);
}
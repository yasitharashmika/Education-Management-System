package com.example.emsbackend.controller;

import com.example.emsbackend.dto.AttendanceRequestDTO;
import com.example.emsbackend.entity.Attendance;
import com.example.emsbackend.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @GetMapping
    public List<Attendance> getAllAttendances() {
        return attendanceService.getAllAttendances();
    }

    @PostMapping
    public Attendance markAttendance(@RequestBody AttendanceRequestDTO attendanceDTO) {
        return attendanceService.saveAttendance(attendanceDTO);
    }
}
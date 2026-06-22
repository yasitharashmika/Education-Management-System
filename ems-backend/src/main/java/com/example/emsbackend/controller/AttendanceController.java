package com.example.emsbackend.controller;

import com.example.emsbackend.dto.AttendanceDTO;
import com.example.emsbackend.dto.AttendanceRosterDTO;
import com.example.emsbackend.dto.AttendanceSaveRequestDTO;
import com.example.emsbackend.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    // ==========================================
    // FACULTY ENDPOINTS
    // ==========================================

    @GetMapping("/roster")
    public ResponseEntity<List<AttendanceRosterDTO>> getRoster(
            @RequestParam Integer courseId,
            @RequestParam String date,
            @RequestParam String academicYear,
            @RequestParam String semester) {
        return ResponseEntity.ok(attendanceService.getAttendanceRoster(courseId, date, academicYear, semester));
    }

    @PostMapping("/save")
    public ResponseEntity<String> saveAttendance(@RequestBody List<AttendanceSaveRequestDTO> payload) {
        attendanceService.saveBulkAttendance(payload);
        return ResponseEntity.ok("Attendance saved successfully");
    }

    // ==========================================
    // STUDENT ENDPOINT
    // ==========================================

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AttendanceDTO>> getStudentAttendance(@PathVariable Integer studentId) {
        return ResponseEntity.ok(attendanceService.getAttendanceByStudent(studentId));
    }
}
package com.example.emsbackend.service;

import com.example.emsbackend.dto.AttendanceDTO;
import com.example.emsbackend.dto.AttendanceRosterDTO;
import com.example.emsbackend.dto.AttendanceSaveRequestDTO;
import java.util.List;

public interface AttendanceService {
    // --- Faculty Methods ---
    List<AttendanceRosterDTO> getAttendanceRoster(Integer courseId, String date, String academicYear, String semester);
    void saveBulkAttendance(List<AttendanceSaveRequestDTO> attendanceList);

    // --- Student Method ---
    List<AttendanceDTO> getAttendanceByStudent(Integer studentId);
}
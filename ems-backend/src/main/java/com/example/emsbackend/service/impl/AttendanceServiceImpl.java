package com.example.emsbackend.service.impl;

import com.example.emsbackend.dto.AttendanceDTO;
import com.example.emsbackend.dto.AttendanceRosterDTO;
import com.example.emsbackend.dto.AttendanceSaveRequestDTO;
import com.example.emsbackend.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
// --> ADDED: Required for the automated batch job
import org.springframework.scheduling.annotation.Scheduled;

import java.util.List;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // ==========================================
    // FACULTY: MARK ATTENDANCE
    // ==========================================

    @Override
    public List<AttendanceRosterDTO> getAttendanceRoster(Integer courseId, String date, String academicYear, String semester) {
        String sql = "EXEC sp_GetAttendanceRoster ?, ?, ?, ?";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            AttendanceRosterDTO dto = new AttendanceRosterDTO();
            dto.setEnrollmentId(rs.getInt("EnrollmentID"));
            dto.setStudentId(rs.getInt("StudentID"));
            dto.setIndexNumber(rs.getString("FormattedIndex"));
            dto.setStudentName(rs.getString("StudentName"));
            dto.setStatus(rs.getString("Status"));
            return dto;
        }, courseId, date, academicYear, semester);
    }

    @Override
    @Transactional
    public void saveBulkAttendance(List<AttendanceSaveRequestDTO> attendanceList) {
        String sql = "EXEC sp_SaveAttendance ?, ?, ?";

        for (AttendanceSaveRequestDTO record : attendanceList) {
            jdbcTemplate.update(sql,
                    record.getEnrollmentId(),
                    record.getAttendanceDate(),
                    record.getStatus()
            );
        }
    }

    // ==========================================
    // STUDENT: VIEW ATTENDANCE
    // ==========================================

    @Override
    public List<AttendanceDTO> getAttendanceByStudent(Integer studentId) {
        String sql = "EXEC sp_GetAttendanceByStudent ?";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            AttendanceDTO dto = new AttendanceDTO();
            dto.setAttendanceDate(rs.getString("AttendanceDate"));
            dto.setCourseCode(rs.getString("CourseCode"));
            dto.setCourseName(rs.getString("CourseName"));
            dto.setStatus(rs.getString("Status"));
            return dto;
        }, studentId);
    }

    // =========================================================================
    // --> ADDED: Automated Batch Job for the Viva (Attendance Cursor Execution)
    // =========================================================================

    // This tells Spring Boot to run this cursor automatically every morning at 8:00 AM
    @Scheduled(cron = "0 0 8 * * ?")
    public void runDailyAttendanceWarningCursor() {
        System.out.println("Starting daily attendance warning cursor...");
        // This executes your SQL Cursor file (04_generate_low_attendance_warnings.sql)
        jdbcTemplate.execute("EXEC sp_GenerateLowAttendanceWarnings");
        System.out.println("Daily attendance check completed.");
    }
}
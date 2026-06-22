package com.example.emsbackend.service.impl;

import com.example.emsbackend.dto.AttendanceDTO;
import com.example.emsbackend.dto.AttendanceRosterDTO;
import com.example.emsbackend.dto.AttendanceSaveRequestDTO;
import com.example.emsbackend.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
}
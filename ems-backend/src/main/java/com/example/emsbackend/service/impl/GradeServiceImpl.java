package com.example.emsbackend.service.impl;

import com.example.emsbackend.dto.GradeRosterDTO;
import com.example.emsbackend.dto.GradeSaveRequestDTO;
import com.example.emsbackend.dto.FacultyAssignmentDTO;
import com.example.emsbackend.dto.GradeReportDTO;
import com.example.emsbackend.service.GradeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
// --> ADDED: Required for the automated batch job
import org.springframework.scheduling.annotation.Scheduled;

import java.util.List;

@Service
public class GradeServiceImpl implements GradeService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public List<GradeRosterDTO> getCourseRoster(Integer courseId, String academicYear, String semester) {
        String sql = "EXEC sp_GetCourseRoster ?, ?, ?";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            GradeRosterDTO dto = new GradeRosterDTO();
            dto.setStudentId(rs.getInt("StudentID"));
            dto.setIndexNumber(rs.getString("FormattedIndex"));
            dto.setStudentName(rs.getString("StudentName"));
            dto.setMidtermMarks(rs.getDouble("MidtermMarks"));
            dto.setFinalMarks(rs.getDouble("FinalMarks"));
            return dto;
        }, courseId, academicYear, semester);
    }

    @Override
    @Transactional
    public void saveGrades(List<GradeSaveRequestDTO> gradeList) {
        // --> FIX: This now has 6 question marks to match the SQL Procedure <--
        String sql = "EXEC sp_SaveStudentGrade ?, ?, ?, ?, ?, ?";

        for (GradeSaveRequestDTO grade : gradeList) {
            jdbcTemplate.update(sql,
                    grade.getStudentId(),
                    grade.getCourseId(),
                    grade.getAcademicYear(), // --> FIX: Passed to SQL
                    grade.getSemester(),     // --> FIX: Passed to SQL
                    grade.getMidtermMarks(),
                    grade.getFinalMarks()
            );
        }
    }

    @Override
    public List<FacultyAssignmentDTO> getFacultyAssignments(Integer facultyId) {
        String sql = "EXEC sp_GetFacultyAssignments ?";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            FacultyAssignmentDTO dto = new FacultyAssignmentDTO();
            dto.setCourseId(rs.getInt("CourseID"));
            dto.setCourseCode(rs.getString("CourseCode"));
            dto.setCourseName(rs.getString("CourseName"));
            dto.setAcademicYear(rs.getString("AcademicYear"));
            dto.setSemester(rs.getString("Semester"));
            return dto;
        }, facultyId);
    }

    @Override
    public List<GradeReportDTO> getStudentReportCard(Integer systemUserId) {
        Integer trueStudentId = resolveStudentId(systemUserId);
        String sql = "EXEC sp_GetStudentReportCard ?";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            GradeReportDTO dto = new GradeReportDTO();
            dto.setAcademicYear(rs.getString("AcademicYear"));
            dto.setSemester(rs.getString("Semester"));
            dto.setCourseCode(rs.getString("CourseCode"));
            dto.setCourseName(rs.getString("CourseName"));
            dto.setCredits(rs.getInt("Credits"));
            dto.setMidtermMarks(rs.getDouble("MidtermMarks"));
            dto.setFinalMarks(rs.getDouble("FinalMarks"));
            dto.setTotalMarks(rs.getDouble("TotalMarks"));
            dto.setLetterGrade(rs.getString("LetterGrade"));
            dto.setGpaPoints(rs.getDouble("GPAPoints"));
            return dto;
        }, trueStudentId);
    }

    // Helper to map SystemUser ID to Student ID securely
    private Integer resolveStudentId(Integer systemUserId) {
        if (systemUserId == null) {
            throw new RuntimeException("User session is invalid.");
        }
        String sql = "SELECT StudentID FROM Student WHERE Email = (SELECT Email FROM SystemUser WHERE UserId = ?)";
        try {
            return jdbcTemplate.queryForObject(sql, Integer.class, systemUserId);
        } catch (EmptyResultDataAccessException e) {
            throw new RuntimeException("Action denied: No Student profile found for this account.");
        }
    }

    // =========================================================================
    // --> ADDED: Automated Batch Job for the Viva (Cursor Execution)
    // =========================================================================

    // This tells Spring Boot to run this method automatically every night at midnight
    @Scheduled(cron = "0 0 0 * * ?")
    public void runNightlyGpaCursor() {
        System.out.println("Starting nightly GPA refresh cursor...");
        // This executes your SQL Cursor file (06_refresh_all_gpas.sql)
        jdbcTemplate.execute("EXEC sp_RefreshAllGPAs");
        System.out.println("Nightly GPA refresh completed.");
    }
}
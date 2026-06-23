package com.example.emsbackend.service.impl;

import com.example.emsbackend.dto.EnrollmentRequestDTO;
import com.example.emsbackend.entity.Enrollment;
import com.example.emsbackend.repository.EnrollmentRepository;
import com.example.emsbackend.service.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException; // NEW IMPORT
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EnrollmentServiceImpl implements EnrollmentService {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public List<Enrollment> getAllEnrollments() {
        return enrollmentRepository.findAll();
    }

    @Override
    @Transactional
    public Enrollment saveEnrollment(EnrollmentRequestDTO dto) {

        // --- NEW: Map the SystemUser ID to the true Student ID ---
        Integer trueStudentId = resolveStudentId(dto.getStudentId());
        Integer facultyId = (dto.getFacultyId() == null) ? 1 : dto.getFacultyId();

        System.out.println("DEBUG - Sending to SQL Procedure:");
        System.out.println("1. True Student ID: " + trueStudentId);
        System.out.println("2. Course ID: " + dto.getCourseId());
        System.out.println("3. Faculty ID: " + facultyId);
        System.out.println("4. Year: " + dto.getAcademicYear());
        System.out.println("5. Sem: " + dto.getSemester());

        // The exact strict order matching our new SQL Procedure!
        String sql = "EXEC sp_EnrollStudent ?, ?, ?, ?, ?";

        jdbcTemplate.update(sql,
                trueStudentId, // Pushing the mapped database ID
                dto.getCourseId(),
                facultyId,
                dto.getAcademicYear(),
                dto.getSemester()
        );

        Enrollment saved = new Enrollment();
        saved.setStudentId(trueStudentId);
        saved.setCourseId(dto.getCourseId());
        saved.setFacultyId(facultyId);
        saved.setAcademicYear(dto.getAcademicYear());
        saved.setSemester(dto.getSemester());
        saved.setStatus("Active - Enrolled via Proc");

        return saved;
    }

    // Helper method to bridge the Auth ID to the Domain ID safely
    private Integer resolveStudentId(Integer systemUserId) {
        String sql = "SELECT StudentID FROM Student WHERE Email = (SELECT Email FROM SystemUser WHERE UserId = ?)";
        try {
            return jdbcTemplate.queryForObject(sql, Integer.class, systemUserId);
        } catch (EmptyResultDataAccessException e) {
            // This catches the exact scenario where a Lecturer or Admin tries to pay/enroll
            throw new RuntimeException("Action denied: No Student profile found for this account. Only registered students can perform this action.");
        } catch (Exception e) {
            // Catches any other generic database mapping errors
            throw new RuntimeException("Database error mapping System User ID " + systemUserId + " to Student profile.");
        }
    }
}
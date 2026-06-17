package com.example.emsbackend.service.impl;

import com.example.emsbackend.dto.EnrollmentRequestDTO;
import com.example.emsbackend.entity.Enrollment;
import com.example.emsbackend.repository.EnrollmentRepository;
import com.example.emsbackend.service.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EnrollmentServiceImpl implements EnrollmentService {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Override
    public List<Enrollment> getAllEnrollments() {
        return enrollmentRepository.findAll();
    }

    @Override
    public Enrollment saveEnrollment(EnrollmentRequestDTO dto) {
        // 1. Execute the T-SQL Procedure to enforce double-enrollment checks
        enrollmentRepository.enrollStudentProc(
                dto.getStudentId(),
                dto.getCourseId(),
                dto.getFacultyId(),
                dto.getAcademicYear(),
                dto.getSemester()
        );

        // 2. Return a placeholder entity so the Controller doesn't crash
        Enrollment saved = new Enrollment();
        saved.setStudentId(dto.getStudentId());
        saved.setCourseId(dto.getCourseId());
        saved.setFacultyId(dto.getFacultyId());
        saved.setAcademicYear(dto.getAcademicYear());
        saved.setSemester(dto.getSemester());
        saved.setStatus("Active - Enrolled via Proc");

        return saved;
    }
}
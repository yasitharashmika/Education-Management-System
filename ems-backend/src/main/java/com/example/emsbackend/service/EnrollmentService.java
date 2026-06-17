package com.example.emsbackend.service;

import com.example.emsbackend.dto.EnrollmentRequestDTO;
import com.example.emsbackend.entity.Enrollment;
import java.util.List;

public interface EnrollmentService {
    List<Enrollment> getAllEnrollments();
    Enrollment saveEnrollment(EnrollmentRequestDTO enrollmentDTO);
}
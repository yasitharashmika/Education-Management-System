package com.example.emsbackend.controller;

import com.example.emsbackend.dto.EnrollmentRequestDTO;
import com.example.emsbackend.entity.Enrollment;
import com.example.emsbackend.service.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin(origins = "*")
public class EnrollmentController {

    @Autowired
    private EnrollmentService enrollmentService;

    @GetMapping
    public List<Enrollment> getAllEnrollments() {
        return enrollmentService.getAllEnrollments();
    }

    @PostMapping
    public Enrollment createEnrollment(@RequestBody EnrollmentRequestDTO enrollmentDTO) {
        return enrollmentService.saveEnrollment(enrollmentDTO);
    }
}
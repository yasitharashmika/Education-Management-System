package com.example.emsbackend.controller;

import com.example.emsbackend.dto.GradeRosterDTO;
import com.example.emsbackend.dto.GradeSaveRequestDTO;
import com.example.emsbackend.dto.FacultyAssignmentDTO;
import com.example.emsbackend.dto.GradeReportDTO;
import com.example.emsbackend.service.GradeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/grades")
@CrossOrigin(origins = "http://localhost:3000")
public class GradeController {

    @Autowired
    private GradeService gradeService;

    @GetMapping("/roster")
    public ResponseEntity<List<GradeRosterDTO>> getRoster(
            @RequestParam Integer courseId,
            @RequestParam String academicYear,
            @RequestParam String semester) {
        return ResponseEntity.ok(gradeService.getCourseRoster(courseId, academicYear, semester));
    }
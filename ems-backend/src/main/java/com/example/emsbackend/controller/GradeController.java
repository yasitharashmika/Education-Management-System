package com.example.emsbackend.controller;

import com.example.emsbackend.dto.GradeRequestDTO;
import com.example.emsbackend.entity.Grade;
import com.example.emsbackend.service.GradeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grades")
@CrossOrigin(origins = "*")
public class GradeController {

    @Autowired
    private GradeService gradeService;

    @GetMapping
    public List<Grade> getAllGrades() {
        return gradeService.getAllGrades();
    }

    @PostMapping
    public Grade createGrade(@RequestBody GradeRequestDTO gradeDTO) {
        return gradeService.saveGrade(gradeDTO);
    }
}
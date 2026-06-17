package com.example.emsbackend.service;

import com.example.emsbackend.dto.GradeRequestDTO;
import com.example.emsbackend.entity.Grade;
import java.util.List;

public interface GradeService {
    List<Grade> getAllGrades();
    Grade saveGrade(GradeRequestDTO gradeDTO);
}
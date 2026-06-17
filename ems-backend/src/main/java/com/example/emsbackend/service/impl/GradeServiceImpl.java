package com.example.emsbackend.service.impl;

import com.example.emsbackend.dto.GradeRequestDTO;
import com.example.emsbackend.entity.Grade;
import com.example.emsbackend.repository.GradeRepository;
import com.example.emsbackend.service.GradeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GradeServiceImpl implements GradeService {

    @Autowired
    private GradeRepository gradeRepository;

    @Override
    public List<Grade> getAllGrades() {
        return gradeRepository.findAll();
    }

    @Override
    public Grade saveGrade(GradeRequestDTO dto) {
        Grade gradeEntity = new Grade();

        gradeEntity.setEnrollmentId(dto.getEnrollmentId());
        gradeEntity.setMidtermMarks(dto.getMidtermMarks());
        gradeEntity.setFinalMarks(dto.getFinalMarks());

        // We do NOT set LetterGrade or GPAPoints here!
        // The SQL Server Trigger trg_CalculateGrade will do that automatically.

        return gradeRepository.save(gradeEntity);
    }
}
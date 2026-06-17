package com.example.emsbackend.service.impl;

import com.example.emsbackend.dto.CourseResultDTO;
import com.example.emsbackend.dto.ReportCardDTO;
import com.example.emsbackend.repository.StudentRepository;
import com.example.emsbackend.service.ReportCardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ReportCardServiceImpl implements ReportCardService {

    @Autowired
    private StudentRepository studentRepository;

    @Override
    public ReportCardDTO getReportCard(Integer studentId) {
        // 1. Execute the T-SQL Procedure
        List<Object[]> rawResults = studentRepository.getStudentReportCard(studentId);

        List<CourseResultDTO> courseResults = new ArrayList<>();

        // 2. Map the raw SQL rows to our Java DTO
        for (Object[] row : rawResults) {
            CourseResultDTO result = new CourseResultDTO();
            result.setCourseCode((String) row[0]);
            result.setCourseName((String) row[1]);
            result.setCredits(((Number) row[2]).intValue());
            result.setMidtermMarks(((Number) row[3]).doubleValue());
            result.setFinalMarks(((Number) row[4]).doubleValue());
            result.setLetterGrade((String) row[5]);
            result.setGpaPoints(((Number) row[6]).doubleValue());

            courseResults.add(result);
        }

        // 3. Package it all up!
        ReportCardDTO finalReport = new ReportCardDTO();
        finalReport.setStudentId(studentId);
        finalReport.setResults(courseResults);

        return finalReport;
    }
}
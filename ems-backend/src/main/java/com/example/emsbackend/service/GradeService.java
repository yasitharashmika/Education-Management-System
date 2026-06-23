package com.example.emsbackend.service;

import com.example.emsbackend.dto.GradeRosterDTO;
import com.example.emsbackend.dto.GradeSaveRequestDTO;
import com.example.emsbackend.dto.FacultyAssignmentDTO;
import com.example.emsbackend.dto.GradeReportDTO;
import java.util.List;

public interface GradeService {
    List<GradeRosterDTO> getCourseRoster(Integer courseId, String academicYear, String semester);
    void saveGrades(List<GradeSaveRequestDTO> gradeList);
    List<FacultyAssignmentDTO> getFacultyAssignments(Integer facultyId);

    // NEW: Fetch report card
    List<GradeReportDTO> getStudentReportCard(Integer systemUserId);
}
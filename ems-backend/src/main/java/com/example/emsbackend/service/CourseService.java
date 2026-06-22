package com.example.emsbackend.service;

import com.example.emsbackend.dto.CourseDTO;
import com.example.emsbackend.dto.CourseAllocationViewDTO;
import com.example.emsbackend.dto.LecturerDropdownDTO;
import com.example.emsbackend.dto.AssignLecturerRequestDTO;
import com.example.emsbackend.entity.Course;

import java.util.List;
import java.util.Map;

public interface CourseService {
    // --- Existing Methods ---
    List<Course> getAllCourses();
    Course createCourse(CourseDTO courseDTO);
    Course updateCourse(Integer id, CourseDTO courseDTO);
    void deleteCourse(Integer id);

    List<Map<String, Object>> getEnrolledStudents(Integer courseId);
    void removeStudentFromCourse(Integer courseId, Integer userId);
    void removeAllStudentsFromCourse(Integer courseId);

    // --- NEW: Lecturer Assignment Methods ---
    List<CourseAllocationViewDTO> getAllCourseAllocations();
    List<LecturerDropdownDTO> getAvailableLecturers();
    void assignLecturer(AssignLecturerRequestDTO requestDTO);
}
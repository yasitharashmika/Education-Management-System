package com.example.emsbackend.service;

import com.example.emsbackend.dto.CourseRequestDTO;
import com.example.emsbackend.entity.Course;
import java.util.List;

public interface CourseService {
    List<Course> getAllCourses();
    Course saveCourse(CourseRequestDTO courseDTO);
}
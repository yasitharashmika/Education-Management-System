package com.example.emsbackend.controller;

import com.example.emsbackend.dto.CourseRequestDTO;
import com.example.emsbackend.entity.Course;
import com.example.emsbackend.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @GetMapping
    public List<Course> getAllCourses() {
        return courseService.getAllCourses();
    }

    @PostMapping
    public Course createCourse(@RequestBody CourseRequestDTO courseDTO) {
        return courseService.saveCourse(courseDTO);
    }
}
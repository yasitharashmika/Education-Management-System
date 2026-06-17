package com.example.emsbackend.service.impl;

import com.example.emsbackend.dto.CourseRequestDTO;
import com.example.emsbackend.entity.Course;
import com.example.emsbackend.repository.CourseRepository;
import com.example.emsbackend.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseServiceImpl implements CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Override
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @Override
    public Course saveCourse(CourseRequestDTO dto) {
        Course courseEntity = new Course();

        courseEntity.setDepartmentId(dto.getDepartmentId());
        courseEntity.setCourseCode(dto.getCourseCode());
        courseEntity.setCourseName(dto.getCourseName());
        courseEntity.setCredits(dto.getCredits());
        courseEntity.setSemester(dto.getSemester());

        return courseRepository.save(courseEntity);
    }
}
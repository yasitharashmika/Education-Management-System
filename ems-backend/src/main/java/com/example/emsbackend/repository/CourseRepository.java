package com.example.emsbackend.repository;

import com.example.emsbackend.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Integer> {
    // Custom query to prevent duplicate course codes
    Optional<Course> findByCourseCode(String courseCode);
}
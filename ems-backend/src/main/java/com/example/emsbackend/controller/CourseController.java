package com.example.emsbackend.controller;

import com.example.emsbackend.dto.CourseDTO;
import com.example.emsbackend.dto.CourseAllocationViewDTO;
import com.example.emsbackend.dto.LecturerDropdownDTO;
import com.example.emsbackend.dto.AssignLecturerRequestDTO;
import com.example.emsbackend.entity.Course;
import com.example.emsbackend.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "http://localhost:3000")
public class CourseController {

    @Autowired
    private CourseService courseService;

    // ==========================================
    // EXISTING ENDPOINTS
    // ==========================================

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @PostMapping("/create")
    public ResponseEntity<?> createCourse(@RequestBody CourseDTO dto) {
        try {
            return ResponseEntity.ok(courseService.createCourse(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCourse(@PathVariable Integer id, @RequestBody CourseDTO dto) {
        try {
            return ResponseEntity.ok(courseService.updateCourse(id, dto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Integer id) {
        try {
            courseService.deleteCourse(id);
            return ResponseEntity.ok(Map.of("message", "Course deleted successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}/students")
    public ResponseEntity<?> getEnrolledStudents(@PathVariable Integer id) {
        return ResponseEntity.ok(courseService.getEnrolledStudents(id));
    }

    @DeleteMapping("/{courseId}/students/{userId}")
    public ResponseEntity<?> removeStudent(@PathVariable Integer courseId, @PathVariable Integer userId) {
        try {
            courseService.removeStudentFromCourse(courseId, userId);
            return ResponseEntity.ok(Map.of("message", "Student successfully removed from the module."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{courseId}/students/clear-all")
    public ResponseEntity<?> removeAllStudents(@PathVariable Integer courseId) {
        try {
            courseService.removeAllStudentsFromCourse(courseId);
            return ResponseEntity.ok(Map.of("message", "All students have been successfully removed from the module."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    // ==========================================
    // NEW: LECTURER ASSIGNMENT ENDPOINTS
    // ==========================================

    @GetMapping("/allocations")
    public ResponseEntity<List<CourseAllocationViewDTO>> getCourseAllocations() {
        return ResponseEntity.ok(courseService.getAllCourseAllocations());
    }

    @GetMapping("/lecturers")
    public ResponseEntity<List<LecturerDropdownDTO>> getAvailableLecturers() {
        return ResponseEntity.ok(courseService.getAvailableLecturers());
    }

    @PostMapping("/assign-lecturer")
    public ResponseEntity<?> assignLecturer(@RequestBody AssignLecturerRequestDTO payload) {
        try {
            courseService.assignLecturer(payload);
            return ResponseEntity.ok(Map.of("message", "Lecturer assigned successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Database error occurred"));
        }
    }
}
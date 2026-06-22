package com.example.emsbackend.controller;

import com.example.emsbackend.dto.StudentProfileDTO;
import com.example.emsbackend.dto.StudentRequestDTO;
import com.example.emsbackend.entity.Student;
import com.example.emsbackend.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*") // Allows your React frontend to connect
public class StudentController {

    @Autowired
    private StudentService studentService;

    // GET Endpoint: Fetch all students
    @GetMapping
    public List<Student> getAllStudents() {
        return studentService.getAllStudents();
    }

    // POST Endpoint: Create a new student
    @PostMapping
    public Student createStudent(@RequestBody StudentRequestDTO studentDTO) {
        return studentService.saveStudent(studentDTO);
    }

    // NEW GET Endpoint: Fetch the dynamically generated student profile
    @GetMapping("/profile/{studentId}")
    public ResponseEntity<StudentProfileDTO> getStudentProfile(@PathVariable Integer studentId) {
        StudentProfileDTO profile = studentService.getStudentProfile(studentId);
        return ResponseEntity.ok(profile);
    }
}